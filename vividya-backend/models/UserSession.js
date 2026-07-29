import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refreshToken: { type: String, required: true },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'] },
  },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSessionSchema.index({ userId: 1, isActive: 1 });
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('UserSession', userSessionSchema);
