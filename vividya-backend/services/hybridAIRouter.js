import * as nvidiaService from './nvidiaService.js';
import User from '../models/User.js';
import ModelInferenceLog from '../models/ModelInferenceLog.js';
import logger from '../utils/logger.js';

// ─── Model Registry ─────────────────────────────────────────────
const MODELS = {
  fast: {
    id: 'meta/llama-3.1-8b-instruct',
    label: 'Llama 3.1 8B (Fast)',
    costPerToken: 0.0000002,
    maxTokens: 1024,
    temperature: 0.7,
  },
  strong: {
    id: 'meta/llama-3.1-70b-instruct',
    label: 'Llama 3.1 70B (Strong)',
    costPerToken: 0.000001,
    maxTokens: 2048,
    temperature: 0.6,
  },
};

// ─── Query Classifier ───────────────────────────────────────────
const CLASSIFICATION_RULES = {
  reasoning: {
    keywords: [
      'step by step', 'step-by-step', 'derive', 'derivation', 'prove', 'proof',
      'explain the logic', 'walk through', 'walkthrough', 'algorithm walkthrough',
      'how does it work internally', 'what happens internally', 'trace',
      'dry run', 'simulate', 'analyze the time complexity', 'space complexity',
      'optimize', 'refactor', 'why is this better', 'trade-off', 'tradeoff',
    ],
    patterns: [
      /explain\s+(how|why)\s+.+\s+(step|in detail|thoroughly)/i,
      /(derive|proof|prove)\s+(that|the|why)/i,
      /(trace|dry.?run|simulate)\s+(the|this|an?)\s+/i,
      /(time|space)\s+complexity\s+(of|for|analysis)/i,
    ],
    weight: 3,
  },
  complex: {
    keywords: [
      'compare and contrast', 'difference between', 'advantages and disadvantages',
      'pros and cons', 'which is better', 'when to use', 'real-world application',
      'system design', 'architecture', 'design pattern', 'scalability',
      'implement', 'build a', 'write code', 'code for', 'create a program',
      'debug', 'fix this error', 'why is this not working', 'exception',
      'multi-step', 'multi step', 'complex', 'advanced',
      'explain', 'describe', 'elaborate', 'discuss',
      'why', 'how does', 'how do', 'how is',
      'with examples', 'with example', 'give example', 'give examples',
      'important', 'significance', 'role of', 'purpose of',
    ],
    patterns: [
      /(compare|contrast)\s+.+\s+(with|and|vs|versus)/i,
      /(advantages|disadvantages|pros|cons)\s+(of|and)/i,
      /(implement|build|create|write)\s+(a|an|the)\s+.+\b(code|program|function|class)/i,
      /(why|how)\s+.+\s+(error|exception|fail|broken|wrong)/i,
      /design\s+(a|an|the)\s+(system|architecture|database|api)/i,
      /explain\s+.+\s+(with|in detail|thoroughly|step|example)/i,
      /why\s+(is|are|do|does|should)\s+.+\s+(important|necessary|used)/i,
    ],
    weight: 2,
  },
  simple: {
    keywords: [
      'what is', 'what are', 'define', 'definition', 'meaning', 'meaning of',
      'who is', 'who invented', 'when was', 'when did', 'where is',
      'list', 'name', 'mention', 'give example', 'examples of',
      'is it true', 'can you', 'tell me about', 'brief about',
      'difference between', 'formula', 'syntax',
    ],
    patterns: [
      /^(what|who|when|where|define|list|name|give|tell)\s/i,
      /what\s+(is|are|does|do|was|were)\s/i,
      /can\s+you\s+(explain|tell|define|list)/i,
    ],
    weight: 1,
  },
};

