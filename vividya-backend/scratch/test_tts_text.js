import 'dotenv/config';

const SARVAM_API_URL = process.env.SARVAM_API_URL || 'https://api.sarvam.ai';

const LLM_TEXT = `I'd be happy to explain the difference between machine learning (ML) and deep learning (DL).

Here is a summary:
1. **Machine Learning**: A subset of AI that uses algorithms to parse data, learn from it, and make decisions.
2. **Deep Learning**: A subset of ML that uses multi-layered neural networks (hence "deep") to learn feature representations directly from data.

Would you like to know more?`;

async function testTTS() {
  console.log('Testing Sarvam Text-to-Speech with LLM output...');
  const res = await fetch(`${SARVAM_API_URL}/text-to-speech`, {
    method: 'POST',
    headers: {
      'api-subscription-key': process.env.SARVAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: LLM_TEXT,
      target_language_code: 'hi-IN',
      speaker: 'aditya',
      model: 'bulbul:v3'
    }),
  });

  console.log('Status:', res.status, res.statusText);
  const json = await res.json().catch(() => ({}));
  console.log('Keys:', Object.keys(json));
  if (json.audio) {
    console.log('Success! Audio base64 length:', json.audio.length);
  } else {
    console.log('Response body:', JSON.stringify(json));
  }
}

testTTS();
