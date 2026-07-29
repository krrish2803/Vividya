import logger from '../utils/logger.js';
import { Blob } from 'buffer';

const SARVAM_API_URL = process.env.SARVAM_API_URL || 'https://api.sarvam.ai';

export const transcribeAudio = async (audioBuffer, language = 'en') => {
  try {
    const formData = new FormData();
    const fileBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', fileBlob, 'voice.wav');

    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'hi-en': 'hi-IN',
    };
    const languageCode = langMap[language] || 'en-IN';
    formData.append('language_code', languageCode);
    formData.append('model', 'saaras:v3');
    formData.append('mode', 'transcribe');

    const response = await fetch(`${SARVAM_API_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
        'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SARVAM STT error: ${error}`);
    }

    const data = await response.json();
    logger.info(`STT transcription: ${data.transcript?.substring(0, 50)}...`);
    return data.transcript;
  } catch (error) {
    logger.error(`SARVAM STT failed: ${error.message}`);
    throw error;
  }
};

export const generateSpeech = async (text, language = 'en') => {
  try {
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'hi-en': 'hi-IN',
    };
    const languageCode = langMap[language] || 'en-IN';

    const response = await fetch(`${SARVAM_API_URL}/text-to-speech`, {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
        'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        target_language_code: languageCode,
        speaker: 'aditya',
        model: 'bulbul:v3'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SARVAM TTS error: ${error}`);
    }

    const data = await response.json();
    const audioData = (data.audios && data.audios[0]) || data.audio;
    if (!audioData) {
      logger.error(`SARVAM TTS failed: 'audios' or 'audio' field missing in response. Keys: ${Object.keys(data).join(', ')}. Full body: ${JSON.stringify(data)}`);
      throw new Error(`SARVAM TTS response missing audio data: ${JSON.stringify(data)}`);
    }
    const audioBuffer = Buffer.from(audioData, 'base64');
    logger.info(`TTS generated: ${text.substring(0, 30)}...`);
    return audioBuffer;
  } catch (error) {
    logger.error(`SARVAM TTS failed: ${error.message}`);
    throw error;
  }
};
