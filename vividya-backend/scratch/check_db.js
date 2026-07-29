import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import StudyPlan from '../models/StudyPlan.js';

async function checkDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const user = await User.findOne({ email: 'demo@vividya.ai' });
    if (!user) {
      console.log('No user found');
      return;
    }
    console.log('User preferences:', user.preferences);
    const plans = await StudyPlan.find({ userId: user._id }).sort({ generatedAt: -1 });
    console.log(`Found ${plans.length} plans for user.`);
    if (plans.length > 0) {
      console.log('Latest plan details:', JSON.stringify(plans[0], null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabase();
