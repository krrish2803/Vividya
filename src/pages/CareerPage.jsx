import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Briefcase, Send, Loader2, Sparkles, TrendingUp, BookOpen,
  Code, GraduationCap, Target, Lightbulb, ArrowRight, Upload,
  CheckCircle, XCircle, AlertTriangle, Brain, MessageSquare, Calendar
} from 'lucide-react';

const careerTopics = [
  { id: 'placement', label: 'Placement Prep', icon: Target, prompt: 'Guide me on how to prepare for campus placements. What are the steps, timeline, and resources I should follow?' },
  { id: 'resume', label: 'Resume Tips', icon: BookOpen, prompt: 'Give me tips to create an ATS-friendly resume for a fresher with no internship experience.' },
  { id: 'interview', label: 'Interview Prep', icon: Code, prompt: 'How should I prepare for technical interviews? What topics should I focus on for DSA, system design, and HR rounds?' },
  { id: 'skills', label: 'Skill Roadmap', icon: TrendingUp, prompt: 'Create a 6-month skill development roadmap for a CSE student targeting software engineering roles.' },
  { id: 'higher-ed', label: 'Higher Studies', icon: GraduationCap, prompt: 'Should I go for MS abroad or start working after B.Tech? Compare MS vs job for CSE students in India.' },
  { id: 'startup', label: 'Startup Path', icon: Lightbulb, prompt: 'What are the steps to build a startup as a college student in India? How do I get funding and mentorship?' },
];

const roles = [
  'Software Engineer (SDE)', 'Full Stack Developer', 'Data Scientist',
  'DevOps Engineer', 'Backend Developer', 'Frontend Developer',
  'ML Engineer', 'Cloud Engineer',
];

