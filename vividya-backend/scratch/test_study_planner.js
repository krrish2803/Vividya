import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import StudyPlan from '../models/StudyPlan.js';
import * as timetableService from '../services/timetableService.js';

async function testStudyPlanner() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB!');

  try {
    const user = await User.findOne({ email: 'demo@vividya.ai' });
    if (!user) {
      console.error('Demo user demo@vividya.ai not found. Please seed the DB first.');
      process.exit(1);
    }
    const userId = user._id;

    console.log('\n--- 1. Cleaning up existing test tasks/plans for demo user ---');
    await Task.deleteMany({ userId });
    await StudyPlan.deleteMany({ userId });
    console.log('Cleanup complete!');

    console.log('\n--- 2. Creating test tasks ---');
    const task1 = await timetableService.createTask(userId, {
      title: 'Learn B-Trees & B+ Trees',
      subject: 'DSA',
      estimatedTime: 90,
      priority: 4,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days away
    });
    console.log(`Created Task 1: "${task1.title}" (Subject: ${task1.subject}, Priority: ${task1.priority})`);

    const task2 = await timetableService.createTask(userId, {
      title: 'Revise ACID Properties & Transaction Management',
      subject: 'DBMS',
      estimatedTime: 60,
      priority: 3,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days away
    });
    console.log(`Created Task 2: "${task2.title}" (Subject: ${task2.subject}, Priority: ${task2.priority})`);

    console.log('\n--- 3. Generating Weekly Study Plan ---');
    const plan = await timetableService.generateStudyPlan(userId, 'weekly');
    console.log('Successfully generated study plan!');
    console.log(`Plan Type: ${plan.planType}`);
    console.log('Generated Schedule Days:', plan.schedule.map(s => s.day).join(', '));
    console.log('Monday Sessions count:', plan.schedule[0]?.sessions?.length || 0);
    if (plan.schedule[0]?.sessions?.length > 0) {
      console.log('First session details:', plan.schedule[0].sessions[0]);
    }

    console.log('\n--- 4. Running Auto-Adjustment Engine ---');
    const adjustment = await timetableService.autoAdjustPlan(userId);
    console.log('Auto-Adjustment Response:', JSON.stringify(adjustment, null, 2));

    console.log('\nStudy Planner Test Passed Successfully!');
  } catch (error) {
    console.error('Study Planner Test Failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

testStudyPlanner();
