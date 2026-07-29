import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  messageType: { type: String, enum: ['text', 'voice', 'image'], default: 'text' },
  content: { type: String, required: true },
  voiceData: { type: Buffer }, // stores AI voice audio in MongoDB
  voiceMimeType: { type: String, default: 'audio/wav' },
  language: { type: String, enum: ['en', 'hi', 'hi-en', 'ta', 'te', 'mr', 'bn', 'gu', 'kn', 'ml', 'or', 'pa', 'ur'], default: 'en' },
  aiResponse: {
    text: String,
    confidence: Number,
    modelUsed: String,
    generatedAt: Date,
  },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationType: { type: String, enum: ['tutor', 'career', 'wellness'], required: true },
  messages: [messageSchema],
  context: {
    userBranch: String,
    userYear: Number,
    previousNotes: [String],
    knowledgeBase: [String],
  },
  metadata: {
    totalMessages: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    language: { type: String, default: 'en' },
    quality: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    isArchived: { type: Boolean, default: false },
  },
}, { timestamps: true });

conversationSchema.index({ userId: 1, conversationType: 1 });
conversationSchema.index({ userId: 1, updatedAt: -1 });

conversationSchema.pre('save', function(next) {
  this.metadata.totalMessages = this.messages.length;
  if (this.messages.length >= 2) {
    const first = this.messages[0].timestamp;
    const last = this.messages[this.messages.length - 1].timestamp;
    this.metadata.duration = Math.floor((last - first) / 1000);
  }
  next();
});

export default mongoose.model('Conversation', conversationSchema);