const fitColor = (score) => {
  if (score >= 80) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
  if (score >= 60) return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  if (score >= 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  return 'text-red-400 bg-red-400/10 border-red-400/30';
};

const diffColor = { Easy: 'text-emerald-400', Medium: 'text-yellow-400', Hard: 'text-red-400' };

export default function CareerPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  // Resume + Role Matching
  const [profile, setProfile] = useState(null);
  const [uploadedNoteId, setUploadedNoteId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  // Roadmap
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Mock Interview
  const [mockInterview, setMockInterview] = useState(null);
  const [mockLoading, setMockLoading] = useState(false);
  const [expandedQ, setExpandedQ] = useState(null);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [evalLoading, setEvalLoading] = useState({});

  const [resumeHistory, setResumeHistory] = useState([]);

  useEffect(() => {
    api.get('/career/profile').then(r => {
      if (r.profile) setProfile(r.profile);
    }).catch(() => {});
    loadResumeHistory();
  }, []);

  const loadResumeHistory = async () => {
    try {
      const res = await api.get('/career/resume-history');
      if (res.success && res.history) {
        setResumeHistory(res.history);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Chat ──────────────────────────────────────────────────
  const sendCareerQuery = async (prompt) => {
    const msg = prompt || input;
    if (!msg.trim() || loading) return;
    setMessages(prev => [...prev, { sender: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.sendMessage({
        message: `Career Guide Request: ${msg}\n\nYou are Vividya Career Advisor. Give detailed, actionable career guidance for an Indian college student. Include specific steps, resources, and timelines. Format with clear sections.`,
        language,
        conversationType: 'career',
      });
      setMessages(prev => [...prev, { sender: 'ai', content: res.data.aiResponse.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', content: 'Error: ' + err.message }]);
    } finally { setLoading(false); }
  };

  // ─── Resume Upload + Analyze ───────────────────────────────
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAnalyzing(true);
    try {
      // Upload note
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/notes/upload', formData);
      const noteId = uploadRes.data?.noteId;
      if (!noteId) throw new Error('Upload failed');

      // Analyze
      const analyzeRes = await api.post('/career/analyze-resume', { noteId });
      setProfile(analyzeRes.profile);
      loadResumeHistory();
      setTab('matches');
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally { setAnalyzing(false); }
  };

  // ─── Generate Roadmap ──────────────────────────────────────
  const handleGenerateRoadmap = async (role) => {
    setSelectedRole(role);
    setRoadmapLoading(true);
    setRoadmap(null);
    try {
      const res = await api.post('/career/roadmap', { targetRole: role });
      setRoadmap(res.roadmap);
    } catch (err) {
      console.error(err);
    } finally { setRoadmapLoading(false); }
  };

  // ─── Generate Mock Interview ───────────────────────────────
  const handleGenerateMock = async (role) => {
    setSelectedRole(role);
    setMockLoading(true);
    setMockInterview(null);
    setAnswers({});
    setEvaluations({});
    try {
      const res = await api.post('/career/mock-interview', { targetRole: role });
      setMockInterview(res.questions || []);
    } catch (err) {
      console.error(err);
    } finally { setMockLoading(false); }
  };

  const handleEvaluateAnswer = async (index, questionText) => {
    const answer = answers[index];
    if (!answer || !answer.trim()) return;

    setEvalLoading(prev => ({ ...prev, [index]: true }));
    try {
      const res = await api.post('/career/evaluate-answer', {
        targetRole: selectedRole,
        question: questionText,
        answer: answer
      });
      if (res.success && res.evaluation) {
        setEvaluations(prev => ({ ...prev, [index]: res.evaluation }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvalLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🌐' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'hi-en', label: 'Hinglish', flag: '💬' },
    { code: 'mr', label: 'Marathi', flag: '🏛️' },
  ];

  const tabs = [
    { id: 'chat', label: 'Career Chat', icon: MessageSquare },
    { id: 'analysis', label: 'Resume Analysis', icon: Briefcase },
    { id: 'matches', label: 'Role Matches', icon: Target },
    { id: 'roadmap', label: '6-Month Roadmap', icon: Calendar },
    { id: 'mock', label: 'Mock Interview', icon: Brain },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl text-white">Career Guide</h1>
          <p className="text-sm text-sarthiMuted mt-1">AI-powered career guidance for your journey</p>
        </div>
        <div className="flex items-center gap-2">
          {languages.map(lang => (
            <button key={lang.code} onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                language === lang.code
                  ? 'bg-sarthiPurple text-white shadow-lg shadow-sarthiPrimary/30'
                  : 'bg-darkSurface border border-white/10 text-sarthiMuted hover:text-white hover:border-sarthiPurple/50'
              }`}>
              <span>{lang.flag}</span>
              <span className="hidden sm:inline">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-2 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                tab === t.id ? 'bg-sarthiPurple text-white' : 'text-sarthiMuted hover:text-white hover:bg-white/5'
              }`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ═══ CHAT TAB ═══ */}
      {tab === 'chat' && (
        messages.length === 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {careerTopics.map(topic => {
                const Icon = topic.icon;
                return (
                  <button key={topic.id} onClick={() => sendCareerQuery(topic.prompt)}
                    className="glass-card p-5 rounded-2xl border border-white/10 text-left hover:border-sarthiPurple/50 hover:-translate-y-1 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-sarthiPurple/20 flex items-center justify-center mb-3 group-hover:bg-sarthiPurple/30 transition-colors">
                      <Icon className="w-5 h-5 text-sarthiPurple" />
                    </div>
                    <h3 className="font-headline font-bold text-white text-sm mb-1">{topic.label}</h3>
                    <p className="text-xs text-sarthiMuted line-clamp-2">{topic.prompt}</p>
                    <div className="flex items-center gap-1 text-xs text-sarthiPurple mt-3 group-hover:text-sarthiPink transition-colors">
                      Ask AI <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="font-headline font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sarthiGold" /> Ask a Custom Career Question
              </h3>
              <form onSubmit={e => { e.preventDefault(); sendCareerQuery(); }} className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="e.g., How to switch from mechanical to software engineering?"
                  className="flex-1 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-3 text-sm text-white placeholder-sarthiMuted/60 outline-none transition-colors" />
                <button type="submit" disabled={!input.trim() || loading}
                  className="px-5 py-3 rounded-xl bg-sarthiPurple hover:bg-sarthiPrimary text-white transition-colors disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setMessages([])} className="text-xs text-sarthiPurple hover:text-sarthiPink transition-colors flex items-center gap-1">← Back to topics</button>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                    msg.sender === 'user' ? 'bg-primary-gradient text-white' : 'bg-darkSurface border border-white/10 text-sarthiText'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-darkSurface border border-white/10 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-2 text-sarthiMuted text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your career path...
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-darkBg pt-4">
              <form onSubmit={e => { e.preventDefault(); sendCareerQuery(); }} className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a follow-up..."
                  className="flex-1 bg-darkSurface border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-3 text-sm text-white placeholder-sarthiMuted/60 outline-none transition-colors" />
                <button type="submit" disabled={!input.trim() || loading}
                  className="px-5 py-3 rounded-xl bg-sarthiPurple hover:bg-sarthiPrimary text-white transition-colors disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )
      )}

      {/* ═══ RESUME ANALYSIS TAB ═══ */}
      {tab === 'analysis' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <h2 className="font-headline font-bold text-white mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-sarthiPurple" /> Upload Resume
            </h2>
            <p className="text-sm text-sarthiMuted mb-4">Upload your resume (PDF or image) and our AI will analyze your skills, match you to roles, and create a personalized roadmap.</p>
            <label className="block">
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleResumeUpload} className="hidden" />
              <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${analyzing ? 'border-sarthiPurple bg-sarthiPurple/10' : 'border-white/20 hover:border-sarthiPurple'}`}>
                {analyzing ? (
                  <div className="flex items-center justify-center gap-2 text-sarthiPurple">
                    <Loader2 className="w-5 h-5 animate-spin" /> Analyzing your resume with AI...
                  </div>
                ) : (
                  <>
                    <Upload className="text-3xl text-sarthiMuted mx-auto mb-2" />
                    <p className="text-sarthiMuted">Click to upload PDF or image</p>
                  </>
                )}
              </div>
            </label>

            {/* Past Analyses History */}
            {resumeHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="font-headline font-bold text-white mb-3 flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-sarthiGold" /> Past Resume Upload History
                </h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {resumeHistory.map((h) => (
                    <button
                      key={h._id}
                      onClick={() => {
                        setProfile({
                          parsedResumeData: h.parsedResumeData,
                          analysis: h.analysis,
                        });
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-sarthiPurple/50 hover:bg-white/10 transition text-left"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-md">{h.fileName}</p>
                        <p className="text-[10px] text-sarthiMuted mt-0.5">Uploaded: {new Date(h.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded bg-sarthiPurple/20 text-sarthiPurple font-semibold">Load Analysis</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {profile?.parsedResumeData && (
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h2 className="font-headline font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> Parsed Resume Data
              </h2>

              {profile.parsedResumeData.skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.parsedResumeData.skills.map((s, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        s.level === 'expert' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' :
                        s.level === 'intermediate' ? 'bg-blue-400/10 text-blue-400 border-blue-400/30' :
                        'bg-gray-400/10 text-gray-400 border-gray-400/30'
                      }`}>
                        {s.name} <span className="opacity-60">({s.level})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.parsedResumeData.projects?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Projects</h3>
                  {profile.parsedResumeData.projects.map((p, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-lg mb-2">
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-sarthiMuted mt-1">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ ROLE MATCHES TAB ═══ */}
      {tab === 'matches' && (
        <div className="space-y-6">
          {!profile?.analysis ? (
            <div className="glass-card p-8 rounded-2xl border border-white/10 text-center">
              <Briefcase className="w-12 h-12 text-sarthiMuted mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Resume Analysis Yet</h3>
              <p className="text-sarthiMuted text-sm mb-4">Upload your resume in the Analysis tab to see your role matches.</p>
              <button onClick={() => setTab('analysis')} className="px-5 py-2.5 rounded-xl bg-sarthiPurple text-white text-sm font-medium hover:bg-sarthiPrimary transition">
                Upload Resume
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.analysis.topRoles.map((role, i) => (
                  <div key={i} className="glass-card p-5 rounded-2xl border border-white/10 hover:border-sarthiPurple/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-headline font-bold text-white text-sm">{role.role}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${fitColor(role.fitScore)}`}>
                        {role.fitScore}%
                      </span>
                    </div>

                    <p className="text-xs text-sarthiMuted mb-3">{role.description}</p>

                    {/* Justification */}
                    <div className="space-y-1 mb-3">
                      {role.justification?.slice(0, 3).map((j, ji) => (
                        <p key={ji} className="text-xs text-sarthiMuted flex items-start gap-1.5">
                          <span className="text-sarthiPurple mt-0.5">•</span> {j}
                        </p>
                      ))}
                    </div>

                    {/* Matched Skills */}
                    {role.matchedSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {role.matchedSkills.map((s, si) => (
                          <span key={si} className="px-2 py-0.5 rounded text-[10px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">{s}</span>
                        ))}
                      </div>
                    )}

                    {/* Missing Skills */}
                    {role.missingRequired?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {role.missingRequired.map((s, si) => (
                          <span key={si} className="px-2 py-0.5 rounded text-[10px] bg-red-400/10 text-red-400 border border-red-400/20">+ {s}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-xs text-sarthiGold">{role.averageSalary}</span>
                      <span className="text-[10px] text-sarthiMuted">{role.companies?.slice(0, 3).join(', ')}</span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setSelectedRole(role.role); handleGenerateRoadmap(role.role); setTab('roadmap'); }}
                        className="flex-1 text-[10px] py-1.5 rounded-lg bg-sarthiPurple/20 text-sarthiPurple hover:bg-sarthiPurple/30 transition font-medium">
                        Roadmap
                      </button>
                      <button onClick={() => { setSelectedRole(role.role); handleGenerateMock(role.role); setTab('mock'); }}
                        className="flex-1 text-[10px] py-1.5 rounded-lg bg-sarthiGold/20 text-sarthiGold hover:bg-sarthiGold/30 transition font-medium">
                        Mock Interview
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Gaps */}
              {profile.analysis.skillGaps?.length > 0 && (
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                  <h2 className="font-headline font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" /> Skills to Develop
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {profile.analysis.skillGaps.map((gap, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{gap.skill}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${gap.priority === 'high' ? 'bg-red-400/20 text-red-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                            {gap.priority}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {gap.resources?.slice(0, 3).map((r, ri) => (
                            <span key={ri} className="text-[10px] px-2 py-0.5 rounded bg-sarthiPurple/10 text-sarthiPurple">{r}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ ROADMAP TAB ═══ */}
      {tab === 'roadmap' && (
        <div className="space-y-6">
          {!roadmap && !roadmapLoading && (
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h2 className="font-headline font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sarthiPurple" /> Generate Your 6-Month Roadmap
              </h2>
              <p className="text-sm text-sarthiMuted mb-4">Select your target role to get a personalized month-by-month plan.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roles.map(r => (
                  <button key={r} onClick={() => handleGenerateRoadmap(r)}
                    className={`p-3 rounded-xl text-xs font-medium text-left transition border ${
                      selectedRole === r ? 'bg-sarthiPurple text-white border-sarthiPurple' : 'bg-white/5 text-white border-white/10 hover:border-sarthiPurple/50'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {roadmapLoading && (
            <div className="glass-card p-8 rounded-2xl border border-white/10 text-center">
              <Loader2 className="w-8 h-8 text-sarthiPurple animate-spin mx-auto mb-3" />
              <p className="text-sarthiMuted">Generating your personalized roadmap...</p>
            </div>
          )}

          {roadmap && (
            <>
              <div className="glass-card p-6 rounded-2xl border border-sarthiPurple/30 bg-sarthiPurple/5">
                <h2 className="font-headline font-bold text-white mb-2">6-Month Roadmap: {selectedRole}</h2>
                <p className="text-sm text-sarthiMuted">{roadmap.summary}</p>
              </div>

              {/* Monthly Timeline */}
              <div className="space-y-4">
                {roadmap.months?.map((m, i) => (
                  <div key={i} className="glass-card p-5 rounded-2xl border border-white/10 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-sarthiPurple to-sarthiPink" />
                    <div className="pl-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-full bg-sarthiPurple/20 text-sarthiPurple text-xs font-bold">{m.month}</span>
                        <h3 className="font-headline font-bold text-white">{m.theme}</h3>
                      </div>

                      {m.goals?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-sarthiMuted font-mono mb-1">GOALS</p>
                          {m.goals.map((g, gi) => (
                            <p key={gi} className="text-sm text-white flex items-start gap-2 mb-1">
                              <Target className="w-3 h-3 text-sarthiGold mt-1 flex-shrink-0" /> {g}
                            </p>
                          ))}
                        </div>
                      )}

                      {m.tasks?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-sarthiMuted font-mono mb-1">TASKS</p>
                          {m.tasks.map((t, ti) => (
                            <p key={ti} className="text-sm text-sarthiText flex items-start gap-2 mb-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" /> {t}
                            </p>
                          ))}
                        </div>
                      )}

                      {m.resources?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {m.resources.map((r, ri) => (
                            <span key={ri} className="text-[10px] px-2 py-0.5 rounded bg-sarthiGold/10 text-sarthiGold">{r}</span>
                          ))}
                        </div>
                      )}

                      {m.milestone && (
                        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Milestone: {m.milestone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Schedule */}
              {roadmap.weeklySchedule && (
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                  <h3 className="font-headline font-bold text-white mb-3">Weekly Schedule</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(roadmap.weeklySchedule).map(([day, activity]) => (
                      <div key={day} className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs font-mono text-sarthiPurple capitalize">{day}</p>
                        <p className="text-xs text-white mt-1">{activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* End Goals */}
              {roadmap.endGoals && (
                <div className="glass-card p-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/5">
                  <h3 className="font-headline font-bold text-white mb-3">After 6 Months, You Should...</h3>
                  {roadmap.endGoals.map((g, i) => (
                    <p key={i} className="text-sm text-white flex items-start gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> {g}
                    </p>
                  ))}
                </div>
              )}

              <button onClick={() => { setRoadmap(null); setSelectedRole(''); }}
                className="text-sm text-sarthiPurple hover:text-sarthiPink transition">← Choose different role</button>
            </>
          )}
        </div>
      )}

      {/* ═══ MOCK INTERVIEW TAB ═══ */}
      {tab === 'mock' && (
        <div className="space-y-6">
          {!mockInterview && !mockLoading && (
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h2 className="font-headline font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-sarthiGold" /> Practice Mock Interview
              </h2>
              <p className="text-sm text-sarthiMuted mb-4">Select your target role to get 5 realistic interview questions with approach tips.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roles.map(r => (
                  <button key={r} onClick={() => handleGenerateMock(r)}
                    className={`p-3 rounded-xl text-xs font-medium text-left transition border ${
                      selectedRole === r ? 'bg-sarthiGold text-darkBg border-sarthiGold' : 'bg-white/5 text-white border-white/10 hover:border-sarthiGold/50'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mockLoading && (
            <div className="glass-card p-8 rounded-2xl border border-white/10 text-center">
              <Loader2 className="w-8 h-8 text-sarthiGold animate-spin mx-auto mb-3" />
              <p className="text-sarthiMuted">Generating mock interview questions...</p>
            </div>
          )}

          {mockInterview && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-bold text-white">Mock Interview: {selectedRole}</h2>
                <button onClick={() => { setMockInterview(null); setSelectedRole(''); }}
                  className="text-xs text-sarthiPurple hover:text-sarthiPink transition">← Different role</button>
              </div>

              <div className="space-y-4">
                {mockInterview.map((q, i) => (
                  <div key={i} className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                    <button onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                      className="w-full p-5 text-left flex items-start gap-4 hover:bg-white/5 transition">
                      <span className="w-8 h-8 rounded-full bg-sarthiGold/20 text-sarthiGold flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {q.id || i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sarthiPurple/20 text-sarthiPurple">{q.category}</span>
                          <span className={`text-[10px] font-medium ${diffColor[q.difficulty] || 'text-gray-400'}`}>{q.difficulty}</span>
                        </div>
                        <p className="text-sm text-white font-medium">{q.question}</p>
                      </div>
                      <span className={`text-sarthiMuted transition-transform ${expandedQ === i ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {expandedQ === i && (
                      <div className="px-5 pb-5 pt-0 space-y-3 border-t border-white/10">
                        {q.expectedApproach && (
                          <div>
                            <p className="text-xs text-sarthiMuted font-mono mb-1">APPROACH</p>
                            <p className="text-sm text-sarthiText">{q.expectedApproach}</p>
                          </div>
                        )}
                        {q.tips?.length > 0 && (
                          <div>
                            <p className="text-xs text-sarthiMuted font-mono mb-1">TIPS</p>
                            {q.tips.map((tip, ti) => (
                              <p key={ti} className="text-sm text-emerald-400 flex items-start gap-2 mb-1">
                                <Lightbulb className="w-3 h-3 mt-1 flex-shrink-0" /> {tip}
                              </p>
                            ))}
                          </div>
                        )}
                        {q.followUp && (
                          <div>
                            <p className="text-xs text-sarthiMuted font-mono mb-1">FOLLOW-UP</p>
                            <p className="text-sm text-yellow-400 italic">{q.followUp}</p>
                          </div>
                        )}

                        {/* Answer Input Section */}
                        <div className="pt-3 border-t border-white/5 space-y-2">
                          <p className="text-xs text-sarthiMuted font-mono">YOUR ANSWER</p>
                          <textarea
                            value={answers[i] || ''}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                            placeholder="Type your DSA approach, code, or explanation here..."
                            rows={4}
                            className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-3 py-2 text-sm text-white placeholder-sarthiMuted/50 outline-none resize-none"
                          />
                          <button
                            onClick={() => handleEvaluateAnswer(i, q.question)}
                            disabled={evalLoading[i] || !answers[i]?.trim()}
                            className="px-4 py-2 bg-sarthiPurple hover:bg-sarthiPrimary disabled:opacity-50 transition text-xs font-semibold rounded-lg text-white flex items-center gap-1.5"
                          >
                            {evalLoading[i] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            Submit Answer for AI Review
                          </button>
                        </div>

                        {/* Evaluation Result */}
                        {evaluations[i] && (
                          <div className="mt-3 p-4 rounded-xl bg-sarthiPurple/10 border border-sarthiPurple/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-sarthiPurple uppercase tracking-wider">AI Evaluation Score</span>
                              <span className="text-sm font-black text-white px-2 py-0.5 rounded-full bg-sarthiPurple/30">
                                {evaluations[i].score}/10
                              </span>
                            </div>
                            <p className="text-xs text-sarthiText leading-relaxed">{evaluations[i].feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