const SUBJECT_KEYWORDS = {
  'Data Structures': ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'heap', 'bst', 'binary tree', 'sorting', 'searching'],
  'Algorithms': ['algorithm', 'recursion', 'dynamic programming', 'greedy', 'divide and conquer', 'backtracking', ' complexity', 'big o', 'bubble sort', 'quick sort', 'merge sort'],
  'DBMS': ['database', 'sql', 'query', 'table', 'join', 'normalization', 'index', 'transaction', 'acid', 'schema', 'mongodb', 'nosql'],
  'Operating Systems': ['process', 'thread', 'scheduling', 'deadlock', 'memory management', 'virtual memory', 'paging', 'segmentation', 'semaphore', 'mutex', 'os'],
  'Computer Networks': ['tcp', 'udp', 'http', 'https', 'ip address', 'dns', ' OSI', 'network', 'routing', 'socket', 'protocol', 'subnet'],
  'Machine Learning': ['machine learning', 'neural network', 'regression', 'classification', 'clustering', 'supervised', 'unsupervised', 'deep learning', 'training', 'model'],
  'Mathematics': ['math', 'calculus', 'algebra', 'probability', 'statistics', 'matrix', 'derivative', 'integral', 'equation'],
  'Physics': ['physics', 'newton', 'velocity', 'acceleration', 'force', 'energy', 'quantum', 'thermodynamics'],
};

function detectSubjects(message) {
  const msg = message.toLowerCase();
  const detected = [];
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some(kw => msg.includes(kw))) {
      detected.push(subject);
    }
  }
  return detected;
}

function scoreQuery(message) {
  const msg = message.toLowerCase().trim();
  const scores = { reasoning: 0, complex: 0, simple: 0 };
  const details = { matchedRules: [], detectedSubjects: detectSubjects(msg) };

  // Score each category
  for (const [category, rules] of Object.entries(CLASSIFICATION_RULES)) {
    // Keyword matching
    for (const kw of rules.keywords) {
      if (msg.includes(kw)) {
        scores[category] += rules.weight;
        details.matchedRules.push({ category, rule: 'keyword', value: kw });
      }
    }

    // Pattern matching
    for (const pattern of rules.patterns) {
      if (pattern.test(msg)) {
        scores[category] += rules.weight * 1.5;
        details.matchedRules.push({ category, rule: 'pattern', value: pattern.source });
      }
    }
  }

  // Length-based adjustment
  if (msg.length > 200) scores.complex += 1;
  if (msg.length > 400) scores.complex += 2;
  if (msg.length < 30) scores.simple += 1;

  // Multi-question detection
  const questionMarks = (msg.match(/\?/g) || []).length;
  if (questionMarks >= 2) scores.complex += 1;
  if (questionMarks >= 3) scores.complex += 1;

  // Code block detection
  if (msg.includes('```') || msg.includes('code') || msg.includes('function') || msg.includes('def ')) {
    scores.complex += 1;
  }

  // Math/derivation detection
  if (/[=+\-*/^∫∑∏√]|equation|formula|solve for/i.test(msg)) {
    scores.reasoning += 1;
  }

  // Pick winner
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0][1] > 0 ? sorted[0][0] : 'simple';
  const confidence = sorted[0][1] / (sorted[0][1] + sorted[1][1] + 1);

  return {
    category: winner,
    scores,
    confidence: parseFloat(confidence.toFixed(2)),
    subjects: details.detectedSubjects,
    matchedRules: details.matchedRules.slice(0, 5),
  };
}

function selectModel(category) {
  switch (category) {
    case 'reasoning': return MODELS.strong;
    case 'complex': return MODELS.strong;
    case 'simple': return MODELS.fast;
    default: return MODELS.fast;
  }
}

