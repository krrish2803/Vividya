import './setup.js';
import request from 'supertest';
import User from '../models/User.js';

const { default: app } = await import('../app.js');
import jwt from 'jsonwebtoken';

describe('User Endpoints', () => {
  let userToken;
  let userId;

  const testUser = {
    email: 'userprofiletest@college.edu',
    password: 'Password123!',
    fullName: 'Profile Student',
    branch: 'Electrical Engineering',
    year: 2,
    college: 'IIT Delhi',
  };

  beforeEach(async () => {
    // Signup user and grab tokens
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(testUser);

    userId = signupRes.body.data.userId;
    userToken = signupRes.body.data.accessToken;
  });

  describe('GET /users/profile', () => {
    it('should successfully fetch user profile when authenticated', async () => {
      const res = await request(app)
        .get('/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.profile.fullName).toBe(testUser.fullName);
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('should deny profile retrieval without authentication token', async () => {
      const res = await request(app)
        .get('/users/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /users/profile', () => {
    it('should successfully update profile fields', async () => {
      const newProfile = {
        fullName: 'Updated Name',
        branch: 'Mechanical Engineering',
        year: 4,
        college: 'IIT Delhi',
        preferredLanguage: 'hi-en',
      };

      const res = await request(app)
        .put('/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ profile: newProfile });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.fullName).toBe('Updated Name');
      expect(res.body.data.profile.branch).toBe('Mechanical Engineering');
      expect(res.body.data.profile.year).toBe(4);
      expect(res.body.data.profile.preferredLanguage).toBe('hi-en');

      // Verify DB change
      const user = await User.findById(userId);
      expect(user.profile.fullName).toBe('Updated Name');
    });

    it('should fail profile update with invalid email type validation inside check', async () => {
      // Send invalid payload schema (no profile object wrapping)
      const res = await request(app)
        .put('/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ profile: { year: 12 } }); // year max is 8

      expect(res.status).toBe(400);
    });
  });

  describe('POST /users/mood-check', () => {
    it('should record mood successfully', async () => {
      const res = await request(app)
        .post('/users/mood-check')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ mood: 4, note: 'Feeling productive today!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mood).toBe(4);
      expect(res.body.data.note).toBe('Feeling productive today!');

      // Check DB wellness entries
      const user = await User.findById(userId);
      expect(user.wellness.moodHistory.length).toBe(1);
      expect(user.wellness.moodHistory[0].mood).toBe(4);
      expect(user.wellness.moodHistory[0].note).toBe('Feeling productive today!');
    });

    it('should fail mood check-in with invalid mood value', async () => {
      const res = await request(app)
        .post('/users/mood-check')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ mood: 10, note: 'Incorrect scale mood.' });

      expect(res.status).toBe(400);
    });
  });
});
