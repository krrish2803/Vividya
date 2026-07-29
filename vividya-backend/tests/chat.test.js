import './setup.js';
import request from 'supertest';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

const { default: app } = await import('../app.js');

describe('Chat Endpoints', () => {
  let userToken;
  let userId;

  const testUser = {
    email: 'chattest@college.edu',
    password: 'Password123!',
    fullName: 'Chat Student',
  };

  beforeEach(async () => {
    // Signup user and grab tokens
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(testUser);

    userId = signupRes.body.data.userId;
    userToken = signupRes.body.data.accessToken;
  });

  describe('POST /chat/message', () => {
    it('should successfully post a text message and retrieve AI response', async () => {
      const res = await request(app)
        .post('/chat/message')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Hello AI tutor, what are the basic components of a database?',
          language: 'en',
          conversationType: 'tutor'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiResponse.text).toContain('mocked NVIDIA LLM response tutor answer.');
      expect(res.body.data.conversationId).toBeTruthy();

      // Check DB conversation holds messages
      const convo = await Conversation.findById(res.body.data.conversationId);
      expect(convo.messages.length).toBe(2); // user and assistant
      expect(convo.messages[0].sender).toBe('user');
      expect(convo.messages[1].sender).toBe('ai');
    });
  });

  describe('POST /chat/voice & GET /chat/voice/:id/:messageId', () => {
    let conversationId;
    let messageId;

    it('should upload audio message, transcribe and respond with audio buffers', async () => {
      const dummyWav = Buffer.from('RIFF....WAVEfmt....data....');
      const uploadRes = await request(app)
        .post('/chat/voice')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('audioFile', dummyWav, 'question.wav')
        .field('language', 'en')
        .field('conversationType', 'tutor');

      expect(uploadRes.status).toBe(200);
      expect(uploadRes.body.success).toBe(true);
      expect(uploadRes.body.data.transcribedText).toBe('Mocked transcribed text from audio speech.');
      expect(uploadRes.body.data.aiResponse.text).toContain('mocked NVIDIA LLM response tutor answer.');

      conversationId = uploadRes.body.data.conversationId;

      // Extract the AI's voice message ID from the database
      const convo = await Conversation.findById(conversationId);
      const aiVoiceMsg = convo.messages.find(m => m.sender === 'ai' && m.messageType === 'voice');
      expect(aiVoiceMsg).toBeTruthy();
      messageId = aiVoiceMsg._id;

      // Get voice audio stream using the IDs
      const audioRes = await request(app)
        .get(`/chat/voice/${conversationId}/${messageId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(audioRes.status).toBe(200);
      expect(audioRes.headers['content-type']).toBe('audio/wav');
      expect(audioRes.body.toString()).toBe('mock-audio-data');
    });
  });

  describe('GET /chat/history', () => {
    beforeEach(async () => {
      // Create some messages first
      await request(app)
        .post('/chat/message')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'Hello' });
    });

    it('should retrieve conversation messages history', async () => {
      const res = await request(app)
        .get('/chat/history?conversationType=tutor')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.conversations.length).toBe(1);
      expect(res.body.data.conversations[0].messages.length).toBe(2); // user and assistant
    });
  });
});
