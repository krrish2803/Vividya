import './setup.js';
import request from 'supertest';
import User from '../models/User.js';
import Task from '../models/Task.js';
import StudyPlan from '../models/StudyPlan.js';

const { default: app } = await import('../app.js');

describe('Timetable and Scheduler Endpoints', () => {
  let userToken;
  let userId;

  const testUser = {
    email: 'timetabletest@college.edu',
    password: 'Password123!',
    fullName: 'Timetable Student',
  };

  beforeEach(async () => {
    // Signup user and grab tokens
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(testUser);

    userId = signupRes.body.data.userId;
    userToken = signupRes.body.data.accessToken;
  });

  describe('Tasks CRUD', () => {
    let taskId;

    it('should successfully create a study task', async () => {
      const res = await request(app)
        .post('/timetable/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Study Stacks and Queues',
          subject: 'Data Structures',
          estimatedTime: 60,
          priority: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.task.title).toBe('Study Stacks and Queues');
      expect(res.body.task.estimatedTime).toBe(60);

      taskId = res.body.task._id;

      // Verify in DB
      const task = await Task.findById(taskId);
      expect(task).toBeTruthy();
    });

    it('should reject task creation with missing fields', async () => {
      const res = await request(app)
        .post('/timetable/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'No subject task' });

      expect(res.status).toBe(400);
    });

    describe('With existing task', () => {
      beforeEach(async () => {
        const res = await request(app)
          .post('/timetable/tasks')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            title: 'Study Graphs',
            subject: 'Data Structures',
            estimatedTime: 120,
            priority: 4
          });
        taskId = res.body.task._id;
      });

      it('should fetch list of user tasks', async () => {
        const res = await request(app)
          .get('/timetable/tasks')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.tasks.length).toBe(1);
      });

      it('should mark a task as completed', async () => {
        const res = await request(app)
          .put(`/timetable/tasks/${taskId}/complete`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.task.status).toBe('completed');

        // Check DB
        const task = await Task.findById(taskId);
        expect(task.status).toBe('completed');
      });

      it('should delete a task', async () => {
        const res = await request(app)
          .delete(`/timetable/tasks/${taskId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Check DB
        const task = await Task.findById(taskId);
        expect(task).toBeNull();
      });
    });
  });

  describe('Study Plan & Pomodoro', () => {
    let taskId;

    beforeEach(async () => {
      // Seed a task
      const taskRes = await request(app)
        .post('/timetable/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Practice SQL joins',
          subject: 'DBMS',
          estimatedTime: 45,
          priority: 2
        });
      taskId = taskRes.body.task._id;
    });

    it('should generate a study plan', async () => {
      const res = await request(app)
        .post('/timetable/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ duration: 'daily' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.plan).toBeTruthy();

      // Check DB
      const plan = await StudyPlan.findOne({ userId });
      expect(plan).toBeTruthy();
    });

    it('should retrieve current plan', async () => {
      // Generate first
      await request(app)
        .post('/timetable/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ duration: 'weekly' });

      const res = await request(app)
        .get('/timetable/plan')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.plan).toBeTruthy();
    });

    it('should log pomodoro sessions and update task actual time', async () => {
      const res = await request(app)
        .post('/timetable/pomodoro')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ taskId, minutes: 25 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.task.timeSpent).toBe(25);

      // Verify DB
      const task = await Task.findById(taskId);
      expect(task.timeSpent).toBe(25);
    });

    it('should auto-adjust plan based on logged metrics', async () => {
      // Generate first
      await request(app)
        .post('/timetable/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ duration: 'daily' });

      const res = await request(app)
        .post('/timetable/auto-adjust')
        .set('Authorization', `Bearer ${userToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.adjustments).toBeTruthy();
    });
  });
});
