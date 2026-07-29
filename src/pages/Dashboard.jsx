import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardSkeleton } from '../components/Skeleton';
import { Line, Radar } from 'react-chartjs-2';
import {
  TrendingUp, MessageCircle, FileText, Heart, BookOpen,
  Briefcase, Loader2, Calendar, Database, Sparkles, X,
  CheckCircle, AlertTriangle, Target, Zap, Award, Activity
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  RadialLinearScale, RadarController, ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  RadialLinearScale, RadarController, ArcElement
);

const moodEmojis = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '🤩' };
const moodLabels = { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great' };

// Circular Progress Ring component
function ProgressRing({ value, max = 100, size = 80, strokeWidth = 6, color = '#a855f7', label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{value}</span>
          <span className="text-[9px] text-sarthiMuted">{sublabel || '/100'}</span>
        </div>
      </div>
      {label && <span className="text-[10px] text-sarthiMuted mt-1.5 font-medium">{label}</span>}
    </div>
  );
}

// Mini progress bar for subjects
function SubjectBar({ name, completion, total, completed }) {
  const color = completion >= 80 ? '#22c55e' : completion >= 50 ? '#eab308' : '#f43f5e';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white font-medium">{name}</span>
        <span className="text-sarthiMuted">{completed}/{total}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${completion}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [greeting, setGreeting] = useState(null);
  const [health, setHealth] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Mood check-in state
  const [mood, setMood] = useState(null);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [moodNote, setMoodNote] = useState('');
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodSaved, setMoodSaved] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);

  // Nudge state
  const [nudge, setNudge] = useState(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Chart state
  const [chartData, setChartData] = useState(null);
  const [intervention, setIntervention] = useState(null);

  // Quick chat
  const [chatMsg, setChatMsg] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, greetingRes, nudgeRes, todayRes, chartRes, healthRes, feedRes] = await Promise.all([
        api.getDashboardStats().catch(() => ({ data: null })),
        api.getDailyGreeting().catch(() => ({ data: null })),
        api.get('/wellness/daily-nudge').catch(() => ({ data: { nudge: null } })),
        api.get('/wellness/today-status').catch(() => ({ data: null })),
        api.get('/wellness/chart-data').catch(() => ({ data: null })),
        api.get('/dashboard/health-score').catch(() => ({ data: null })),
        api.get('/dashboard/activity-feed').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setGreeting(greetingRes.data);
      setNudge(nudgeRes.nudge);
      setTodayStatus(todayRes);
      setChartData(chartRes);
      setHealth(healthRes.data);
      setActivityFeed(feedRes.data || []);

      if (todayRes.todayEntry) {
        setMoodSaved(true);
        setMood(todayRes.todayEntry.mood);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data. Please refresh.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleMoodSubmit = async () => {
    if (!mood) return;
    setMoodLoading(true);
    try {
      const res = await api.post('/wellness/mood', { mood, stressLevel: stress, energyLevel: energy, note: moodNote });
      setMoodSaved(true);
      toast.success('Mood check-in saved! Great job staying consistent.');
      if (res.stressDetected && res.intervention) {
        setIntervention(res.intervention);
        toast.warning('We noticed you might be stressed. Check the suggestion below.');
      }
      setMoodNote('');
      const [statsRes, chartRes, todayRes, healthRes, feedRes] = await Promise.all([
        api.getDashboardStats().catch(() => ({ data: null })),
        api.get('/wellness/chart-data').catch(() => ({ data: null })),
        api.get('/wellness/today-status').catch(() => ({ data: null })),
        api.get('/dashboard/health-score').catch(() => ({ data: null })),
        api.get('/dashboard/activity-feed').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);       setChartData(chartRes); setTodayStatus(todayRes);
      setHealth(healthRes.data); setActivityFeed(feedRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save check-in. Please try again.');
    }
    finally { setMoodLoading(false); }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setChatLoading(true); setChatResponse('');
    try {
      const res = await api.sendMessage({ message: chatMsg, language: 'en', conversationType: 'tutor' });
      setChatResponse(res.data.aiResponse.text); setChatMsg('');
    } catch (err) { setChatResponse('Error: ' + err.message); }
    finally { setChatLoading(false); }
  };

  const moodChartData = chartData?.chartData || [];
  const lineChartData = {
    labels: moodChartData.map(d => d.dayName),
    datasets: [
      { label: 'Mood', data: moodChartData.map(d => d.mood), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)', fill: true, tension: 0.4, pointRadius: 6, pointHoverRadius: 8,
        pointBackgroundColor: moodChartData.map(d => d.mood === null ? 'transparent' : d.mood >= 4 ? '#22c55e' : d.mood === 3 ? '#eab308' : '#ef4444'),
        pointBorderColor: moodChartData.map(d => d.mood === null ? 'transparent' : '#fff'), pointBorderWidth: 2, spanGaps: true },
      { label: 'Stress', data: moodChartData.map(d => d.stress), borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.05)', fill: true, tension: 0.4, pointRadius: 4, borderDash: [5,5], spanGaps: true },
      { label: 'Energy', data: moodChartData.map(d => d.energy), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.05)', fill: true, tension: 0.4, pointRadius: 4, borderDash: [3,3], spanGaps: true },
    ],
  };

  const lineChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top', labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true, pointStyle: 'circle', padding: 16 } },
      tooltip: { backgroundColor: 'rgba(15,23,42,0.95)', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: 'rgba(168,85,247,0.3)', borderWidth: 1, padding: 12, cornerRadius: 8 } },
    scales: { y: { min: 0, max: 5.5, ticks: { stepSize: 1, color: '#64748b', font: { size: 11 }, callback: v => v <= 5 ? moodEmojis[v] || v : '' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } } },
  };

  // Radar chart for subject skills
  const radarData = {
    labels: (health?.subjects || []).slice(0, 6).map(s => s.name),
    datasets: [{
      label: 'Completion %',
      data: (health?.subjects || []).slice(0, 6).map(s => s.completion),
      backgroundColor: 'rgba(168, 85, 247, 0.15)',
      borderColor: '#a855f7',
      borderWidth: 2,
      pointBackgroundColor: '#a855f7',
      pointBorderColor: '#fff',
      pointBorderWidth: 1,
    }],
  };

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { display: false, stepSize: 20 },
        grid: { color: 'rgba(255,255,255,0.08)' },
        angleLines: { color: 'rgba(255,255,255,0.08)' },
        pointLabels: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  const activityIcon = (type) => {
    switch (type) {
      case 'mood': return '😊';
      case 'task': return '📋';
      case 'note': return '📝';
      case 'chat': return '💬';
      default: return '📌';
    }
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const healthColor = (score) => score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';
  const healthLabel = (score) => score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention';

  if (pageLoading) return <DashboardSkeleton />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      {greeting && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-headline font-extrabold text-3xl text-white">{greeting.greeting}</h1>
          <p className="text-sarthiMuted mt-1 text-sm">{greeting.motivationalQuote}</p>
        </motion.div>
      )}

      {/* Nudge Banner */}
      <AnimatePresence>
        {nudge && !nudgeDismissed && nudge.type !== 'completed' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl p-4 border flex items-center justify-between gap-4 ${
              nudge.type === 'overdue' || nudge.type === 'first_time' ? 'bg-sarthiPink/10 border-sarthiPink/30'
              : nudge.type === 'streak' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-sarthiPurple/10 border-sarthiPurple/30'
            }`}>
            <div className="flex items-center gap-3">
              {nudge.type === 'streak' ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <Heart className="w-5 h-5 text-sarthiPink flex-shrink-0" />}
              <p className="text-sm text-sarthiText">{nudge.message}</p>
            </div>
            <button onClick={() => setNudgeDismissed(true)} className="text-xs text-sarthiMuted hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 flex-shrink-0">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TOP ROW: Health Score + Mood Check-in ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Health Score */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center">
          <h2 className="font-headline font-bold text-sm text-sarthiMuted mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-sarthiGold" /> Student Health Score
          </h2>
          {health ? (
            <>
              <ProgressRing value={health.overall} size={120} strokeWidth={8} color={healthColor(health.overall)} />
              <p className="text-sm font-medium mt-2" style={{ color: healthColor(health.overall) }}>{healthLabel(health.overall)}</p>
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{health.academics}</p>
                  <p className="text-[10px] text-sarthiMuted">Academics</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{health.wellness}</p>
                  <p className="text-[10px] text-sarthiMuted">Wellness</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{health.productivity}</p>
                  <p className="text-[10px] text-sarthiMuted">Productivity</p>
                </div>
              </div>
            </>
          ) : <Loader2 className="w-8 h-8 text-sarthiPurple animate-spin" />}
        </motion.div>

        {/* Mood Check-in */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`lg:col-span-2 glass-card rounded-2xl border p-6 transition-all ${
            moodSaved ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-sarthiPurple/30 bg-sarthiPurple/5'
          }`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-sarthiPink" />
                {moodSaved ? "Today's Check-in" : "How are you feeling today?"}
                {moodSaved && <span className="text-xs font-normal text-emerald-400 ml-2">✓ Done</span>}
              </h2>
              <div className="flex gap-3 mb-4">
                {[1,2,3,4,5].map(val => (
                  <button key={val} onClick={() => { if (!moodSaved) setMood(val); }} disabled={moodSaved}
                    className={`relative w-12 h-12 rounded-xl text-xl transition-all ${
                      mood === val ? 'bg-sarthiPurple text-white scale-110 shadow-lg shadow-sarthiPurple/30'
                      : moodSaved ? 'bg-darkBg border border-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-darkBg border border-white/10 hover:border-sarthiPurple/50 hover:scale-105'
                    }`}>
                    {moodEmojis[val]}
                    {mood === val && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-sarthiPurple whitespace-nowrap">{moodLabels[val]}</span>}
                  </button>
                ))}
              </div>
              {mood && !moodSaved && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-sarthiMuted font-mono mb-1 block">STRESS</label>
                      <div className="flex items-center gap-2">
                        <input type="range" min="1" max="5" value={stress} onChange={e => setStress(+e.target.value)} className="flex-1 accent-rose-500 h-1.5" />
                        <span className="text-sm">{stress <= 2 ? '😌' : stress === 3 ? '😐' : '😰'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-sarthiMuted font-mono mb-1 block">ENERGY</label>
                      <div className="flex items-center gap-2">
                        <input type="range" min="1" max="5" value={energy} onChange={e => setEnergy(+e.target.value)} className="flex-1 accent-emerald-500 h-1.5" />
                        <span className="text-sm">{energy <= 2 ? '😴' : energy === 3 ? '🙂' : '⚡'}</span>
                      </div>
                    </div>
                  </div>
                  <input type="text" value={moodNote} onChange={e => setMoodNote(e.target.value)}
                    placeholder="Add a note (optional)..." className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none" />
                  <button onClick={handleMoodSubmit} disabled={moodLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sarthiPurple to-sarthiPink text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
                    {moodLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {moodLoading ? 'Saving...' : 'Save Check-in'}
                  </button>
                </motion.div>
              )}
            </div>
            <div className="flex gap-3 text-center">
              <div className="bg-darkBg/50 rounded-xl px-3 py-2 min-w-[65px]">
                <p className="font-bold text-lg text-white">{stats?.wellnessStreak || 0}</p>
                <p className="text-[9px] text-sarthiMuted">Streak</p>
              </div>
              <div className="bg-darkBg/50 rounded-xl px-3 py-2 min-w-[65px]">
                <p className="font-bold text-lg text-white">{stats?.weeklyMoodAvg || '—'}</p>
                <p className="text-[9px] text-sarthiMuted">Avg</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Intervention */}
      <AnimatePresence>
        {intervention && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-4 rounded-2xl border border-sarthiPurple/30 bg-gradient-to-r from-sarthiPurple/10 to-sarthiPink/10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-sarthiPurple mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm">{intervention.title}</h3>
                <p className="text-sm text-sarthiText mt-0.5">{intervention.content}</p>
              </div>
            </div>
            <button onClick={() => setIntervention(null)} className="text-sarthiMuted hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ STATS GRID ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Study Streak', value: stats?.studyStreak || 0, sub: 'days', color: 'text-sarthiGold' },
          { icon: Heart, label: 'Wellness Streak', value: stats?.wellnessStreak || 0, sub: 'checked in', color: 'text-sarthiPink' },
          { icon: Calendar, label: 'Pending Tasks', value: stats?.pendingTasks || 0, sub: `${stats?.completedTasks || 0} completed`, color: 'text-sarthiPurple' },
          { icon: FileText, label: 'Notes', value: stats?.notesUploaded || 0, sub: 'uploaded', color: 'text-blue-400' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4 rounded-2xl border border-white/10 hover:border-sarthiPurple/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-[10px] text-sarthiMuted font-mono uppercase">{item.label}</span>
              </div>
              <p className="font-headline font-bold text-2xl text-white">{item.value}</p>
              <p className="text-[10px] text-sarthiMuted">{item.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ MIDDLE ROW: Chart + Radar + Activity ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Trend Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sarthiPurple" /> 7-Day Wellness Trend
            </h2>
            <button onClick={() => navigate('/dashboard/wellness')} className="text-[10px] text-sarthiPurple hover:text-sarthiPink transition">View Full →</button>
          </div>
          <div className="h-52">
            {moodChartData.some(d => d.hasData) ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sarthiMuted text-sm">
                <div className="text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No mood data yet. Complete your first check-in!</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Subject Skills Radar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 rounded-2xl border border-white/10">
          <h2 className="font-headline font-bold text-sm text-white flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-sarthiGold" /> Subject Progress
          </h2>
          {health?.subjects?.length > 0 ? (
            <div className="h-48">
              <Radar data={radarData} options={radarOptions} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sarthiMuted text-xs text-center">
              <div>
                <Target className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p>Complete tasks to see your subject radar</p>
              </div>
            </div>
          )}
          {health?.subjects?.length > 0 && (
            <div className="mt-3 space-y-2">
              {health.subjects.slice(0, 3).map((s, i) => (
                <SubjectBar key={i} name={s.name} completion={s.completion} total={s.total} completed={s.completed} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ BOTTOM ROW: Activity Feed + Quick Chat + Actions ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass-card p-5 rounded-2xl border border-white/10">
          <h2 className="font-headline font-bold text-sm text-white flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-sarthiPink" /> Recent Activity
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {activityFeed.length === 0 ? (
              <p className="text-sarthiMuted text-xs text-center py-4">No activity yet</p>
            ) : (
              activityFeed.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 group">
                  <span className="text-base flex-shrink-0 mt-0.5">{activityIcon(a.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-sarthiText leading-snug truncate">{a.text}</p>
                    {a.detail && <p className="text-[10px] text-sarthiMuted truncate">{a.detail}</p>}
                  </div>
                  <span className="text-[9px] text-sarthiMuted flex-shrink-0">{timeAgo(a.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Chat */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="glass-card p-5 rounded-2xl border border-white/10">
          <h2 className="font-headline font-bold text-sm text-white flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-sarthiPurple" /> Quick Ask
          </h2>
          <form onSubmit={handleChat} className="flex gap-2 mb-3">
            <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Ask anything..."
              className="flex-1 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-3 py-2 text-sm text-white placeholder-sarthiMuted/60 outline-none" />
            <button type="submit" disabled={chatLoading}
              className="bg-sarthiPurple hover:bg-sarthiPrimary text-white font-semibold text-sm px-4 py-2 rounded-xl transition disabled:opacity-50">
              {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
            </button>
          </form>
          {chatResponse && (
            <div className="p-3 rounded-xl bg-sarthiPurple/15 border border-sarthiPurple/30 text-xs text-sarthiText leading-relaxed animate-fade-in">
              {chatResponse}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-card p-5 rounded-2xl border border-white/10">
          <h2 className="font-headline font-bold text-sm text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: MessageCircle, label: 'Chat', path: '/dashboard/chat', color: 'text-sarthiPurple' },
              { icon: Heart, label: 'Wellness', path: '/dashboard/wellness', color: 'text-sarthiPink' },
              { icon: Calendar, label: 'Planner', path: '/dashboard/timetable', color: 'text-sarthiGold' },
              { icon: Database, label: 'Notes', path: '/dashboard/notes', color: 'text-blue-400' },
              { icon: FileText, label: 'Resume', path: '/dashboard/resume', color: 'text-emerald-400' },
              { icon: Briefcase, label: 'Career', path: '/dashboard/career', color: 'text-orange-400' },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <button key={i} onClick={() => navigate(a.path)}
                  className="p-2.5 bg-darkBg border border-white/10 rounded-xl hover:border-sarthiPurple/50 hover:bg-sarthiPurple/10 transition-all text-center group">
                  <Icon className={`w-4 h-4 ${a.color} mx-auto mb-1 group-hover:scale-110 transition-transform`} />
                  <p className="text-[10px] font-medium text-white group-hover:text-sarthiPink transition-colors">{a.label}</p>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
