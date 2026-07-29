import './setup.js';
import request from 'supertest';
import User from '../models/User.js';
import UploadedNote from '../models/UploadedNote.js';
import ModelInferenceLog from '../models/ModelInferenceLog.js';

const { default: app } = await import('../app.js');

describe('RAG and Hybrid AI Endpoints', () => {
  let userToken;
  let userId;
  let noteId;

  const testUser = {
    email: 'ragtest@college.edu',
    password: 'Password123!',
    fullName: 'RAG Student',
  };

  beforeEach(async () => {
    // Signup user and grab tokens
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(testUser);

    userId = signupRes.body.data.userId;
    userToken = signupRes.body.data.accessToken;

    // Seed an uploaded note for testing indexing
    const note = await UploadedNote.create({
      userId,
      filename: 'datastructures.pdf',
      fileType: 'pdf',
      fileSize: 1024,
      fileData: Buffer.from('%PDF-1.4 ... Stack details ...'),
      mimeType: 'application/pdf',
      analysis: {
        summary: 'Stacks follow Last In First Out.',
        keyPoints: ['LIFO'],
        quizGenerated: [],
        topicsDetected: ['Data Structures'],
        estimatedReadTime: 1,
      },
    });

    noteId = note._id;
  });

  describe('POST /rag/index', () => {
    it('should successfully index note in Qdrant', async () => {
      const res = await request(app)
        .post('/rag/index')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ noteId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.chunksIndexed).toBeGreaterThan(0);
    });

    it('should fail RAG index if note does not exist', async () => {
      const res = await request(app)
        .post('/rag/index')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ noteId: '658309ecfb3c3a002bc0fdf8' }); // valid but non-existent ObjectId

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('RAG retrieval and chat', () => {
    beforeEach(async () => {
      // Pre-index the note in mock Qdrant
      await request(app)
        .post('/rag/index')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ noteId });
    });

    it('should successfully query notes using RAG context citations', async () => {
      const res = await request(app)
        .post('/rag/query')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ query: 'What is a stack?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.answer).toContain('mocked NVIDIA LLM response tutor answer.');
      expect(res.body.usingRAG).toBe(true);
      expect(res.body.sources.length).toBeGreaterThan(0);
      expect(res.body.sources[0].filename).toBe('datastructures.pdf');
    });

    it('should retrieve indexed docs', async () => {
      const res = await request(app)
        .get('/rag/docs')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.docs.length).toBe(1);
      expect(res.body.docs[0].filename).toBe('datastructures.pdf');
    });

    it('should perform chat-hybrid routing using classification heuristic rules', async () => {
      // Test simple route selection
      const resSimple = await request(app)
        .post('/rag/chat-hybrid')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'What is it?' });

      expect(resSimple.status).toBe(200);
      expect(resSimple.body.modelName).toBe('Llama 3.1 8B (Fast)');

      // Test complex route reasoning selection
      const resReasoning = await request(app)
        .post('/rag/chat-hybrid')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'Can you walk through step-by-step to optimize this algorithm?' });

      expect(resReasoning.status).toBe(200);
      expect(resReasoning.body.modelName).toBe('Llama 3.1 70B (Strong)');
    });

    it('should perform chat-with-rag combining Qdrant retrieval and LLM context', async () => {
      const res = await request(app)
        .post('/rag/chat-with-rag')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'Explain stack structure in Hinglish', language: 'hi-en' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.usingRAG).toBe(true);
      expect(res.body.sources.length).toBeGreaterThan(0);
    });

    it('should fetch model usage stats', async () => {
      // Seed a log entry in DB
      await ModelInferenceLog.create({
        userId,
        queryText: 'Explain stack',
        modelUsed: 'meta/llama-3.1-8b-instruct',
        responseTime: 200,
        inputTokens: 100,
        outputTokens: 50,
        costEstimate: 0.0001,
      });

      const res = await request(app)
        .get('/rag/usage')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalQueries).toBe(1);
      expect(res.body.stats.totalCost).toBe(0.0001);
    });
  });
});
