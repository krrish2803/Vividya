import User from '../models/User.js';
import DailyLog from '../models/DailyLog.js';
import Conversation from '../models/Conversation.js';
import UploadedNote from '../models/UploadedNote.js';
import Task from '../models/Task.js';
import StudyPlan from '../models/StudyPlan.js';
import ModelInferenceLog from '../models/ModelInferenceLog.js';
import WellnessIntervention from '../models/WellnessIntervention.js';
import { NotFoundError } from '../utils/error-handler.js';

export const getDashboardStats = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  const [user, dailyLog, totalConversations, totalNotes, pendingTasks, completedTasks, totalPlans, totalInferences] = await Promise.all([
    User.findById(userId).lean(),
    DailyLog.findOne({ userId, date: today }).lean(),
    Conversation.countDocuments({ userId }),
    UploadedNote.countDocuments({ userId }),
    Task.countDocuments({ userId, status: { $ne: 'completed' } }),
    Task.countDocuments({ userId, status: 'completed' }),
    StudyPlan.countDocuments({ userId }),
    ModelInferenceLog.countDocuments({ userId }),
  ]);

  if (!user) throw new NotFoundError('User not found');

  const todayMood = user.wellness?.moodHistory?.slice(-1)[0]?.mood;
  const wellnessStreak = user.wellness?.wellnessStreak || 0;
  const weeklyMoodAvg = user.wellness?.weeklyMoodAverage || 0;

  return {
    studyStreak: user.wellness?.studyStreak || 0,
    wellnessStreak,
    weeklyMoodAvg,
    todayMessages: dailyLog?.activities?.messagesCount || 0,
    moodToday: todayMood,
    notesUploaded: totalNotes,
    totalConversations,
    pendingTasks,
    completedTasks,
    studyPlansGenerated: totalPlans,
    totalAIQueries: totalInferences,
    plan: user.subscription?.plan || 'free',
    chatMessagesUsed: user.subscription?.chatMessagesUsed || 0,
    chatMessagesLimit: user.subscription?.chatMessagesLimit || 500,
    dailyGoalProgress: calculateGoalProgress(dailyLog),
  };
};

export const getDailyGreeting = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError('User not found');

  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  const quotes = [
    'Success is the sum of small efforts repeated daily.',
    'The only way to do great work is to love what you do.',
    'Education is the passport to the future.',
    'Believe you can and you are halfway there.',
    'Start where you are. Use what you have. Do what you can.',
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    greeting: `${greeting}, ${user.profile?.fullName || 'Student'}!`,
    motivationalQuote: randomQuote,
    studyStreak: user.wellness?.studyStreak || 0,
    preferredLanguage: user.profile?.preferredLanguage || 'en',
  };
};

const calculateGoalProgress = (dailyLog) => {
  if (!dailyLog) return 0;
  const activities = dailyLog.activities;
  let completed = 0;
  let total = 4;

  if (activities?.messagesCount > 0) completed++;
  if (activities?.notesUploaded > 0) completed++;
  if (activities?.studyTimeMinutes > 0) completed++;
  if (activities?.moodCheckIns > 0) completed++;

  return Math.round((completed / total) * 100);
};

