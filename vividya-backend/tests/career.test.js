import './setup.js';
import request from 'supertest';
import User from '../models/User.js';
import UploadedNote from '../models/UploadedNote.js';
import CareerProfile from '../models/CareerProfile.js';

const { default: app } = await import('../app.js');

describe('Career Endpoints', () => {
  let userToken;
  let userId;
  let noteId;

  const testUser = {
    email: 'careertest@college.edu',
    password: 'Password123!',
    fullName: 'Career Student',
  };

  beforeEach(async () => {
    // Signup user and grab tokens
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(testUser);

    userId = signupRes.body.data.userId;
    userToken = signupRes.body.data.accessToken;

    // Create a dummy note that acts as a resume
    const note = await UploadedNote.create({
      userId,
      filename: 'resume.pdf',
      fileType: 'pdf',
      fileSize: 1024,
      fileData: Buffer.from('%PDF-1.4 ... My Resume containing skills like Python, React, and Node.js ...'),
      mimeType: 'application/pdf',
      analysis: {
        summary: 'Resume of test candidate.',
        keyPoints: [],
        quizGenerated: [],
        topicsDetected: ['Resume'],
        estimatedReadTime: 1,
      },
    });

    noteId = note._id;
  });

  describe('POST /career/analyze-resume', () => {
    it('should successfully analyze uploaded resume and populate CareerProfile', async () => {
      const res = await request(app)
        .post('/career/analyze-resume')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ noteId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile).toBeTruthy();
      expect(res.body.profile.resumeFileRef).toBe(noteId.toString());

      // Verify CareerProfile exists in DB
      const profile = await CareerProfile.findOne({ userId });
      expect(profile).toBeTruthy();
      expect(profile.analysis.userSkills).toBeTruthy();
    });

    it('should fail analyze-resume if noteId is invalid', async () => {
      const res = await request(app)
        .post('/career/analyze-resume')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ noteId: 'invalid-id' });

      expect(res.status).toBe(400);
    });
  });

  describe('Career services with existing profile', () => {
    beforeEach(async () => {
      // Analyze resume first
      await request(app)
        .post('/career/analyze-resume')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ noteId });
    });

    it('should retrieve career profile', async () => {
      const res = await request(app)
        .get('/career/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.userId).toBe(userId);
    });

    it('should retrieve job role matches and skill gaps details', async () => {
      const res = await request(app)
        .get('/career/role-matches')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.roles.length).toBeGreaterThan(0);
      expect(res.body.skillGaps.length).toBeGreaterThan(0);
    });

    it('should generate study roadmaps for target roles', async () => {
      const res = await request(app)
        .post('/career/roadmap')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ targetRole: 'Full Stack Developer' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.targetRole).toBe('Full Stack Developer');
      expect(res.body.roadmap.summary).toBeTruthy();
    });

    it('should generate mock interview questions for target roles', async () => {
      const res = await request(app)
        .post('/career/mock-interview')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ targetRole: 'Software Engineer (SDE)' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.targetRole).toBe('Software Engineer (SDE)');
      expect(res.body.questions.length).toBeGreaterThan(0);
    });
  });
});
