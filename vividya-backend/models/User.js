import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: function() { return this.authProvider === 'email'; },
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email',
  },
  googleId: {
    type: String,
    sparse: true,
  },
  profile: {
    fullName: { type: String, required: true, trim: true },
    branch: { type: String, default: '' },
    year: { type: Number, min: 1, max: 8 },
    college: { type: String, default: '' },
    interests: [String],
    goals: [String],
    languages: { type: [String], default: ['en'] },
    preferredLanguage: { type: String, enum: ['en', 'hi', 'hi-en', 'mr'], default: 'en' },
  },
  wellness: {
    moodHistory: [{
      timestamp: { type: Date, default: Date.now },
      mood: { type: Number, min: 1, max: 5 },
      moodEmoji: String,
      stressLevel: { type: Number, min: 1, max: 5 },
      energyLevel: { type: Number, min: 1, max: 5 },
      note: String,
      detectedStress: { type: Boolean, default: false },
      sentimentScore: Number,
    }],
    studyStreak: { type: Number, default: 0 },
    wellnessStreak: { type: Number, default: 0 },
    weeklyMoodAverage: { type: Number, default: 0 },
    lastStudyDate: Date,
  },
  hybrid: {
    preferredModel: { type: String, enum: ['nvidia', 'auto'], default: 'auto' },
    offlineMode: { type: Boolean, default: false },
    totalTokensUsed: { type: Number, default: 0 },
    costThisMonth: { type: Number, default: 0 },
  },
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'elite'], default: 'free' },
    startDate: Date,
    endDate: Date,
    chatMessagesUsed: { type: Number, default: 0 },
    chatMessagesLimit: { type: Number, default: 500 },
    noteSummariesUsed: { type: Number, default: 0 },
    noteSummariesLimit: { type: Number, default: 10 },
  },
  isActive: { type: Boolean, default: true },
  preferences: {
    darkMode: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    dataCollection: { type: Boolean, default: true },
    studyHours: { type: String, default: '9 AM - 5 PM' },
    learningStyle: { type: String, enum: ['visual', 'kinesthetic', 'auditory', 'mixed'], default: 'mixed' },
  },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toPublic = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);
