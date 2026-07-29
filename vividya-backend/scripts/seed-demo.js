import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Conversation from '../models/Conversation.js';
import UploadedNote from '../models/UploadedNote.js';
import StudyPlan from '../models/StudyPlan.js';

const DEMO_EMAIL = 'demo@vividya.ai';
const DEMO_PASSWORD = 'Demo@12345';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Krrish:Sexymunda%4069@cluster0.33ejrnk.mongodb.net/?appName=Cluster0';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  // Find or create demo user
  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    user = await User.create({
      email: DEMO_EMAIL,
      passwordHash: DEMO_PASSWORD,
      profile: {
        fullName: 'Priya Sharma',
        college: 'IIT Bombay',
        branch: 'Computer Science',
        year: 3,
        preferredLanguage: 'en',
      },
      preferences: {
        studyHours: '9 AM - 5 PM',
        learningStyle: 'visual',
      },
      wellness: {
        moodHistory: generateMoodHistory(),
        wellnessStreak: 7,
        weeklyMoodAverage: 4.2,
      },
      subscription: {
        plan: 'elite',
        noteSummariesLimit: -1,
        chatMessagesLimit: -1,
        noteSummariesUsed: 0,
        chatMessagesUsed: 0,
      },
    });
    console.log('Created demo user:', DEMO_EMAIL);
  } else {
    console.log('Demo user exists:', DEMO_EMAIL);
    // Update mood history and reset/upgrade subscription
    user.wellness.moodHistory = generateMoodHistory();
    user.wellness.wellnessStreak = 7;
    user.wellness.weeklyMoodAverage = 4.2;
    user.subscription = {
      plan: 'elite',
      noteSummariesLimit: -1,
      chatMessagesLimit: -1,
      noteSummariesUsed: 0,
      chatMessagesUsed: 0,
    };
    await user.save();
  }



  // Create conversations
  const existingConvs = await Conversation.countDocuments({ userId: user._id });
  if (existingConvs === 0) {
    const conv = await Conversation.create({
      userId: user._id,
      conversationType: 'tutor',
      messages: [
        { sender: 'user', messageType: 'text', content: 'Explain the difference between stack and queue data structures.' },
        { sender: 'ai', messageType: 'text', content: 'Great question! A **Stack** follows LIFO (Last In, First Out) — like a pile of plates. A **Queue** follows FIFO (First In, First Out) — like a line at a food stall.\n\n**Stack Operations:** push(), pop(), peek()\n**Queue Operations:** enqueue(), dequeue(), front()\n\nUse stack for undo operations, function calls. Use queue for BFS, task scheduling.' },
        { sender: 'user', messageType: 'text', content: 'When would you use a queue over a stack in real life?' },
        { sender: 'ai', messageType: 'text', content: 'Great follow-up! Here are real-world examples:\n\n**Queue (FIFO):** Print spooling, CPU scheduling, breadth-first search, handling requests on a web server.\n\n**Stack (LIFO):** Browser back button, undo/redo in editors, function call stack in recursion, expression evaluation.\n\nIn your college projects: use queues for task schedulers, stacks for parsing parentheses in compilers!' },
      ],
    });
    console.log('Created sample conversation');
  }

  console.log('\n✅ Demo data seeded successfully!');
  console.log('\n📧 Demo Login:');
  console.log(`   Email: ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log('\n🎓 Demo Profile: Priya Sharma, IIT Bombay, CSE 3rd Year');
  console.log('📊 Includes: 7-day mood history, chat history\n');

  await mongoose.disconnect();
}

function generateMoodHistory() {
  const moods = [];
  const notes = [
    'Productive morning! Solved 3 DSA problems.',
    'Feeling good after completing DBMS assignment.',
    'A bit stressed about upcoming mid-sem exams.',
    'Great day! Learned React hooks and built a project.',
    'Regular day. Studied OS for 2 hours.',
    'Feeling motivated after career guidance session.',
    'Good day overall. Kept up with study schedule.',
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const mood = i === 2 ? 2 : i === 5 ? 3 : 4 + Math.floor(Math.random() * 2);
    moods.push({
      timestamp: d,
      mood: Math.min(5, mood),
      moodEmoji: ['', '😢', '😟', '😐', '😊', '🤩'][Math.min(5, mood)],
      stressLevel: mood <= 2 ? 4 : mood === 3 ? 3 : 1 + Math.floor(Math.random() * 2),
      energyLevel: mood >= 4 ? 4 + Math.floor(Math.random() * 2) : 2,
      note: notes[6 - i] || '',
      detectedStress: mood <= 2,
      sentimentScore: mood >= 4 ? 0.6 : mood === 3 ? 0.1 : -0.4,
    });
  }
  return moods;
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
