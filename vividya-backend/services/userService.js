import User from '../models/User.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/error-handler.js';

export const createUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) throw new ConflictError('Email already exists');

  const user = new User(userData);
  await user.save();
  return user.toPublic();
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

export const findUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export const findUserByGoogleId = async (googleId) => {
  return User.findOne({ googleId });
};

export const updateProfile = async (userId, profileData) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  Object.assign(user.profile, profileData);
  await user.save();
  return user.toPublic();
};

export const addMoodEntry = async (userId, mood, note) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  user.wellness.moodHistory.push({ mood, note, timestamp: new Date() });

  // Update study streak
  const today = new Date().toDateString();
  const lastStudy = user.wellness.lastStudyDate?.toDateString();
  if (lastStudy !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastStudy === yesterday) {
      user.wellness.studyStreak += 1;
    } else if (lastStudy !== today) {
      user.wellness.studyStreak = 1;
    }
    user.wellness.lastStudyDate = new Date();
  }

  await user.save();
  return user.wellness;
};

export const incrementChatUsage = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  if (user.subscription.chatMessagesLimit !== -1 &&
      user.subscription.chatMessagesUsed >= user.subscription.chatMessagesLimit) {
    throw new BadRequestError('Chat message limit reached. Upgrade your plan.');
  }

  user.subscription.chatMessagesUsed += 1;
  await user.save();
  return user.subscription;
};

export const incrementNoteUsage = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  if (user.subscription.noteSummariesLimit !== -1 &&
      user.subscription.noteSummariesUsed >= user.subscription.noteSummariesLimit) {
    throw new BadRequestError('Note summary limit reached. Upgrade your plan.');
  }

  user.subscription.noteSummariesUsed += 1;
  await user.save();
  return user.subscription;
};

export const getDashboardStats = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError('User not found');

  return {
    studyStreak: user.wellness?.studyStreak || 0,
    moodToday: user.wellness?.moodHistory?.slice(-1)[0]?.mood || null,
    plan: user.subscription?.plan || 'free',
    chatMessagesUsed: user.subscription?.chatMessagesUsed || 0,
    noteSummariesUsed: user.subscription?.noteSummariesUsed || 0,
  };
};
