import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import StudyPlan from '../models/StudyPlan.js';

async function clearPlanner() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  try {
    const user = await User.findOne({ email: 'demo@vividya.ai' });
    if (!user) {
      console.error('Demo user not found.');
      return;
    }

    const userId = user._id;
    console.log(`Clearing tasks and study plans for user ${user.email} (${userId})...`);

    const deletedTasks = await Task.deleteMany({ userId });
    const deletedPlans = await StudyPlan.deleteMany({ userId });

    console.log(`Deleted ${deletedTasks.deletedCount} tasks.`);
    console.log(`Deleted ${deletedPlans.deletedCount} study plans.`);
    console.log('Study Planner cleared successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

clearPlanner();
