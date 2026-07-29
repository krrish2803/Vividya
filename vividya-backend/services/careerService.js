import CareerProfile from '../models/CareerProfile.js';
import * as nvidiaService from './nvidiaService.js';
import { extractText } from './noteService.js';
import { NotFoundError, BadRequestError } from '../utils/error-handler.js';
import logger from '../utils/logger.js';

const skillResources = {
  'dsa': ['LeetCode', 'GeeksforGeeks', 'InterviewBit', 'Striver SDE Sheet', 'NeetCode'],
  'system design': ['DesignGurus.io', 'AlgoExpert System Design', 'YouTube - System Design Interview', 'Alex Xu - System Design Interview'],
  'react': ['React Docs', 'Full Stack Open', 'Scrimba React Course', 'Epic React'],
  'node.js': ['Node.js Docs', 'The Node.js Handbook', 'YouTube - Traversy Media'],
  'python': ['Python Docs', 'Automate the Boring Stuff', 'HackerRank Python', 'Corey Schafer YouTube'],
  'machine learning': ['Andrew Ng ML Course', 'Kaggle Learn', 'Fast.ai', 'StatQuest YouTube'],
  'aws': ['AWS Free Tier', 'AWS Cloud Practitioner', 'Stephane Maarek Udemy'],
  'sql': ['W3Schools SQL', 'SQLBolt', 'LeetCode SQL', 'Mode Analytics SQL Tutorial'],
  'docker': ['Docker Docs', 'Docker Getting Started', 'YouTube - TechWorld with Nana'],
  'git': ['Git Docs', 'GitHub Skills', 'Oh Shit Git'],
  'typescript': ['TypeScript Handbook', 'Total TypeScript', 'Matt Pocock TS'],
  'mongodb': ['MongoDB University', 'M001 MongoDB Basics', 'The Net Ninja MongoDB'],
  'redis': ['Redis University', 'Redis Docs'],
  'graphql': ['How to GraphQL', 'Apollo GraphQL Docs'],
  'default': ['YouTube', 'GeeksforGeeks', 'Medium', 'Official Docs'],
};

const commonRoles = [
  {
    role: 'Software Engineer (SDE)',
    requiredSkills: ['dsa', 'react', 'node.js', 'system design', 'sql', 'git'],
    niceToHave: ['typescript', 'docker', 'mongodb'],
    salary: '₹15-35 LPA',
    description: 'Build and maintain software systems, solve complex problems, write clean code.',
    companies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Razorpay', 'Dcoder', 'Zoho'],
  },
  {
    role: 'Full Stack Developer',
    requiredSkills: ['react', 'node.js', 'sql', 'git', 'docker'],
    niceToHave: ['typescript', 'mongodb', 'redis', 'graphql'],
    salary: '₹12-28 LPA',
    description: 'Build end-to-end web applications — frontend, backend, and database.',
    companies: ['Swiggy', 'Zomato', 'Meesho', 'Cred', 'PhonePe', 'Freshworks'],
  },
  {
    role: 'Data Scientist',
    requiredSkills: ['python', 'machine learning', 'sql'],
    niceToHave: ['tensorflow', 'pandas', 'numpy', 'statistics'],
    salary: '₹15-30 LPA',
    description: 'Analyze data, build ML models, extract insights for business decisions.',
    companies: ['Google', 'Amazon', 'Flipkart', 'Ola', 'Nykaa', 'Razorpay'],
  },
  {
    role: 'DevOps Engineer',
    requiredSkills: ['docker', 'aws', 'git', 'system design'],
    niceToHave: ['kubernetes', 'terraform', 'jenkins', 'linux'],
    salary: '₹12-25 LPA',
    description: 'Manage CI/CD pipelines, cloud infrastructure, and deployment automation.',
    companies: ['Amazon', 'Microsoft', 'Razorpay', 'PhonePe', 'Jio'],
  },
  {
    role: 'Backend Developer',
    requiredSkills: ['node.js', 'sql', 'system design', 'dsa', 'git'],
    niceToHave: ['python', 'redis', 'mongodb', 'docker'],
    salary: '₹12-25 LPA',
    description: 'Build scalable APIs, design databases, handle server-side logic.',
    companies: ['Flipkart', 'Swiggy', 'Zomato', 'Ola', 'Dream11'],
  },
  {
    role: 'Frontend Developer',
    requiredSkills: ['react', 'git', 'system design'],
    niceToHave: ['typescript', 'css', 'next.js', 'tailwind'],
    salary: '₹10-22 LPA',
    description: 'Build responsive, performant user interfaces and interactive experiences.',
    companies: ['Razorpay', 'Cred', 'Zeta', 'Cleartrip', 'MakeMyTrip'],
  },
  {
    role: 'ML Engineer',
    requiredSkills: ['python', 'machine learning', 'sql', 'docker'],
    niceToHave: ['tensorflow', 'pytorch', 'aws', 'mlops'],
    salary: '₹15-35 LPA',
    description: 'Deploy ML models to production, build training pipelines, optimize inference.',
    companies: ['Google', 'Amazon', 'Microsoft', 'Ola', 'PhonePe'],
  },
  {
    role: 'Cloud Engineer',
    requiredSkills: ['aws', 'docker', 'git', 'system design'],
    niceToHave: ['kubernetes', 'terraform', 'python', 'linux'],
    salary: '₹12-28 LPA',
    description: 'Design, deploy, and manage cloud infrastructure on AWS/Azure/GCP.',
    companies: ['Amazon', 'Microsoft', 'Jio', 'TCS', 'Infosys'],
  },
];

