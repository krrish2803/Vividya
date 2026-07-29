import User from '../models/User.js';
import WellnessIntervention from '../models/WellnessIntervention.js';
import { NotFoundError } from '../utils/error-handler.js';

const stressKeywords = [
  'exam', 'assignment', 'pressure', 'deadline', 'worried', 'anxious', 'nervous',
  'overwhelmed', 'struggle', 'difficulty', 'confused', 'lost', 'backlog', 'fail',
  'stress', 'panic', 'burnout', 'insomnia', 'sleepless', 'headache', 'depressed',
  'lonely', 'isolated', 'hopeless', 'worthless', 'cant focus', 'cant concentrate',
  'procrastinating', 'late', 'behind', 'lagging', 'failing', 'dropping', 'scared',
  'terrified', 'exhausted', 'drained', 'burned out', 'breaking down', '崩溃',
  'panic attack', 'anxiety', 'dread', 'doom', 'catastrophe', 'crisis',
];

const positiveWords = [
  'happy', 'good', 'great', 'awesome', 'love', 'excellent', 'amazing', 'wonderful',
  'fantastic', 'productive', 'done', 'completed', 'proud', 'grateful', 'blessed',
  'excited', 'motivated', 'energized', 'confident', 'accomplished', 'thriving',
  'relaxed', 'peaceful', 'content', 'joyful', 'cheerful', 'optimistic', 'hopeful',
  'inspired', 'focused', 'determined', 'refreshed', 'recharged',
];
const negativeWords = [
  'bad', 'sad', 'hate', 'terrible', 'worst', 'stressed', 'tired', 'exhausted',
  'frustrated', 'anxious', 'worried', 'angry', 'furious', 'disappointed', 'regret',
  'miserable', 'depressed', 'hopeless', 'worthless', 'empty', 'numb', 'ache',
  'pain', 'hurt', 'suffering', 'struggling', 'drowning', 'suffocating', 'trapped',
  'helpless', 'defeated', 'broken', 'devastated', 'shattered', 'ruined',
];

const motivationalQuotes = [
  "Every expert was once a beginner. You're on the right path!",
  "Progress, not perfection. Celebrate small wins.",
  "This exam is just one moment. Your worth isn't defined by it.",
  "You've overcome challenges before. You can do this too.",
  "Take it one step at a time. Breathe. You've got this.",
  "Stress is temporary. Your effort will pay off.",
  "Your only limit is your mind. Keep pushing!",
  "Small daily improvements lead to stunning results.",
];

function getMoodEmoji(mood) {
  const emojiMap = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '🤩' };
  return emojiMap[mood] || '😐';
}

function analyzeSentiment(text) {
  if (!text) return { score: 0, positive: 0, negative: 0, intensity: 'neutral' };
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const positive = words.filter(w => positiveWords.some(pw => w.includes(pw))).length;
  const negative = words.filter(w => negativeWords.some(nw => w.includes(nw))).length;

  const negators = ['not', "n't", 'no', 'never', 'neither', 'nobody', 'nothing'];
  const hasNegation = words.some(w => negators.includes(w));
  const adjustedPositive = hasNegation && negative > 0 ? Math.max(0, positive - 1) : positive;

  const score = (adjustedPositive - negative) / (adjustedPositive + negative + 1);
  const clampedScore = Math.max(-1, Math.min(1, score));
  const absScore = Math.abs(clampedScore);
  const intensity = absScore > 0.6 ? 'strong' : absScore > 0.3 ? 'moderate' : 'mild';

  return { score: clampedScore, positive: adjustedPositive, negative, intensity };
}

function detectStress(note, mood, stressLevel, sentiment) {
  const lower = (note || '').toLowerCase();
  const textMentionsStress = stressKeywords.some(kw => lower.includes(kw));
  const moodIndicatesStress = mood <= 2;
  const stressLevelHigh = (stressLevel || 0) >= 4;
  const sentimentNegative = sentiment.score < -0.3;
  const strongNegativity = sentimentNegative && sentiment.intensity === 'strong';

  const indicators = [
    textMentionsStress,
    moodIndicatesStress,
    stressLevelHigh,
    sentimentNegative,
    strongNegativity,
  ].filter(Boolean).length;

  if (indicators >= 3) return { detected: true, severity: 'high' };
  if (indicators >= 2) return { detected: true, severity: 'medium' };
  if (indicators === 1 && (textMentionsStress || strongNegativity)) return { detected: true, severity: 'low' };
  return { detected: false, severity: 'none' };
}

function getWellnessNudge(moodHistory, streak) {
  const today = new Date().toDateString();
  const checkedInToday = moodHistory.some(m => new Date(m.timestamp).toDateString() === today);

  if (checkedInToday) {
    return { type: 'completed', message: "You've checked in today. Great job staying consistent!" };
  }

  const lastEntry = moodHistory[moodHistory.length - 1];
  if (!lastEntry) {
    return { type: 'first_time', message: "Start your wellness journey — check in with how you're feeling today!" };
  }

  const hoursSinceLast = (Date.now() - new Date(lastEntry.timestamp).getTime()) / (1000 * 60 * 60);

  if (hoursSinceLast > 48) {
    return { type: 'overdue', message: `It's been ${Math.floor(hoursSinceLast / 24)} days since your last check-in. How are you doing?` };
  }

  if (streak >= 7) {
    return { type: 'streak', message: `Amazing ${streak}-day streak! Keep the momentum going.` };
  }

  return { type: 'reminder', message: "Take a moment to check in with yourself." };
}

