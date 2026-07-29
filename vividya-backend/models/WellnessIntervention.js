import mongoose from 'mongoose';

const wellnessInterventionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['breathing', 'meditation', 'motivational_quote', 'break_reminder'], required: true },
  title: String,
  content: String,
  triggeredBy: { type: String, enum: ['stress_detection', 'low_mood', 'manual'], default: 'manual' },
  userResponse: { type: String, enum: ['accepted', 'dismissed', 'saved'], default: null },
  feedback: { type: String, enum: ['helped', 'not_helpful', 'skip'], default: null },
  suggestedAt: { type: Date, default: Date.now },
}, { timestamps: true });

wellnessInterventionSchema.index({ userId: 1, suggestedAt: -1 });

export default mongoose.model('WellnessIntervention', wellnessInterventionSchema);
