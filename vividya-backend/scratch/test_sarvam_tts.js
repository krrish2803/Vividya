import 'dotenv/config';

const SARVAM_API_URL = process.env.SARVAM_API_URL || 'https://api.sarvam.ai';

async function testTTS() {
  console.log('Testing Sarvam Text-to-Speech...');
  const res = await fetch(`${SARVAM_API_URL}/text-to-speech`, {
    method: 'POST',
    headers: {
      'api-subscription-key': process.env.SARVAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: 'Hello, welcome to Vividya!',
      target_language_code: 'en-IN',
      speaker: 'aditya',
      model: 'bulbul:v3'
    }),
  });

  console.log('Status:', res.status, res.statusText);
  const json = await res.json().catch(() => ({}));
  console.log('Body keys:', Object.keys(json));
  if (json.audio) {
    console.log('Audio base64 length:', json.audio.length);
  } else {
    console.log('Full JSON response:', JSON.stringify(json));
  }
}

testTTS();