function buildSystemPrompt(category, language, subjects, hasContext) {
  const languageMap = {
    'en': 'English',
    'hi': 'Hindi (write in Devanagari script only)',
    'hi-en': 'Hinglish (Hindi words written in English/Roman script)',
    'mr': 'Marathi (write in Devanagari script only)',
  };
  const langName = languageMap[language] || 'English';

  const baseLangRules = `
CRITICAL: You MUST respond ONLY in ${langName}. Do NOT mix languages.
${language === 'hi' ? 'Write your ENTIRE response in Hindi using Devanagari script.' : ''}
${language === 'mr' ? 'Write your ENTIRE response in Marathi using Devanagari script.' : ''}
${language === 'hi-en' ? 'Write your ENTIRE response in Hinglish using Roman/English script.' : ''}
${language === 'en' ? 'Write your ENTIRE response in plain English only.' : ''}`;

  const subjectContext = subjects.length > 0
    ? `\nSubject area detected: ${subjects.join(', ')}. Tailor your response accordingly.`
    : '';

  const prompts = {
    simple: `You are Vividya, an AI tutor for Indian college students.
${baseLangRules}
${subjectContext}
Style: Give a clear, concise definition or explanation. Keep it under 150 words.
Use simple language. Be encouraging. Give a real-world example if helpful.`,

    complex: `You are Vividya, an advanced AI tutor for Indian college students.
${baseLangRules}
${subjectContext}
Style: Provide a thorough, structured analysis. Use headings or bullet points.
${hasContext ? 'Use the provided notes context to give personalized answers.' : ''}
Include comparisons, trade-offs, and practical applications. Keep under 300 words.`,

    reasoning: `You are Vividya, an expert AI tutor for Indian college students.
${baseLangRules}
${subjectContext}
Style: Walk through the reasoning step-by-step. Number your steps.
Show derivations, trace algorithms, or explain logic in detail.
Use code examples or pseudocode when relevant. Keep under 400 words.
Be thorough but clear — a student should be able to follow your reasoning.`,
  };

  return prompts[category] || prompts.simple;
}

// ─── Local Fallback ─────────────────────────────────────────────
function getLocalFallbackResponse(message, language) {
  const responses = {
    en: {
      default: "I'm Vividya! I can help with that. Could you rephrase your question so I can give you the best answer?",
    },
    hi: { default: "Main Vividya hoon! Main aapki madad kar sakti hoon. Kripya apna saval dohraen." },
    mr: { default: "मी विविध्या आहे! मी तुम्हाला मदत करू शकते. कृपया तुमचा प्रश्न पुन्हा सांगा." },
    'hi-en': { default: "Main Vividya hoon! Main aapki help kar sakti hoon. Apna question dobara bhejo." },
  };

  return {
    text: (responses[language] || responses.en).default,
    model: 'local-fallback',
    modelName: 'Local (Offline)',
    inputTokens: 0,
    outputTokens: 0,
    cost: 0,
    isOffline: true,
    classification: { category: 'offline', confidence: 0 },
  };
}

