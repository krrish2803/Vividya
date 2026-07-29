import './setup.js';
import request from 'supertest';
import User from '../models/User.js';
import UserSession from '../models/UserSession.js';

const { default: app } = await import('../app.js');
import jwt from 'jsonwebtoken';

describe('Authentication Endpoints', () => {
  const testUser = {
    email: 'teststudent@college.edu',
    password: 'Password123!',
    fullName: 'Test Student',
    branch: 'Computer Science',
    year: 3,
    college: 'IIT Bombay',
  };

  describe('POST /auth/signup', () => {
    it('should register a new user successfully with valid details', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.email).toBe(testUser.email);

      // Verify user in DB
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user.profile.fullName).toBe(testUser.fullName);
      expect(user.profile.branch).toBe(testUser.branch);
      expect(user.profile.year).toBe(testUser.year);
      expect(user.profile.college).toBe(testUser.college);
    });

    it('should reject signup with missing required fields', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          email: 'badstudent@college.edu',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with duplicate email', async () => {
      // Create user first
      await request(app).post('/auth/signup').send(testUser);

      // Try registering again
      const res = await request(app).post('/auth/signup').send(testUser);
      expect(res.status).toBe(409); // Conflict status returned for duplicate email
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register the user before testing login
      await request(app).post('/auth/signup').send(testUser);
    });

    it('should log in successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      // Verify UserSession created
      const session = await UserSession.findOne({ userId: res.body.data.userId });
      expect(session).toBeTruthy();
      expect(session.isActive).toBe(true);
    });

    it('should fail to log in with incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail to log in with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@college.edu',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken;
    let userId;

    beforeEach(async () => {
      const signupRes = await request(app).post('/auth/signup').send(testUser);
      refreshToken = signupRes.body.data.refreshToken;
      userId = signupRes.body.data.userId;
    });

    it('should successfully rotate/extend access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should reject refresh requests with missing token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject invalid or manipulated refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token-signature' });

      expect(res.status).toBe(401);
    });

    it('should reject revoked/inactive sessions', async () => {
      // Deactivate session in DB
      await UserSession.updateMany({ userId }, { isActive: false });

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken;
    let userId;

    beforeEach(async () => {
      const signupRes = await request(app).post('/auth/signup').send(testUser);
      accessToken = signupRes.body.data.accessToken;
      userId = signupRes.body.data.userId;
    });

    it('should log out the user by deactivating all active sessions', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify sessions are deactivated
      const activeSessionsCount = await UserSession.countDocuments({ userId, isActive: true });
      expect(activeSessionsCount).toBe(0);
    });

    it('should refuse logout when not authenticated', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .send();

      expect(res.status).toBe(401);
    });
  });
});
