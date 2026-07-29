import logger from '../utils/logger.js';

const NVIDIA_API_URL = process.env.NVIDIA_NIM_API_URL || 'https://integrate.api.nvidia.com/v1';

const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
  'Content-Type': 'application/json',
});

export const generateTutorResponse = async (question, context = '', language = 'en') => {
  const languageMap = {
    'en': 'English',
    'hi': 'Hindi (write in Devanagari script only)',
    'hi-en': 'Hinglish (Hindi words written in English/Roman script)',
    'mr': 'Marathi (write in Devanagari script only)',
  };

  const langName = languageMap[language] || 'English';

  const systemPrompt = `You are Vividya, a helpful AI tutor for Indian college students.

CRITICAL RULE: You MUST respond ONLY in ${langName}. Do NOT mix languages. Do NOT use any other language.

${language === 'hi' ? 'Write your ENTIRE response in Hindi using Devanagari script. Example: नमस्ते, आज हम पढ़ेंगे।' : ''}
${language === 'mr' ? 'Write your ENTIRE response in Marathi using Devanagari script. Example: नमस्कार, आज आपण शिकूय।' : ''}
${language === 'hi-en' ? 'Write your ENTIRE response in Hinglish using Roman/English script. Example: Hello, aaj hum padhenge.' : ''}
${language === 'en' ? 'Write your ENTIRE response in plain English only.' : ''}

Rules:
- Keep responses concise (200-300 words max)
- Use simple language a college student would understand
- Be helpful and encouraging
- If notes context is provided, use it for personalized answers`;

  const userPrompt = context
    ? `Context from student's notes:\n${context}\n\nStudent asks: ${question}`
    : `Student asks: ${question}`;

  try {
    const response = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NVIDIA API error: ${error}`);
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;
    logger.info(`LLM response generated: ${aiText.substring(0, 50)}...`);

    return {
      text: aiText,
      confidence: 0.9,
      modelUsed: 'meta/llama-3.1-8b-instruct',
    };
  } catch (error) {
    logger.error(`NVIDIA LLM failed: ${error.message}`);
    throw error;
  }
};

export const summarizeNotes = async (extractedText, subject = '') => {
  const systemPrompt = `You are an expert summarizer for Indian college students. Create:
1. A concise summary (100-200 words)
2. 5-7 key points (bullet format)
3. Difficulty level (easy/medium/hard)
Keep the summary in the same language as input. Format output as JSON:
{"summary": "...", "keyPoints": ["..."], "difficulty": "medium"}`;

  try {
    const response = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Subject: ${subject}\n\nText:\n${extractedText.substring(0, 8000)}` },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NVIDIA summarization error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      summary: content.substring(0, 500),
      keyPoints: [],
      difficulty: 'medium',
    };
  } catch (error) {
    logger.error(`Note summarization failed: ${error.message}`);
    throw error;
  }
};

export const generateQuiz = async (summary, keyPoints, difficulty = 'medium') => {
  const prompt = `Based on these key points, generate 3 multiple-choice questions.
Key Points:
${keyPoints.join('\n')}

Difficulty: ${difficulty}

Format each question exactly as JSON array:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B",
    "difficulty": "${difficulty}"
  }
]`;

  try {
    const response = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NVIDIA quiz gen error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    logger.error(`Quiz generation failed: ${error.message}`);
    return [];
  }
};

export const generateEmbedding = async (text, inputType = 'passage') => {
  try {
    const response = await fetch(`${NVIDIA_API_URL}/embeddings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'nvidia/nv-embedqa-e5-v5',
        input: text.substring(0, 2000),
        encoding_format: 'float',
        input_type: inputType,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embedding generation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    logger.error(`Embedding generation failed: ${error.message}`);
    return null;
  }
};

export const translateText = async (text, targetLanguage = 'en') => {
  const languageMap = {
    'en': 'English',
    'hi': 'Hindi (write in Devanagari script only)',
    'hi-en': 'Hinglish (Hindi words written in English/Roman script)',
    'mr': 'Marathi (write in Devanagari script only)',
  };

  const langName = languageMap[targetLanguage] || 'English';

  const systemPrompt = `You are a translator. Translate the user's text into ${langName}.
CRITICAL RULE: Translate the text accurately, keeping the same formatting (markdown, bolding, lists, line breaks). Respond ONLY with the translation. Do NOT add any notes, conversational comments, or explanations.`;

  try {
    const response = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NVIDIA translation error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    logger.error(`NVIDIA translation failed: ${error.message}`);
    throw error;
  }
};
