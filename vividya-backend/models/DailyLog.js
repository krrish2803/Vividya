import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  activities: {
    messagesCount: { type: Number, default: 0 },
    notesUploaded: { type: Number, default: 0 },
    studyTimeMinutes: { type: Number, default: 0 },
    moodCheckIns: { type: Number, default: 0 },
    careerUsed: { type: Boolean, default: false },
    wellnessUsed: { type: Boolean, default: false },
  },
  summary: {
    mood: String,
    stressLevel: String,
    productivity: String,
  },
}, { timestamps: true });

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyLog', dailyLogSchema);