// ─── Resume Parser ──────────────────────────────────────────────
export const parseResumeFromBuffer = async (fileBuffer, mimeType) => {
  let text;
  if (mimeType === 'application/pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(fileBuffer);
    text = data.text;
  } else {
    text = await extractText(fileBuffer, 'image');
  }

  if (!text || text.trim().length < 20) throw new BadRequestError('Could not extract text from resume');

  const prompt = `Extract resume information and return ONLY valid JSON:
{
  "skills": [{"name": "skill name", "level": "beginner|intermediate|expert"}],
  "experience": [{"title": "Job Title", "company": "Company", "duration": "3 months", "skillsUsed": ["skill1"]}],
  "education": {"degree": "B.Tech", "branch": "CSE", "gpa": "8.5"},
  "projects": [{"name": "Project Name", "description": "Description", "skills": ["skill1"]}],
  "summary": "One line summary of the candidate"
}

Resume text:
${text.substring(0, 4000)}`;

  const result = await nvidiaService.generateTutorResponse(prompt, '', 'en');
  const jsonMatch = result.text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch { return {}; }
  }
  return {};
};

// ─── Career Fit Analysis ────────────────────────────────────────
export const analyzeCareerFit = async (userId, parsedData) => {
  const userSkills = (parsedData.skills || []).map(s => {
    if (typeof s === 'string') return s.toLowerCase().trim();
    if (s && typeof s === 'object' && s.name) return s.name.toLowerCase().trim();
    return '';
  }).filter(Boolean);
  const projectSkills = (parsedData.projects || []).flatMap(p => (p.skills || []).map(s => {
    if (typeof s === 'string') return s.toLowerCase().trim();
    if (s && typeof s === 'object' && s.name) return s.name.toLowerCase().trim();
    return s ? String(s).toLowerCase().trim() : '';
  })).filter(Boolean);
  const allSkills = [...new Set([...userSkills, ...projectSkills])];

  // Score each role
  const matches = commonRoles.map(role => {
    const matchedRequired = role.requiredSkills.filter(s => allSkills.some(us => us.includes(s) || s.includes(us)));
    const matchedNice = (role.niceToHave || []).filter(s => allSkills.some(us => us.includes(s) || s.includes(us)));
    const missingRequired = role.requiredSkills.filter(s => !allSkills.some(us => us.includes(s) || s.includes(us)));
    const missingNice = (role.niceToHave || []).filter(s => !allSkills.some(us => us.includes(s) || s.includes(us)));

    // Fit score: required skills weighted 80%, nice-to-have 20%
    const requiredScore = matchedRequired.length / role.requiredSkills.length;
    const niceScore = role.niceToHave?.length ? matchedNice.length / role.niceToHave.length : 0;
    const fitScore = Math.round((requiredScore * 0.8 + niceScore * 0.2) * 100);

    // Build justification
    const justification = [];
    if (matchedRequired.length === role.requiredSkills.length) {
      justification.push(`You have ALL ${role.requiredSkills.length} required skills`);
    } else {
      justification.push(`You have ${matchedRequired.length}/${role.requiredSkills.length} required skills: ${matchedRequired.join(', ')}`);
    }
    if (missingRequired.length > 0) {
      justification.push(`Missing required: ${missingRequired.join(', ')}`);
    }
    if (matchedNice.length > 0) {
      justification.push(`Bonus skills: ${matchedNice.join(', ')}`);
    }
    if (parsedData.projects?.length) {
      justification.push(`${parsedData.projects.length} project(s) on your resume`);
    }
    if (parsedData.experience?.length) {
      justification.push(`${parsedData.experience.length} experience(s)`);
    }

    return {
      role: role.role,
      description: role.description,
      fitScore,
      matchedSkills: [...matchedRequired, ...matchedNice],
      missingRequired,
      missingNice,
      justification,
      companies: role.companies,
      averageSalary: role.salary,
    };
  }).sort((a, b) => b.fitScore - a.fitScore);

  const topRoles = matches.slice(0, 5);

  // Skill gaps (across top 3 roles)
  const allMissing = new Map();
  matches.slice(0, 3).forEach(m => {
    m.missingRequired.forEach(s => {
      allMissing.set(s, { count: (allMissing.get(s)?.count || 0) + 1, priority: 'high' });
    });
    (m.missingNice || []).forEach(s => {
      if (!allMissing.has(s)) allMissing.set(s, { count: 0, priority: 'medium' });
    });
  });

  const skillGaps = [...allMissing.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([skill, data]) => ({
      skill,
      priority: data.priority,
      resources: skillResources[skill.toLowerCase()] || skillResources['default'],
    }));

  return { topRoles, skillGaps, userSkills: allSkills };
};

