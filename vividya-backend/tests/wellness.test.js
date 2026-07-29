import './setup.js';
import request from 'supertest';
import User from '../models/User.js';
import WellnessIntervention from '../models/WellnessIntervention.js';

const { default: app } = await import('../app.js');
import jwt from 'jsonwebtoken';

describe('Wellness Endpoints', () => {
  let userToken;
  let userId;

  const testUser = {
    email: 'wellnesstest@college.edu',
    password: 'Password123!',
    fullName: 'Wellness Student',
  };

  beforeEach(async () => {
    // Signup user and grab tokens
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(testUser);

    userId = signupRes.body.data.userId;
    userToken = signupRes.body.data.accessToken;
  });

  describe('POST /wellness/mood', () => {
    it('should successfully save mood check-in (no stress)', async () => {
      const res = await request(app)
        .post('/wellness/mood')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          mood: 5,
          stressLevel: 1,
          energyLevel: 5,
          note: 'I feel great today!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stressDetected).toBe(false);
      expect(res.body.moodLog.moodEmoji).toBe('🤩');

      // Verify stored in DB
      const user = await User.findById(userId);
      expect(user.wellness.moodHistory.length).toBe(1);
    });

    it('should detect stress and trigger intervention when negative indicators are present', async () => {
      const res = await request(app)
        .post('/wellness/mood')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          mood: 1,
          stressLevel: 5,
          energyLevel: 1,
          note: 'I am so stressed, exam pressure is burning me out. I cannot sleep.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stressDetected).toBe(true);
      expect(res.body.intervention).toBeTruthy();
      expect(res.body.intervention.type).toBe('breathing'); // high severity maps to breathing

      // Verify intervention created in DB
      const intervention = await WellnessIntervention.findById(res.body.intervention._id);
      expect(intervention).toBeTruthy();
      expect(intervention.userId.toString()).toBe(userId);
    });
  });

  describe('GET endpoints with data', () => {
    beforeEach(async () => {
      // Seed some wellness data
      await request(app)
        .post('/wellness/mood')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ mood: 4, stressLevel: 2, energyLevel: 4, note: 'Good day' });
    });

    it('should retrieve history', async () => {
      const res = await request(app)
        .get('/wellness/history?days=3')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.moodHistory.length).toBe(1);
      expect(res.body.weeklyAverage).toBe(4);
    });

    it('should retrieve insights', async () => {
      const res = await request(app)
        .get('/wellness/insights')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.insights.weeklyAverage).toBe(4);
      expect(res.body.insights.totalCheckins).toBe(1);
    });

    it('should retrieve today check-in status', async () => {
      const res = await request(app)
        .get('/wellness/today-status')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.checkedIn).toBe(true);
      expect(res.body.todayEntry).toBeTruthy();
    });

    it('should retrieve daily nudge', async () => {
      const res = await request(app)
        .get('/wellness/daily-nudge')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.nudge.type).toBe('completed');
    });

    it('should retrieve mood chart data', async () => {
      const res = await request(app)
        .get('/wellness/chart-data')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.chartData.length).toBe(7);
      expect(res.body.chartData.find(d => d.hasData).mood).toBe(4);
    });
  });

  describe('POST /wellness/intervention/respond', () => {
    let interventionId;

    beforeEach(async () => {
      // Trigger a stress intervention
      const res = await request(app)
        .post('/wellness/mood')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          mood: 1,
          stressLevel: 5,
          energyLevel: 1,
          note: 'I am so stressed, exam pressure is burning me out.'
        });
      interventionId = res.body.intervention._id;
    });

    it('should record user response and feedback for an intervention', async () => {
      const res = await request(app)
        .post('/wellness/intervention/respond')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          interventionId,
          response: 'accepted',
          feedback: 'helped'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intervention.userResponse).toBe('accepted');
      expect(res.body.intervention.feedback).toBe('helped');

      // Verify DB updated
      const intervention = await WellnessIntervention.findById(interventionId);
      expect(intervention.userResponse).toBe('accepted');
      expect(intervention.feedback).toBe('helped');
    });
  });
});
