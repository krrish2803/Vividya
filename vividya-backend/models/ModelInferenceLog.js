import mongoose from 'mongoose';

const modelInferenceLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  queryText: String,
  modelUsed: { type: String, default: 'nvidia' },
  responseTime: Number,
  inputTokens: Number,
  outputTokens: Number,
  costEstimate: Number,
  timestamp: { type: Date, default: Date.now },
});

modelInferenceLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('ModelInferenceLog', modelInferenceLogSchema);