// ─── 6-Month Roadmap ───────────────────────────────────────────
export const generateRoadmap = async (userId, targetRole, parsedData) => {
  const profile = await CareerProfile.findOne({ userId });
  const userSkills = profile?.parsedResumeData?.skills?.map(s => s.name.toLowerCase()) || [];

  const role = commonRoles.find(r => r.role === targetRole) || commonRoles[0];
  const missingSkills = role.requiredSkills.filter(s => !userSkills.some(us => us.includes(s) || s.includes(us)));

  const prompt = `Create a detailed 6-month personalized study roadmap for an Indian college student.

Target Role: ${role.role}
Required Skills: ${role.requiredSkills.join(', ')}
Current Skills: ${userSkills.join(', ') || 'None listed'}
Missing Skills to Learn: ${missingSkills.join(', ') || 'None — already strong!'}

Return ONLY valid JSON:
{
  "summary": "One-line overview",
  "months": [
    {
      "month": "Month 1",
      "theme": "Foundation Building",
      "goals": ["Goal 1", "Goal 2"],
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "resources": ["Resource 1", "Resource 2"],
      "milestone": "What you should be able to do by end of month"
    }
  ],
  "weeklySchedule": {
    "monday": "DSA practice (2 hrs)",
    "tuesday": "Project work (2 hrs)",
    "wednesday": "DSA practice (2 hrs)",
    "thursday": "New skill learning (2 hrs)",
    "friday": "Project work (2 hrs)",
    "saturday": "Mock interview / revision",
    "sunday": "Rest + light review"
  },
  "endGoals": ["Goal 1", "Goal 2", "Goal 3"]
}`;

  try {
    const response = await nvidiaService.generateTutorResponse(prompt, '', 'en');
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    logger.error(`Roadmap generation failed: ${err.message}`);
  }

  // Fallback roadmap
  return {
    summary: `6-month roadmap to become a ${role.role}`,
    months: [
      { month: 'Month 1', theme: 'DSA Foundations', goals: ['Solve 30 DSA problems', 'Learn arrays, strings, linked lists'], tasks: ['Practice on LeetCode', 'Study Striver SDE Sheet', 'Build a small project'], resources: ['LeetCode', 'GeeksforGeeks'], milestone: 'Solve easy DSA problems confidently' },
      { month: 'Month 2', theme: 'DSA Intermediate', goals: ['Solve 40 DSA problems', 'Learn trees, graphs, DP'], tasks: ['Practice medium problems', 'Study recursion & backtracking'], resources: ['InterviewBit', 'NeetCode'], milestone: 'Solve medium DSA problems' },
      { month: 'Month 3', theme: 'Project Building', goals: ['Build 1 full-stack project', 'Learn React + Node.js'], tasks: ['Complete a CRUD app', 'Deploy to production', 'Write clean code'], resources: ['React Docs', 'Node.js Docs'], milestone: 'Deploy a working full-stack project' },
      { month: 'Month 4', theme: 'System Design + Projects', goals: ['Learn system design basics', 'Build 2nd project'], tasks: ['Study scalability concepts', 'Build a real-time app'], resources: ['DesignGurus.io', 'YouTube'], milestone: 'Explain basic system design concepts' },
      { month: 'Month 5', theme: 'Interview Preparation', goals: ['Solve 50 DSA problems', 'Practice mock interviews'], tasks: ['Solve medium-hard problems', 'Mock interviews with peers', 'Revise all topics'], resources: ['LeetCode', 'InterviewBit'], milestone: 'Confident in mock interviews' },
      { month: 'Month 6', theme: 'Apply & Ship', goals: ['Apply to 20+ companies', 'Polish resume'], tasks: ['Apply to companies', 'Refine resume', 'Practice HR questions'], resources: ['LinkedIn', 'Company career pages'], milestone: 'Get interview calls and offers' },
    ],
    weeklySchedule: {
      monday: 'DSA practice (2 hrs)',
      tuesday: 'Project work (2 hrs)',
      wednesday: 'DSA practice (2 hrs)',
      thursday: 'New skill learning (2 hrs)',
      friday: 'Project work (2 hrs)',
      saturday: 'Mock interview / revision',
      sunday: 'Rest + light review',
    },
    endGoals: [
      'Solve 150+ DSA problems',
      'Build 2-3 portfolio projects',
      'Clear technical interviews',
      'Get placed at a top company',
    ],
  };
};

