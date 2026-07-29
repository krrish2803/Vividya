import 'dotenv/config';
import mongoose from 'mongoose';

// Set environment to test
process.env.NODE_ENV = 'test';
// Bind to a random port to prevent conflicts
process.env.PORT = '0';

// Modify MONGODB_URI to use a test database
if (process.env.MONGODB_URI) {
  if (process.env.MONGODB_URI.includes('/?')) {
    process.env.MONGODB_URI = process.env.MONGODB_URI.replace('/?', '/vividya_test?');
  } else if (!process.env.MONGODB_URI.endsWith('/vividya_test')) {
    process.env.MONGODB_URI = process.env.MONGODB_URI + '/vividya_test';
  }
} else {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/vividya_test';
}

// Ensure clean environment values for JWT
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'vividya_test_access_secret_key_32chars_min';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vividya_test_refresh_secret_key_32chars_min';

// Mock Qdrant Client module BEFORE it is loaded
import { jest } from '@jest/globals';

// Keep track of indexed points in memory for testing RAG search
export const mockQdrantStore = {
  collections: [{ name: 'vividya_notes' }],
  points: []
};

jest.unstable_mockModule('@qdrant/js-client-rest', () => {
  return {
    QdrantClient: jest.fn().mockImplementation(() => {
      return {
        getCollections: jest.fn().mockResolvedValue({ collections: mockQdrantStore.collections }),
        createCollection: jest.fn().mockImplementation(async (name) => {
          mockQdrantStore.collections.push({ name });
          return { success: true };
        }),
        createPayloadIndex: jest.fn().mockResolvedValue({ success: true }),
        upsert: jest.fn().mockImplementation(async (collection, data) => {
          if (data && data.points) {
            mockQdrantStore.points.push(...data.points);
          }
          return { success: true };
        }),
        search: jest.fn().mockImplementation(async (collection, searchParams) => {
          // Filter points by userId
          const userId = searchParams.filter?.must?.[0]?.match?.value;
          let filtered = mockQdrantStore.points;
          if (userId) {
            filtered = filtered.filter(p => p.payload?.userId === userId);
          }
          // Return matches
          return filtered.slice(0, searchParams.limit || 5).map(p => ({
            id: p.id,
            score: 0.95,
            payload: p.payload,
          }));
        }),
        scroll: jest.fn().mockImplementation(async (collection, scrollParams) => {
          const userId = scrollParams.filter?.must?.[0]?.match?.value;
          let filtered = mockQdrantStore.points;
          if (userId) {
            filtered = filtered.filter(p => p.payload?.userId === userId);
          }
          return { points: filtered };
        }),
      };
    })
  };
});

// Mock Tesseract.js (OCR) and PDF parse to run fast without binaries
jest.unstable_mockModule('pdf-parse', () => {
  return {
    default: jest.fn().mockResolvedValue({
      text: 'Mocked PDF Content containing study materials and exam review questions.'
    })
  };
});

jest.unstable_mockModule('sharp', () => {
  const sharpMock = jest.fn().mockReturnValue({
    resize: jest.fn().mockReturnThis(),
    grayscale: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-processed-image')),
  });
  return { default: sharpMock };
});

jest.unstable_mockModule('tesseract.js', () => {
  return {
    default: {
      recognize: jest.fn().mockResolvedValue({
        data: { text: 'Mocked OCR image transcription text content.' }
      })
    }
  };
});

// Mock global fetch for external APIs (NVIDIA, Sarvam)
const originalFetch = global.fetch;

global.fetch = jest.fn().mockImplementation(async (url, options) => {
  const urlString = url.toString();

  // Mock NVIDIA NIM Chat Completions
  if (urlString.includes('integrate.api.nvidia.com') && urlString.includes('/chat/completions')) {
    const body = JSON.parse(options.body);
    const fullPrompt = body.messages.map(m => m.content).join('\n');

    let responseText = 'This is a mocked NVIDIA LLM response tutor answer.';

    // Customized responses depending on prompt keyword
    if (fullPrompt.includes('summary') || fullPrompt.includes('summarize') || fullPrompt.includes('Subject:')) {
      responseText = JSON.stringify({
        summary: 'This note covers basic data structures like stack and queue.',
        keyPoints: ['Stacks follow LIFO.', 'Queues follow FIFO.', 'Both are linear structures.'],
        difficulty: 'easy'
      });
    } else if (fullPrompt.includes('multiple-choice') || fullPrompt.includes('generate 3')) {
      responseText = JSON.stringify([
        {
          question: 'What does LIFO stand for?',
          options: ['Last In First Out', 'Last In First Open', 'Lead In First Out', 'None'],
          correctAnswer: 'Last In First Out',
          difficulty: 'easy'
        }
      ]);
    } else if (fullPrompt.includes('roadmap') || fullPrompt.includes('Roadmap')) {
      responseText = '1. Learn basic syntax.\n2. Study OOP concepts.\n3. Build sample projects.';
    } else if (fullPrompt.includes('mock-interview') || fullPrompt.includes('Interview')) {
      responseText = 'Here is your mock interview question: Explain polymorphism.';
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: responseText
            }
          }
        ]
      })
    };
  }

  // Mock NVIDIA Embeddings
  if (urlString.includes('integrate.api.nvidia.com') && urlString.includes('/embeddings')) {
    // Generate dummy array of dimension 2048
    const mockVector = Array(2048).fill(0.123);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ embedding: mockVector }]
      })
    };
  }

  // Mock Sarvam Speech to Text
  if (urlString.includes('api.sarvam.ai') && urlString.includes('/speech-to-text')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        transcript: 'Mocked transcribed text from audio speech.'
      })
    };
  }

  // Mock Sarvam Text to Speech
  if (urlString.includes('api.sarvam.ai') && urlString.includes('/text-to-speech')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        audio: Buffer.from('mock-audio-data').toString('base64')
      })
    };
  }

  return originalFetch(url, options);
});

// Setup hook to clean DB
beforeAll(async () => {
  // If already connected, do nothing
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  // Clear all collections between tests
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    mockQdrantStore.points = [];
  }
});
