import mongoose from 'mongoose';

const resumeAnalysisHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  parsedResumeData: {
    skills: [mongoose.Schema.Types.Mixed],
    experience: [{ title: String, company: String, duration: String, skillsUsed: [String] }],
    education: { degree: String, branch: String, gpa: String },
    projects: [{ name: String, description: String, skills: [String] }],
    summary: String
  },
  analysis: {
    topRoles: [{
      role: String,
      description: String,
      fitScore: Number,
      matchedSkills: [String],
      missingRequired: [String],
      missingNice: [String],
      justification: [String],
      companies: [String],
      averageSalary: String
    }],
    skillGaps: [{
      skill: String,
      priority: String,
      resources: [String]
    }],
    userSkills: [String]
  },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

resumeAnalysisHistorySchema.index({ userId: 1 });

export default mongoose.model('ResumeAnalysisHistory', resumeAnalysisHistorySchema);
