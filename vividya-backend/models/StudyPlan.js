import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planType: { type: String, enum: ['weekly', 'daily'], default: 'weekly' },
  generatedAt: { type: Date, default: Date.now },
  schedule: [{
    day: String,
    sessions: [{
      timeSlot: String,
      subject: String,
      topic: String,
      duration: Number,
      priority: String,
      focusLevel: { type: String, enum: ['deep', 'coding', 'light'], default: 'coding' },
      resources: [String],
      type: { type: String, enum: ['study', 'break'], default: 'study' },
    }],
  }],
  factors: {
    preferredStudyHours: String,
    subjects: [String],
    upcomingExams: [{ subject: String, date: Date, daysAway: Number }],
    learningStyle: String,
  },
}, { timestamps: true });

studyPlanSchema.index({ userId: 1, generatedAt: -1 });

export default mongoose.model('StudyPlan', studyPlanSchema);
