import mongoose from 'mongoose';

const careerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  branch: String,
  year: Number,
  interests: [String],
  careerGoals: [String],
  parsedResumeData: {
    skills: [{ name: String, level: String }],
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
  resumeFileRef: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedNote' },
  resume: {
    fileData: Buffer,
    mimeType: String,
    filename: String,
    uploadedAt: Date,
    parsedData: {
      skills: [{ name: String, level: { type: String, enum: ['beginner', 'intermediate', 'expert'] } }],
      experience: [{ title: String, company: String, duration: String, skillsUsed: [String] }],
      education: { degree: String, branch: String, gpa: String },
      projects: [{ name: String, description: String, skills: [String] }],
    },
  },
  careerAnalysis: {
    topRoles: [{
      role: String,
      matchScore: Number,
      companies: [String],
      averageSalary: String,
    }],
    skillGaps: [{
      skill: String,
      priority: { type: String, enum: ['high', 'medium', 'low'] },
      roadmap: [String],
      resources: [String],
    }],
    nextSteps: [String],
    timeline: {
      month1_2: String,
      month3_4: String,
      month5_6: String,
    },
  },
}, { timestamps: true });

careerProfileSchema.index({ userId: 1 });

export default mongoose.model('CareerProfile', careerProfileSchema);
