import StudyPlan from '../models/StudyPlan.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { NotFoundError } from '../utils/error-handler.js';
import { generateTutorResponse } from './nvidiaService.js';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatHour(h) {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${min.toString().padStart(2, '0')} ${ampm}`;
}

function parseStudyHours(studyHours) {
  const match = studyHours.match(/(\d+)\s*(AM|PM)\s*-\s*(\d+)\s*(AM|PM)/i);
  if (!match) return [9, 17];
  let start = parseInt(match[1]);
  let end = parseInt(match[3]);
  if (match[2].toUpperCase() === 'PM' && start !== 12) start += 12;
  if (match[4].toUpperCase() === 'PM' && end !== 12) end += 12;
  return [start, end];
}

function determineFocusLevel(sessionNumber) {
  if (sessionNumber === 0) return 'deep';
  if (sessionNumber >= 3) return 'light';
  return 'coding';
}

function suggestResources(subject) {
  const map = {
    'DSA': ['LeetCode', 'GeeksforGeeks', 'InterviewBit'],
    'Physics': ['Textbook', 'NCERT', 'Khan Academy'],
    'Chemistry': ['Textbook', 'NTA Papers', 'Vedantu'],
    'DBMS': ['GeeksforGeeks', 'W3Schools', 'TutorialsPoint'],
    'Mathematics': ['Khan Academy', 'MIT OCW', 'Textbook'],
    'OS': ['GeeksforGeeks', 'YouTube - Neso Academy', 'Textbook'],
    'CN': ['GeeksforGeeks', 'Stanford Notes', 'YouTube'],
  };
  return map[subject] || ['Textbook', 'YouTube', 'Notes'];
}

export const createTask = async (userId, taskData) => {
  const task = new Task({ userId, ...taskData });
  await task.save();
  return task;
};

export const getTasks = async (userId, status) => {
  const query = { userId };
  if (status) query.status = status;
  return Task.find(query).sort({ priority: -1, deadline: 1 }).lean();
};

export const completeTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) throw new NotFoundError('Task not found');
  task.status = 'completed';
  task.completedAt = new Date();
  await task.save();
  return task;
};

export const deleteTask = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, userId });
  if (!task) throw new NotFoundError('Task not found');
  return task;
};

export const generateStudyPlan = async (userId, duration = 'weekly', topicContext = null) => {
  const user = await User.findById(userId);
  const tasks = await Task.find({ userId, status: { $ne: 'completed' } }).sort({ priority: -1 });

  const [startHour, endHour] = parseStudyHours(user.preferences?.studyHours || '9 AM - 5 PM');
  const days = duration === 'weekly' ? 7 : 1;
  const schedule = [];

  const userSubjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];
  const defaultSubjects = ['Revision', 'Self Study', 'General Reading', 'Practice Problems'];
  const subjectsToUse = userSubjects.length > 0 ? userSubjects : defaultSubjects;

  let taskQueue = [];

  if (topicContext) {
    const prompt = `Analyze this topic or query: "${topicContext}".
Break this down into exactly ${days * 3} logical, sequential lesson topics that a student should study over ${days} days.
For each lesson topic, specify:
1. "title": a clear, specific, descriptive lesson title (e.g., "Neural Networks & Activation Functions" or "Backpropagation Mechanics").
2. "subject": the subject name (e.g., "Deep Learning").
3. "estimatedTime": 90 (integer minutes).
4. "priority": 4 (priority from 1 to 5).

Respond in JSON only as an array of objects:
[
  { "title": "Lesson Title 1", "subject": "...", "estimatedTime": 90, "priority": 4 },
  ...
]`;
    try {
      const response = await generateTutorResponse(prompt, 'en');
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        taskQueue = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error('Failed to parse AI generated syllabus tasks:', err);
    }
  }

  if (taskQueue.length === 0) {
    taskQueue = [...tasks.map(t => ({ ...t.toObject() }))];
  }

  for (let day = 0; day < days; day++) {
    const daySchedule = { day: dayNames[day], sessions: [] };
    let currentHour = startHour;
    let sessionCount = 0;

    while (currentHour < endHour) {
      let subject, topic, sessionDuration;

      if (taskQueue.length > 0) {
        const task = taskQueue[0];
        sessionDuration = Math.min(90, Math.max(30, task.estimatedTime || 60));
        subject = task.subject || 'General';
        topic = task.title;

        daySchedule.sessions.push({
          timeSlot: `${formatHour(currentHour)} - ${formatHour(currentHour + sessionDuration / 60)}`,
          subject,
          topic,
          duration: sessionDuration,
          priority: String(task.priority || 3),
          focusLevel: determineFocusLevel(sessionCount),
          resources: suggestResources(subject),
          type: 'study',
        });

        currentHour += sessionDuration / 60;
        task.estimatedTime -= sessionDuration;
        if (task.estimatedTime <= 0) taskQueue.shift();
      } else {
        sessionDuration = 60;
        subject = subjectsToUse[sessionCount % subjectsToUse.length];

        const topics = [
          'Concept Review & Summarization',
          'Practice Problems & Active Recall',
          'Note Revision & Flashcards',
          'Mock Quiz & Weak Area Focus'
        ];
        topic = topics[sessionCount % topics.length];

        if (currentHour + sessionDuration / 60 > endHour) {
          sessionDuration = Math.round((endHour - currentHour) * 60);
        }
        if (sessionDuration < 15) break;

        daySchedule.sessions.push({
          timeSlot: `${formatHour(currentHour)} - ${formatHour(currentHour + sessionDuration / 60)}`,
          subject,
          topic,
          duration: sessionDuration,
          priority: '3',
          focusLevel: determineFocusLevel(sessionCount),
          resources: suggestResources(subject),
          type: 'study',
        });

        currentHour += sessionDuration / 60;
      }

      if (sessionCount % 2 === 1 && currentHour < endHour) {
        daySchedule.sessions.push({
          timeSlot: `${formatHour(currentHour)} - ${formatHour(currentHour + 0.25)}`,
          type: 'break', duration: 15, subject: 'Break', topic: 'Rest & recharge',
          focusLevel: 'light', resources: [],
        });
        currentHour += 0.25;
      }
      sessionCount++;
    }

    schedule.push(daySchedule);
  }

  const studyPlan = new StudyPlan({
    userId,
    planType: duration,
    generatedAt: new Date(),
    schedule,
    factors: {
      preferredStudyHours: user.preferences?.studyHours || '9 AM - 5 PM',
      subjects: tasks.map(t => t.subject).filter(Boolean),
      learningStyle: user.preferences?.learningStyle || 'mixed',
    },
  });

  await studyPlan.save();
  return studyPlan;
};

export const getCurrentPlan = async (userId) => {
  return StudyPlan.findOne({ userId }).sort({ generatedAt: -1 });
};

export const logPomodoro = async (userId, taskId, minutes) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) throw new NotFoundError('Task not found');
  task.pomodoros.completed = (task.pomodoros.completed || 0) + 1;
  task.pomodoros.totalMinutes = (task.pomodoros.totalMinutes || 0) + minutes;
  task.timeSpent = (task.timeSpent || 0) + minutes;
  task.lastStudiedAt = new Date();
  await task.save();
  return task;
};

export const autoAdjustPlan = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const tasks = await Task.find({ userId }).sort({ priority: -1, deadline: 1 });
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const recentMoods = (user.wellness?.moodHistory || []).slice(-7);
  const avgMood = recentMoods.length > 0
    ? recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length
    : 3;
  const avgEnergy = recentMoods.length > 0
    ? recentMoods.reduce((s, m) => s + (m.energyLevel || 3), 0) / recentMoods.length
    : 3;
  const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0;

  const context = {
    pending: pendingTasks.map(t => ({
      title: t.title, subject: t.subject, priority: t.priority,
      estimatedTime: t.estimatedTime, deadline: t.deadline,
      pomodorosCompleted: t.pomodoros?.completed || 0,
      timeSpent: t.timeSpent || 0,
    })),
    completed: completedTasks.slice(-5).map(t => t.title),
    avgMood: avgMood.toFixed(1),
    avgEnergy: avgEnergy.toFixed(1),
    completionRate: (completionRate * 100).toFixed(0) + '%',
    studyHours: user.preferences?.studyHours || '9 AM - 5 PM',
  };

  const prompt = `You are an AI study planner for an Indian college student.
Analyze their current tasks, mood, and completion rate, then suggest adjustments.

Current State:
- Avg Mood (1-5): ${context.avgMood}
- Avg Energy (1-5): ${context.avgEnergy}
- Task Completion Rate: ${context.completionRate}
- Study Hours: ${context.studyHours}

Pending Tasks (${pendingTasks.length}):
${context.pending.map(t => `- "${t.title}" (${t.subject}) P${t.priority}, ${t.estimatedTime}min est, spent ${t.timeSpent}min, ${t.pomodorosCompleted} pomodoros`).join('\n') || 'None'}

Completed Recently: ${context.completed.join(', ') || 'None'}

Respond in JSON only:
{
  "recommendation": "brief recommendation",
  "adjustments": [
    { "taskTitle": "...", "action": "reprioritize|extend|shorten|skip", "reason": "...", "newPriority": N }
  ],
  "scheduleSuggestion": "suggested study approach for today",
  "moodBasedTip": "tip based on their current mood/energy"
}`;

  try {
    const response = await generateTutorResponse(prompt, 'en');
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    // fallback
  }

  const moodTip = avgMood <= 2
    ? "You seem low. Start with lighter subjects and take breaks often."
    : avgMood >= 4
    ? "Great mood! Tackle your hardest subjects now."
    : "Steady energy today. Stick to your routine and stay consistent.";

  return {
    recommendation: `Completion rate is ${(completionRate * 100).toFixed(0)}%. ${pendingTasks.length} tasks pending.`,
    adjustments: pendingTasks.slice(0, 3).map(t => ({
      taskTitle: t.title,
      action: t.priority >= 4 ? 'reprioritize' : 'extend',
      reason: t.priority >= 4 ? 'High priority — focus here first' : 'Allow more time for thorough understanding',
      newPriority: Math.min(5, t.priority + 1),
    })),
    scheduleSuggestion: `Study for ${Math.round(avgEnergy * 30)} min blocks with 5-min breaks. Focus on high-priority tasks first.`,
    moodBasedTip: moodTip,
  };
};
