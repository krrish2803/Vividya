import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  subject: String,
  priority: { type: Number, min: 1, max: 5, default: 3 },
  estimatedTime: { type: Number, default: 60 },
  deadline: Date,
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  completedAt: Date,
  timeSpent: { type: Number, default: 0 },
  aiPrioritized: { type: Boolean, default: false },
  pomodoros: {
    target: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
  },
  lastStudiedAt: Date,
}, { timestamps: true });

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });

export default mongoose.model('Task', taskSchema);