function get7DayMoodData(moodHistory) {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayEntries = moodHistory.filter(m => new Date(m.timestamp).toDateString() === dateStr);

    days.push({
      date: d.toISOString().split('T')[0],
      dayName: dayNames[d.getDay()],
      mood: dayEntries.length > 0 ? dayEntries[dayEntries.length - 1].mood : null,
      stress: dayEntries.length > 0 ? dayEntries[dayEntries.length - 1].stressLevel : null,
      energy: dayEntries.length > 0 ? dayEntries[dayEntries.length - 1].energyLevel : null,
      hasData: dayEntries.length > 0,
    });
  }
  return days;
}

function calculateWeeklyAverage(moodHistory) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekMoods = moodHistory.filter(m => new Date(m.timestamp) > oneWeekAgo);
  if (weekMoods.length === 0) return 0;
  const sum = weekMoods.reduce((acc, m) => acc + m.mood, 0);
  return parseFloat((sum / weekMoods.length).toFixed(1));
}

function calculateWellnessStreak(moodHistory) {
  if (moodHistory.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toDateString();
    const hasCheckin = moodHistory.some(m => new Date(m.timestamp).toDateString() === dateStr);
    if (hasCheckin) streak++;
    else break;
  }
  return streak;
}

export const performMoodCheckIn = async (userId, mood, stressLevel, energyLevel, note = '') => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const sentiment = analyzeSentiment(note);
  const stressResult = detectStress(note, mood, stressLevel, sentiment);

  const moodLog = {
    timestamp: new Date(),
    mood,
    moodEmoji: getMoodEmoji(mood),
    stressLevel: stressLevel || 3,
    energyLevel: energyLevel || 3,
    note,
    detectedStress: stressResult.detected,
    stressSeverity: stressResult.severity,
    sentimentScore: sentiment.score,
    sentimentIntensity: sentiment.intensity,
  };

  user.wellness.moodHistory.push(moodLog);
  user.wellness.weeklyMoodAverage = calculateWeeklyAverage(user.wellness.moodHistory);
  user.wellness.wellnessStreak = calculateWellnessStreak(user.wellness.moodHistory);
  await user.save();

  let intervention = null;
  if (stressResult.detected) {
    intervention = await suggestIntervention(userId, stressLevel, sentiment, stressResult.severity);
  }

  return { moodLog, stressDetected: stressResult.detected, stressSeverity: stressResult.severity, intervention };
};

export const suggestIntervention = async (userId, stressLevel, sentiment, severity = 'medium') => {
  let interventionType = 'motivational_quote';
  if (severity === 'high' || stressLevel >= 5) interventionType = 'breathing';
  else if (severity === 'high' || sentiment.score < -0.5) interventionType = 'meditation';
  else if (severity === 'medium') interventionType = 'motivational_quote';
  else interventionType = 'break_reminder';

  const interventions = {
    breathing: {
      type: 'breathing', title: 'Quick Breathing Exercise',
      content: 'Try 4-7-8 breathing: Inhale 4s, Hold 7s, Exhale 8s. Repeat 4 times.',
    },
    meditation: {
      type: 'meditation', title: 'Quick Meditation',
      content: 'Close your eyes. Focus on your breath for 2 minutes. Let thoughts pass like clouds.',
    },
    motivational_quote: {
      type: 'motivational_quote', title: 'Motivational Insight',
      content: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    },
    break_reminder: {
      type: 'break_reminder', title: 'Take a Break',
      content: "You've been working hard. Take a 15-min break — walk, hydrate, stretch!",
    },
  };

  const intervention = await WellnessIntervention.create({
    userId,
    ...interventions[interventionType],
    triggeredBy: 'stress_detection',
    suggestedAt: new Date(),
  });

  return intervention;
};

export const getWellnessHistory = async (userId, days = 7) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const history = user.wellness.moodHistory.filter(m => new Date(m.timestamp) > daysAgo);
  return {
    moodHistory: history,
    weeklyAverage: user.wellness.weeklyMoodAverage,
    streak: user.wellness.wellnessStreak,
  };
};

export const getWellnessInsights = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  const moodHistory = user.wellness.moodHistory;
  const recent7 = moodHistory.slice(-7).map(m => m.mood);
  const trend = recent7.length >= 2 ? (recent7[recent7.length - 1] > recent7[0] ? 'improving' : 'declining') : 'stable';
  return {
    weeklyAverage: user.wellness.weeklyMoodAverage,
    trend,
    streak: user.wellness.wellnessStreak,
    totalCheckins: moodHistory.length,
  };
};

export const respondToIntervention = async (interventionId, response, feedback) => {
  const intervention = await WellnessIntervention.findById(interventionId);
  if (!intervention) throw new NotFoundError('Intervention not found');
  intervention.userResponse = response;
  if (feedback) intervention.feedback = feedback;
  await intervention.save();
  return intervention;
};

export const getTodayCheckInStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  const today = new Date().toDateString();
  const todayEntry = user.wellness.moodHistory.find(m => new Date(m.timestamp).toDateString() === today);
  return {
    checkedIn: !!todayEntry,
    todayEntry: todayEntry || null,
  };
};

export const getDailyNudge = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  const moodHistory = user.wellness.moodHistory || [];
  const streak = user.wellness.wellnessStreak || 0;
  const nudge = getWellnessNudge(moodHistory, streak);
  return nudge;
};

export const getMoodChartData = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  const moodHistory = user.wellness.moodHistory || [];
  const chartData = get7DayMoodData(moodHistory);
  const weeklyAvg = user.wellness.weeklyMoodAverage || 0;
  const streak = user.wellness.wellnessStreak || 0;
  return { chartData, weeklyAvg, streak };
};
