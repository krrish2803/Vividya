import mongoose from 'mongoose';

const uploadedNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'image'], required: true },
  fileSize: Number,
  fileData: { type: Buffer }, // stores the actual file in MongoDB
  mimeType: String,
  uploadedAt: { type: Date, default: Date.now },
  analysis: {
    summary: String,
    keyPoints: [String],
    quizGenerated: [{
      question: String,
      options: [String],
      correctAnswer: String,
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    }],
    topicsDetected: [String],
    estimatedReadTime: Number,
  },
  metadata: {
    college: String,
    branch: String,
    subject: String,
    chapter: Number,
    isPublic: { type: Boolean, default: false },
  },
  accessedAt: Date,
}, { timestamps: true });

// Exclude fileData from queries by default
uploadedNoteSchema.set('toJSON', { virtuals: false });
uploadedNoteSchema.set('toObject', { virtuals: false });

uploadedNoteSchema.index({ userId: 1, uploadedAt: -1 });
uploadedNoteSchema.index({ userId: 1, 'metadata.subject': 1 });

export default mongoose.model('UploadedNote', uploadedNoteSchema);