// ─── Mock Interview Questions ───────────────────────────────────
export const generateMockInterview = async (userId, targetRole) => {
  const role = commonRoles.find(r => r.role === targetRole) || commonRoles[0];

  const prompt = `Generate 5 mock interview questions for a ${role.role} position at a top Indian tech company.

Required skills for this role: ${role.requiredSkills.join(', ')}

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "category": "DSA|Technical|System Design|Behavioral|Problem Solving",
      "question": "The interview question",
      "difficulty": "Easy|Medium|Hard",
      "expectedApproach": "Brief description of how to approach this",
      "tips": ["Tip 1", "Tip 2"],
      "followUp": "A follow-up question the interviewer might ask"
    }
  ]
}

Make questions realistic — the kind asked at companies like ${role.companies.slice(0, 3).join(', ')}. Mix easy, medium, and hard.`;

  try {
    const response = await nvidiaService.generateTutorResponse(prompt, '', 'en');
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    logger.error(`Mock interview generation failed: ${err.message}`);
  }

  // Fallback
  return {
    questions: [
      { id: 1, category: 'DSA', question: 'Given an array of integers, find two numbers that add up to a target sum.', difficulty: 'Medium', expectedApproach: 'Use a hash map to store complements.', tips: ['Think about time complexity', 'Handle edge cases'], followUp: 'Can you solve it in O(n) time and O(1) space?' },
      { id: 2, category: 'Technical', question: 'Explain the difference between SQL and NoSQL databases. When would you use each?', difficulty: 'Easy', expectedApproach: 'Compare structure, scalability, use cases.', tips: ['Give real examples', 'Mention ACID vs BASE'], followUp: 'How would you design a schema for a social media app?' },
      { id: 3, category: 'System Design', question: 'Design a URL shortener like bit.ly. Walk me through the architecture.', difficulty: 'Hard', expectedApproach: 'Discuss hashing, storage, scaling, caching.', tips: ['Start with requirements', 'Draw the diagram'], followUp: 'How would you handle 1 billion URLs?' },
      { id: 4, category: 'Behavioral', question: 'Tell me about a time you had to learn a new technology quickly for a project.', difficulty: 'Easy', expectedApproach: 'Use STAR format: Situation, Task, Action, Result.', tips: ['Be specific', 'Show learning ability'], followUp: 'What would you do differently next time?' },
      { id: 5, category: 'Problem Solving', question: 'You have a web application that is slow. How would you diagnose and fix the performance issue?', difficulty: 'Medium', expectedApproach: 'Check database queries, caching, network, frontend.', tips: ['Think systematically', 'Mention monitoring tools'], followUp: 'How would you prevent this in the future?' },
    ],
  };
};

// ─── Profile CRUD ───────────────────────────────────────────────
export const createOrUpdateCareerProfile = async (userId, data) => {
  let profile = await CareerProfile.findOne({ userId });
  if (!profile) {
    profile = new CareerProfile({ userId, ...data });
  } else {
    Object.assign(profile, data);
  }
  await profile.save();
  return profile;
};

export const getCareerProfile = async (userId) => {
  return CareerProfile.findOne({ userId });
};

export const evaluateAnswer = async (userId, targetRole, question, answer) => {
  const prompt = `You are an expert interviewer evaluating a candidate for the role of: "${targetRole}".
  
  Question asked:
  "${question}"
  
  Candidate's answer:
  "${answer}"
  
  Evaluate the answer critically. Give a score from 1 to 10 (integers only). Provide constructive feedback highlighting:
  1. What the candidate did well.
  2. What was missing or could be improved.
  3. The recommended/ideal answer or key points to mention.
  
  Respond ONLY with valid JSON in this format:
  {
    "score": 8,
    "feedback": "Your answer is very structured, but you missed pointing out..."
  }`;

  try {
    const response = await nvidiaService.generateTutorResponse(prompt, '', 'en');
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error(`Answer evaluation failed: ${err.message}`);
  }

  return {
    score: 5,
    feedback: "Unable to parse AI response. Good effort, keep practicing to structure your explanations using real-world examples."
  };
};
