import 'dotenv/config';
import { Blob } from 'buffer';

const SARVAM_API_URL = process.env.SARVAM_API_URL || 'https://api.sarvam.ai';

// Create a minimal 44-byte valid RIFF WAV header + silence
const wavHeader = Buffer.alloc(44);
wavHeader.write('RIFF', 0);
wavHeader.writeUInt32LE(36 + 8, 4); // File size - 8
wavHeader.write('WAVE', 8);
wavHeader.write('fmt ', 12);
wavHeader.writeUInt32LE(16, 16); // Subchunk1Size
wavHeader.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
wavHeader.writeUInt16LE(1, 22); // NumChannels (1 = Mono)
wavHeader.writeUInt32LE(8000, 24); // SampleRate (8000 Hz)
wavHeader.writeUInt32LE(16000, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
wavHeader.writeUInt16LE(2, 32); // BlockAlign
wavHeader.writeUInt16LE(16, 34); // BitsPerSample (16 bits)
wavHeader.write('data', 36);
wavHeader.writeUInt32LE(80000, 40); // Subchunk2Size (80000 bytes of silence)

const dummyAudio = Buffer.concat([wavHeader, Buffer.alloc(80000)]);

async function testSTT() {
  console.log('Testing Sarvam Speech-to-Text...');
  const formData = new FormData();
  const fileBlob = new Blob([dummyAudio], { type: 'audio/wav' });
  formData.append('file', fileBlob, 'voice.wav');
  formData.append('language_code', 'en-IN');
  formData.append('model', 'saaras:v3');
  formData.append('mode', 'transcribe');

  const res = await fetch(`${SARVAM_API_URL}/speech-to-text`, {
    method: 'POST',
    headers: {
      'api-subscription-key': process.env.SARVAM_API_KEY,
    },
    body: formData,
  });

  console.log('Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Body:', text);
}

testSTT();