export const getStudentHealthScore = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError('User not found');

  const [totalTasks, completedTasks, totalNotes, totalChats, totalPlans] = await Promise.all([
    Task.countDocuments({ userId }),
    Task.countDocuments({ userId, status: 'completed' }),
    UploadedNote.countDocuments({ userId }),
    Conversation.countDocuments({ userId }),
    StudyPlan.countDocuments({ userId }),
  ]);

  // Academics score (0-100)
  const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const planBonus = Math.min(20, totalPlans * 5);
  const academics = Math.min(100, Math.round(taskCompletion * 0.7 + planBonus + (totalTasks > 0 ? 10 : 0)));

  // Wellness score (0-100)
  const moodHistory = user.wellness?.moodHistory || [];
  const recentMoods = moodHistory.slice(-14);
  const avgMood = recentMoods.length > 0
    ? recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length
    : 3;
  const moodScore = ((avgMood - 1) / 4) * 60; // 0-60 from mood
  const streakBonus = Math.min(30, (user.wellness?.wellnessStreak || 0) * 5);
  const checkinBonus = recentMoods.length >= 5 ? 10 : recentMoods.length * 2;
  const wellness = Math.min(100, Math.round(moodScore + streakBonus + checkinBonus));

  // Productivity score (0-100)
  const notesScore = Math.min(30, totalNotes * 6);
  const chatScore = Math.min(20, totalChats * 4);
  const recentActivity = moodHistory.filter(m => {
    const d = new Date(m.timestamp);
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const activityScore = Math.min(30, recentActivity * 5);
  const productivity = Math.min(100, Math.round(notesScore + chatScore + activityScore + 20));

  // Overall health score (weighted average)
  const overall = Math.round(academics * 0.4 + wellness * 0.35 + productivity * 0.25);

  // Subject breakdown from tasks
  const tasks = await Task.find({ userId }).lean();
  const subjectMap = {};
  tasks.forEach(t => {
    const subj = t.subject || 'General';
    if (!subjectMap[subj]) subjectMap[subj] = { total: 0, completed: 0 };
    subjectMap[subj].total++;
    if (t.status === 'completed') subjectMap[subj].completed++;
  });
  const subjects = Object.entries(subjectMap).map(([name, data]) => ({
    name,
    completion: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    total: data.total,
    completed: data.completed,
  }));

  return {
    overall,
    academics,
    wellness,
    productivity,
    subjects,
    breakdown: {
      taskCompletion: Math.round(taskCompletion),
      avgMood: parseFloat(avgMood.toFixed(1)),
      wellnessStreak: user.wellness?.wellnessStreak || 0,
      totalTasks,
      completedTasks,
      totalNotes,
      totalChats,
    },
  };
};

export const getActivityFeed = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError('User not found');

  const activities = [];

  // Recent mood check-ins
  const recentMoods = (user.wellness?.moodHistory || []).slice(-5).reverse();
  recentMoods.forEach(m => {
    activities.push({
      type: 'mood',
      icon: m.moodEmoji || '😐',
      text: `Mood check-in: ${m.moodEmoji} (${m.note || 'no note'})`,
      detail: m.detectedStress ? '⚠ Stress detected' : null,
      timestamp: m.timestamp,
    });
  });

  // Recent tasks
  const recentTasks = await Task.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();
  recentTasks.forEach(t => {
    activities.push({
      type: 'task',
      icon: t.status === 'completed' ? '✅' : '📋',
      text: t.status === 'completed' ? `Completed: ${t.title}` : `Task: ${t.title}`,
      detail: `${t.subject} · ${t.timeSpent || 0}min spent`,
      timestamp: t.updatedAt,
    });
  });

  // Recent notes
  const recentNotes = await UploadedNote.find({ userId })
    .sort({ uploadedAt: -1 })
    .limit(3)
    .lean();
  recentNotes.forEach(n => {
    activities.push({
      type: 'note',
      icon: '📝',
      text: `Uploaded: ${n.originalName || 'Note'}`,
      detail: n.subject || '',
      timestamp: n.uploadedAt,
    });
  });

  // Recent chats
  const recentChats = await Conversation.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean();
  recentChats.forEach(c => {
    const lastMsg = c.messages?.[c.messages.length - 1];
    activities.push({
      type: 'chat',
      icon: '💬',
      text: `AI Chat: ${(lastMsg?.content || '').slice(0, 50)}...`,
      detail: c.conversationType || 'tutor',
      timestamp: c.updatedAt,
    });
  });

  // Sort by timestamp descending and take top 10
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return activities.slice(0, 10);
};
