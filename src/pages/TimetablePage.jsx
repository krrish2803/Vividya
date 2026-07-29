import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import PomodoroTimer from '../components/PomodoroTimer';
import {
  FaCalendarAlt, FaPlus, FaCheck, FaTrash, FaMagic, FaBook,
  FaClock, FaBrain, FaLightbulb, FaRocket, FaTimes
} from 'react-icons/fa';

export default function TimetablePage() {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [plan, setPlan] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', estimatedTime: 60, priority: 3, deadline: '' });
  const [generating, setGenerating] = useState(false);
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'tasks');
  const [activeTask, setActiveTask] = useState(null);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [adjustments, setAdjustments] = useState(null);
  const [adjustLoading, setAdjustLoading] = useState(false);

  useEffect(() => {
    loadTasks();
    loadPlan();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await api.get('/timetable/tasks');
      setTasks(res.tasks || []);
    } catch (err) { console.error(err); }
  };

  const loadPlan = async () => {
    try {
      const res = await api.get('/timetable/plan');
      setPlan(res.plan || null);
    } catch (err) { console.error(err); }
  };

  const addTask = async () => {
    try {
      await api.post('/timetable/tasks', form);
      setForm({ title: '', subject: '', estimatedTime: 60, priority: 3, deadline: '' });
      setShowAdd(false);
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const completeTask = async (id) => {
    try {
      await api.put(`/timetable/tasks/${id}/complete`);
      if (activeTask?._id === id) { setActiveTask(null); setShowPomodoro(false); }
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/timetable/tasks/${id}`);
      if (activeTask?._id === id) { setActiveTask(null); setShowPomodoro(false); }
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const generatePlan = async (duration) => {
    setGenerating(true);
    try {
      const res = await api.post('/timetable/generate', { duration });
      setPlan(res.plan);
      setTab('plan');
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  };

  const handleAutoAdjust = async () => {
    setAdjustLoading(true);
    try {
      const res = await api.post('/timetable/auto-adjust');
      setAdjustments(res.adjustments);
    } catch (err) { console.error(err); }
    finally { setAdjustLoading(false); }
  };

  const startPomodoro = (task) => {
    setActiveTask(task);
    setShowPomodoro(true);
  };

  const priorityLabel = ['', 'Low', 'Medium', 'High', 'Urgent', 'Critical'];
  const priorityColor = ['', 'text-green-400 bg-green-400/10', 'text-blue-400 bg-blue-400/10', 'text-yellow-400 bg-yellow-400/10', 'text-orange-400 bg-orange-400/10', 'text-red-400 bg-red-400/10'];
  const focusIcon = { deep: '🧠', coding: '💻', light: '📖' };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <FaCalendarAlt className="text-blue-400" /> {t('Study Planner')}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[['tasks', t('My Tasks'), FaCheck], ['plan', t('Study Plan'), FaBook], ['focus', t('Focus Timer'), FaClock]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === key ? 'bg-sarthiPurple text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ═══ TASKS TAB ═══ */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">{t('Pending Tasks')}</h2>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-sarthiPurple text-white px-4 py-2 rounded-xl text-sm hover:bg-sarthiPrimary transition">
              <FaPlus /> {t('Add Task')}
            </button>
          </div>

          <AnimatePresence>
            {showAdd && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="glass-card rounded-xl p-4 border border-sarthiPurple/30 space-y-3">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder={t('Task title')} className="w-full bg-darkBg border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 text-sm" />
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder={t('Subject')} className="w-full bg-darkBg border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 text-sm" />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-sarthiMuted mb-1 block">Est. Time (min)</label>
                    <input type="number" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: +e.target.value })}
                      className="w-full bg-darkBg border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-sarthiMuted mb-1 block">Priority (1-5)</label>
                    <input type="number" min="1" max="5" value={form.priority} onChange={e => setForm({ ...form, priority: +e.target.value })}
                      className="w-full bg-darkBg border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-sarthiMuted mb-1 block">Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                      className="w-full bg-darkBg border border-white/10 rounded-lg p-2.5 text-white text-sm" />
                  </div>
                </div>
                <button onClick={addTask} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition text-sm font-medium">{t('Add Task')}</button>
              </motion.div>
            )}
          </AnimatePresence>

          {tasks.filter(t => t.status !== 'completed').length === 0 && !showAdd && (
            <p className="text-gray-400 text-center py-8">{t('No pending tasks. Add one!')}</p>
          )}

          {tasks.filter(t => t.status !== 'completed').map(task => (
            <div key={task._id} className="glass-card rounded-xl p-4 border border-white/10 flex items-center gap-4 hover:border-sarthiPurple/30 transition">
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-sarthiMuted">{task.subject}</span>
                  <span className="text-xs text-sarthiMuted">·</span>
                  <span className="text-xs text-sarthiMuted">{task.estimatedTime}min</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>
                    P{task.priority} · {priorityLabel[task.priority]}
                  </span>
                  {task.pomodoros?.completed > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sarthiPurple/20 text-sarthiPurple">
                      🍅 {task.pomodoros.completed}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => startPomodoro(task)} title="Start Focus Session"
                className="text-sarthiPurple hover:text-sarthiPink p-2 transition">
                <FaClock className="w-4 h-4" />
              </button>
              <button onClick={() => completeTask(task._id)} className="text-emerald-400 hover:text-emerald-300 p-2 transition">
                <FaCheck className="w-4 h-4" />
              </button>
              <button onClick={() => deleteTask(task._id)} className="text-red-400 hover:text-red-300 p-2 transition">
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))}

          {tasks.filter(t => t.status === 'completed').length > 0 && (
            <>
              <h3 className="text-sm text-gray-500 mt-4 font-medium">{t('Completed')}</h3>
              {tasks.filter(t => t.status === 'completed').map(task => (
                <div key={task._id} className="glass-card rounded-xl p-3 border border-white/10 opacity-50 flex items-center gap-3">
                  <FaCheck className="text-emerald-400 w-3 h-3" />
                  <p className="text-white line-through text-sm">{task.title}</p>
                  <span className="text-xs text-sarthiMuted ml-auto">{task.timeSpent || 0}min spent</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ═══ PLAN TAB ═══ */}
      {tab === 'plan' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <button onClick={() => generatePlan('daily')} disabled={generating}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50">
              <FaMagic className={generating ? 'animate-spin' : ''} /> {t('Generate Daily Plan')}
            </button>
            <button onClick={() => generatePlan('weekly')} disabled={generating}
              className="flex items-center gap-2 bg-sarthiPurple text-white px-4 py-2 rounded-xl text-sm hover:bg-sarthiPrimary transition disabled:opacity-50">
              <FaMagic className={generating ? 'animate-spin' : ''} /> {t('Generate Weekly Plan')}
            </button>
            <div className="ml-auto">
              <button onClick={handleAutoAdjust} disabled={adjustLoading}
                className="flex items-center gap-2 bg-sarthiGold/20 text-sarthiGold px-4 py-2 rounded-xl text-sm hover:bg-sarthiGold/30 transition disabled:opacity-50 border border-sarthiGold/30">
                <FaBrain className={adjustLoading ? 'animate-pulse' : ''} /> AI Auto-Adjust
              </button>
            </div>
          </div>

          {/* AI Adjustments Panel */}
          <AnimatePresence>
            {adjustments && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="glass-card rounded-2xl p-5 border border-sarthiGold/30 bg-sarthiGold/5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-headline font-bold text-white flex items-center gap-2">
                    <FaBrain className="text-sarthiGold" /> AI Recommendations
                  </h3>
                  <button onClick={() => setAdjustments(null)} className="text-sarthiMuted hover:text-white"><FaTimes /></button>
                </div>
                <p className="text-sm text-sarthiText mb-3">{adjustments.recommendation}</p>
                <p className="text-sm text-sarthiGold mb-3 flex items-center gap-2">
                  <FaLightbulb /> {adjustments.moodBasedTip}
                </p>
                {adjustments.adjustments?.length > 0 && (
                  <div className="space-y-2">
                    {adjustments.adjustments.map((adj, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          adj.action === 'reprioritize' ? 'bg-red-400/20 text-red-400' :
                          adj.action === 'extend' ? 'bg-blue-400/20 text-blue-400' :
                          'bg-gray-400/20 text-gray-400'
                        }`}>{adj.action}</span>
                        <span className="text-sm text-white">{adj.taskTitle}</span>
                        <span className="text-xs text-sarthiMuted ml-auto">{adj.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-sarthiMuted mt-3">{adjustments.scheduleSuggestion}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {plan && plan.schedule?.map((day, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FaBook className="text-sarthiPurple" /> {day.day}
              </h3>
              <div className="space-y-1.5">
                {day.sessions.map((s, j) => (
                  <div key={j} className={`flex items-center gap-3 p-2.5 rounded-lg transition ${
                    s.type === 'break' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 hover:bg-white/8'
                  }`}>
                    <span className="text-xs text-sarthiMuted w-32 font-mono">{s.timeSlot}</span>
                    <span className="text-lg">{focusIcon[s.focusLevel] || '📖'}</span>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${s.type === 'break' ? 'text-emerald-400' : 'text-white'}`}>{s.topic}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-sarthiMuted">{s.duration}min</span>
                        {s.type !== 'break' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sarthiPurple/10 text-sarthiPurple">{s.focusLevel}</span>
                        )}
                      </div>
                    </div>
                    {s.resources?.length > 0 && (
                      <div className="flex gap-1">
                        {s.resources.slice(0, 2).map((r, ri) => (
                          <span key={ri} className="text-[10px] px-2 py-0.5 rounded bg-blue-400/10 text-blue-400">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!plan && !generating && (
            <div className="text-center py-12">
              <FaCalendarAlt className="w-12 h-12 text-sarthiMuted/30 mx-auto mb-3" />
              <p className="text-gray-400">{t('Generate a study plan based on your tasks and preferences')}</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ FOCUS TIMER TAB ═══ */}
      {tab === 'focus' && (
        <div className="space-y-6">
          {!showPomodoro ? (
            <div className="space-y-4">
              <p className="text-sarthiMuted text-sm">Select a task to start a focused study session with the Pomodoro technique.</p>
              {tasks.filter(t => t.status !== 'completed').length === 0 ? (
                <div className="text-center py-12">
                  <FaClock className="w-12 h-12 text-sarthiMuted/30 mx-auto mb-3" />
                  <p className="text-gray-400">No tasks to focus on. Add some tasks first!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tasks.filter(t => t.status !== 'completed').map(task => (
                    <button key={task._id} onClick={() => startPomodoro(task)}
                      className="glass-card p-4 rounded-xl border border-white/10 text-left hover:border-sarthiPurple/50 transition group">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium text-sm group-hover:text-sarthiPurple transition">{task.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>P{task.priority}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-sarthiMuted">
                        <span>{task.subject}</span>
                        <span>·</span>
                        <span>{task.estimatedTime}min</span>
                        {task.pomodoros?.completed > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-sarthiPurple">🍅 {task.pomodoros.completed}</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-8 border border-sarthiPurple/30">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-headline font-bold text-white text-lg">Focus Mode</h3>
                <button onClick={() => { setShowPomodoro(false); setActiveTask(null); }}
                  className="text-sarthiMuted hover:text-white transition">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <PomodoroTimer task={activeTask} onComplete={() => { loadTasks(); }} />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