// ─── Main Router ────────────────────────────────────────────────
export const queryHybridAI = async (message, context = '', language = 'en', userId = null, userPreference = 'auto') => {
  if (userPreference === 'local') {
    return getLocalFallbackResponse(message, language);
  }

  // Classify the query
  const classification = scoreQuery(message);
  const selectedModel = selectModel(classification.category);
  const subjects = classification.subjects;
  const hasContext = context && context.trim().length > 0;

  logger.info(`Query classified: ${classification.category} (confidence: ${classification.confidence}) → ${selectedModel.label}`);
  if (subjects.length) logger.info(`Subjects detected: ${subjects.join(', ')}`);

  try {
    const startTime = Date.now();

    const systemPrompt = buildSystemPrompt(classification.category, language, subjects, hasContext);
    const userPrompt = hasContext
      ? `Context from student's notes:\n---\n${context}\n---\n\nStudent asks: ${message}`
      : `Student asks: ${message}`;

    const response = await fetch(`${process.env.NVIDIA_NIM_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel.id,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: selectedModel.temperature,
        max_tokens: selectedModel.maxTokens,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA API ${response.status}: ${errText.substring(0, 200)}`);
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;
    const responseTime = Date.now() - startTime;

    const inputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
    const outputTokens = Math.ceil(aiText.length / 4);
    const cost = (inputTokens + outputTokens) * selectedModel.costPerToken;

    // Log inference
    if (userId) {
      ModelInferenceLog.create({
        userId,
        queryText: message.substring(0, 200),
        modelUsed: selectedModel.id,
        responseTime,
        inputTokens,
        outputTokens,
        costEstimate: cost,
        timestamp: new Date(),
        metadata: {
          category: classification.category,
          confidence: classification.confidence,
          subjects,
        },
      }).catch(() => {});

      User.findByIdAndUpdate(userId, {
        $inc: {
          'hybrid.totalTokensUsed': inputTokens + outputTokens,
          'hybrid.costThisMonth': cost,
        },
      }).catch(() => {});
    }

    logger.info(`LLM response (${selectedModel.label}): ${aiText.substring(0, 60)}... [${responseTime}ms]`);

    return {
      text: aiText,
      model: 'nvidia',
      modelName: selectedModel.label,
      inputTokens,
      outputTokens,
      cost: parseFloat(cost.toFixed(6)),
      isOffline: false,
      classification: {
        category: classification.category,
        confidence: classification.confidence,
        scores: classification.scores,
        subjects,
        matchedRules: classification.matchedRules,
      },
    };
  } catch (error) {
    logger.error(`NVIDIA failed (${selectedModel.label}): ${error.message}, falling back to fast model`);

    // Fallback: try fast model if strong model failed
    if (selectedModel.id !== MODELS.fast.id) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${process.env.NVIDIA_NIM_API_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: MODELS.fast.id,
            messages: [
              { role: 'system', content: buildSystemPrompt(classification.category, language, subjects, hasContext) },
              { role: 'user', content: hasContext ? `Context:\n${context}\n\nQuestion: ${message}` : `Question: ${message}` },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiText = data.choices[0].message.content;
          const responseTime = Date.now() - startTime;
          logger.info(`Fallback to fast model succeeded: ${aiText.substring(0, 50)}...`);
          return {
            text: aiText,
            model: 'nvidia',
            modelName: `${MODELS.fast.label} (fallback)`,
            inputTokens: 0,
            outputTokens: Math.ceil(aiText.length / 4),
            cost: 0.0001,
            isOffline: false,
            classification: { category: classification.category, confidence: classification.confidence, subjects },
          };
        }
      } catch (fallbackErr) {
        logger.error(`Fast model fallback also failed: ${fallbackErr.message}`);
      }
    }

    return getLocalFallbackResponse(message, language);
  }
};

// ─── Stats ──────────────────────────────────────────────────────
export const getModelUsageStats = async (userId) => {
  const logs = await ModelInferenceLog.find({ userId }).sort({ timestamp: -1 }).limit(100).lean();

  const totalCost = logs.reduce((sum, l) => sum + (l.costEstimate || 0), 0);
  const avgResponseTime = logs.length ? logs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / logs.length : 0;

  // Breakdown by model
  const byModel = {};
  for (const log of logs) {
    const m = log.modelUsed || 'unknown';
    if (!byModel[m]) byModel[m] = { count: 0, totalCost: 0, avgTime: 0 };
    byModel[m].count++;
    byModel[m].totalCost += log.costEstimate || 0;
    byModel[m].avgTime += log.responseTime || 0;
  }
  for (const m of Object.keys(byModel)) {
    byModel[m].totalCost = parseFloat(byModel[m].totalCost.toFixed(6));
    byModel[m].avgTime = Math.round(byModel[m].avgTime / byModel[m].count);
  }

  // Breakdown by category
  const byCategory = {};
  for (const log of logs) {
    const c = log.metadata?.category || 'unknown';
    if (!byCategory[c]) byCategory[c] = 0;
    byCategory[c]++;
  }

  return {
    totalQueries: logs.length,
    totalCost: parseFloat(totalCost.toFixed(4)),
    avgResponseTime: Math.round(avgResponseTime),
    byModel,
    byCategory,
  };
};
