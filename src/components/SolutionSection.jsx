import React, { useState, useEffect } from 'react';
import { translations } from '../data/translations';
import { Sparkles, MessageSquare, Upload, CheckCircle2, Heart, Clock, Play, Pause, RefreshCw, FileText, Award, Shield } from 'lucide-react';

export default function SolutionSection({ lang }) {
  const t = translations[lang].solution;

  // Widget 1: Interactive AI Tutor Chat Simulation
  const [tutorLang, setTutorLang] = useState('hinglish');
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorMessages, setTutorMessages] = useState([
    { sender: 'user', text: 'Bhai Binary Search Trees simple tarike se samjha do?' },
    { sender: 'vividya', text: 'Haan bilkul! Isse ek real-life Library jaisa samjho. Right side me badi books, left side me choti books. Target book khojne me aadha time bachta hai! Time complexity is O(log N).' }
  ]);

  const handleTutorSend = (e) => {
    e.preventDefault();
    if (!tutorQuery.trim()) return;

    const newMsg = { sender: 'user', text: tutorQuery };
    setTutorMessages(prev => [...prev, newMsg]);
    setTutorQuery('');

    setTimeout(() => {
      setTutorMessages(prev => [
        ...prev,
        {
          sender: 'vividya',
          text: lang === 'hi'
            ? 'विविद्या का उत्तर: बहुत बढ़िया प्रश्न! इसे 3 आसान चरणों में समझें: 1. रूट नोड देखें 2. वैल्यू तुलना करें 3. रिकर्शन से लेफ्ट/राइट में जाएं। कोई संदेह हो तो फिर पूछें!'
            : 'Vividya Answer: Great question! Think of it step-by-step: 1. Check root node 2. Compare value 3. Recurse left or right. Try solving 1 LeetCode problem now!'
        }
      ]);
    }, 800);
  };

  // Widget 2: Resume Analyzer Simulator State
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

  const handleUploadResumeSim = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResumeUploaded(true);
      setAtsResult({
        score: 91,
        matchRole: "Full Stack Engineer / SDE-1",
        matchedSkills: ["React", "Node.js", "Java DSA", "REST APIs"],
        missingSkill: "System Design basics & Docker",
        recCompanies: ["TCS Digital (7 LPA)", "Zomato (14 LPA)", "Jio (10 LPA)"]
      });
    }, 1200);
  };

  // Widget 3: Wellness & Breathing Exercise Simulator
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [timer, setTimer] = useState(4);
  const [mood, setMood] = useState('Anxious');

  useEffect(() => {
    let interval;
    if (breathingActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') { setBreathPhase('Hold'); return 4; }
            if (breathPhase === 'Hold') { setBreathPhase('Exhale'); return 4; }
            if (breathPhase === 'Exhale') { setBreathPhase('Inhale'); return 4; }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathPhase]);

  // Widget 4: Interactive Timetable Schedule Builder
  const [selectedExam, setSelectedExam] = useState('Semesters');
  const [dailyHours, setDailyHours] = useState(4);

  return (
    <section id="solutions" className="py-24 bg-darkBg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-sarthiPurple uppercase bg-sarthiPurple/10 px-3 py-1 rounded-full border border-sarthiPurple/20">
            {t.tag}
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-sarthiMuted leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Row 1: The Tutor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sarthiGold/15 border border-sarthiGold/30 text-sarthiGold text-xs font-bold font-mono">
              <Award className="w-3.5 h-3.5" />
              {t.tutorBadge}
            </div>

            <h3 className="font-headline font-bold text-2xl sm:text-3xl text-white">
              {t.tutorTitle}
            </h3>

            <p className="text-base text-sarthiMuted leading-relaxed">
              {t.tutorDesc}
            </p>

            <ul className="space-y-2 text-sm text-sarthiText pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiGold" />
                <span>Ask via Voice or Text in English, Hindi & Hinglish</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiGold" />
                <span>OCR Handwritten Notes scanner for instant step-by-step math/physics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiGold" />
                <span>Zero judgment — ask the same doubt 10 times until you get it</span>
              </li>
            </ul>
          </div>

          {/* Right Interactive Tutor Simulator */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl border border-sarthiPurple/30 shadow-2xl bg-darkSurface/90">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                <span className="text-xs font-mono font-bold text-white">Vividya AI Tutor Simulator</span>
              </div>
              
              <div className="flex gap-1 bg-darkBg p-1 rounded-lg text-[10px] font-mono">
                <button onClick={() => setTutorLang('en')} className={`px-2 py-0.5 rounded ${tutorLang === 'en' ? 'bg-sarthiPurple text-white' : 'text-sarthiMuted'}`}>EN</button>
                <button onClick={() => setTutorLang('hi')} className={`px-2 py-0.5 rounded ${tutorLang === 'hi' ? 'bg-sarthiPurple text-white' : 'text-sarthiMuted'}`}>HI</button>
                <button onClick={() => setTutorLang('hinglish')} className={`px-2 py-0.5 rounded ${tutorLang === 'hinglish' ? 'bg-sarthiPurple text-white' : 'text-sarthiMuted'}`}>HIN</button>
              </div>
            </div>

            {/* Chat Box Messages */}
            <div className="h-48 overflow-y-auto space-y-3 pr-2 mb-3">
              {tutorMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-sarthiPurple text-white rounded-br-none'
                        : 'bg-darkBg text-sarthiText border border-white/10 rounded-bl-none'
                    }`}
                  >
                    {msg.sender === 'vividya' && (
                      <span className="block text-[10px] font-bold text-sarthiGold mb-1 font-mono">🎓 VIVIDYA AI TUTOR</span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleTutorSend} className="flex gap-2">
              <input
                type="text"
                value={tutorQuery}
                onChange={(e) => setTutorQuery(e.target.value)}
                placeholder="Ask doubt (e.g. 'Explain Recursion simply')..."
                className="flex-1 bg-darkBg border border-white/15 focus:border-sarthiPurple rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-sarthiMuted outline-none"
              />
              <button
                type="submit"
                className="bg-primary-gradient text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:scale-105 transition-transform"
              >
                Send
              </button>
            </form>
          </div>

        </div>

        {/* Row 2: Career Navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Interactive Resume Simulator */}
          <div className="lg:col-span-6 order-2 lg:order-1 glass-card p-6 rounded-2xl border border-sarthiPink/30 shadow-2xl bg-darkSurface/90">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-mono font-bold text-sarthiPink flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Live ATS Resume Matcher
              </span>
              <span className="text-[10px] font-mono bg-sarthiPink/20 text-sarthiPink px-2 py-0.5 rounded">Indian Market DB</span>
            </div>

            {!resumeUploaded ? (
              <div
                onClick={handleUploadResumeSim}
                className="border-2 border-dashed border-white/20 hover:border-sarthiPink rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-white/5 space-y-3"
              >
                {analyzing ? (
                  <div className="space-y-2">
                    <RefreshCw className="w-8 h-8 text-sarthiPink animate-spin mx-auto" />
                    <p className="text-xs font-mono text-sarthiText">Matching against 100,000+ Indian tech jobs...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-sarthiPink mx-auto" />
                    <p className="font-headline font-bold text-sm text-white">Click to Upload Demo Resume (PDF/DOCX)</p>
                    <p className="text-xs text-sarthiMuted">Simulate real-time feedback for CSE / ECE placement roles</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-darkBg p-3 rounded-xl border border-white/10">
                  <div>
                    <span className="text-[11px] font-mono text-sarthiMuted">ATS Match Score</span>
                    <h4 className="font-headline font-extrabold text-2xl text-emerald-400">{atsResult.score}/100</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-sarthiMuted">Suggested Role</span>
                    <p className="text-xs font-bold text-white">{atsResult.matchRole}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-sarthiGold">Matched Core Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {atsResult.matchedSkills.map((sk, i) => (
                      <span key={i} className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono text-[10px]">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-sarthiAlert bg-sarthiAlert/10 p-2.5 rounded-xl border border-sarthiAlert/20">
                  <strong>Skill Gap Recommendation:</strong> Add {atsResult.missingSkill} to boost your callbacks by 35%.
                </div>

                <button
                  onClick={() => setResumeUploaded(false)}
                  className="w-full py-2 bg-darkBg hover:bg-white/10 text-sarthiMuted text-xs font-mono rounded-xl transition-colors"
                >
                  Test Another Resume
                </button>
              </div>
            )}
          </div>

          {/* Right Text */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            <h3 className="font-headline font-bold text-2xl sm:text-3xl text-white">
              {t.careerTitle}
            </h3>

            <p className="text-base text-sarthiMuted leading-relaxed">
              {t.careerDesc}
            </p>

            <ul className="space-y-2 text-sm text-sarthiText pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiPink" />
                <span>RAG analysis matching your resume to real-time hiring trends</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiPink" />
                <span>Tailored project ideas to stand out in Tier-2/3 college campus drives</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiPink" />
                <span>Instant action-verb bullet generator for higher ATS passing rates</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Row 3: Wellness Companion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sarthiPink/15 border border-sarthiPink/30 text-sarthiPink text-xs font-bold font-mono">
              <Shield className="w-3.5 h-3.5" />
              {t.wellnessBadge}
            </div>

            <h3 className="font-headline font-bold text-2xl sm:text-3xl text-white">
              {t.wellnessTitle}
            </h3>

            <p className="text-base text-sarthiMuted leading-relaxed">
              {t.wellnessDesc}
            </p>

            <ul className="space-y-2 text-sm text-sarthiText pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiPink" />
                <span>Early stress & burnout detection through speech tone and chat context</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiPink" />
                <span>1-minute guided Box Breathing timer to calm placement panic</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sarthiPink" />
                <span>100% encrypted, private & strictly confidential</span>
              </li>
            </ul>
          </div>

          {/* Right Interactive Breathing & Mood Simulator */}
          <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-sarthiGold/30 shadow-2xl bg-darkSurface/90 text-center space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-sarthiGold flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-sarthiPink fill-sarthiPink" />
                Interactive Wellness & Breathing Widget
              </span>
              <span className="text-[10px] font-mono bg-sarthiGold/20 text-sarthiGold px-2 py-0.5 rounded">1-Min Reset</span>
            </div>

            {/* Mood selector */}
            <div className="space-y-2">
              <span className="text-xs text-sarthiMuted">How are you feeling right now?</span>
              <div className="flex justify-center gap-2">
                {['Calm 😌', 'Anxious 😰', 'Overwhelmed 🤯', 'Tired 😴'].map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMood(m)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      mood === m
                        ? 'bg-sarthiPink text-white border-sarthiPink font-bold'
                        : 'bg-darkBg text-sarthiMuted border-white/10 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Animated Box Breathing Visual Circle */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-4 border-sarthiPink transition-all duration-1000 ${
                  breathingActive ? (breathPhase === 'Inhale' ? 'scale-110 opacity-100 shadow-2xl shadow-sarthiPink' : 'scale-90 opacity-60') : 'scale-100 opacity-30'
                }`}
              ></div>
              <div className="text-center space-y-1">
                <p className="font-headline font-bold text-xl text-white">
                  {breathingActive ? breathPhase : 'Ready'}
                </p>
                <p className="font-mono text-2xl text-sarthiGold font-extrabold">
                  {breathingActive ? `${timer}s` : 'Box Breath'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className="px-6 py-2.5 rounded-xl bg-sarthiPink hover:bg-sarthiPurple text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              {breathingActive ? 'Pause Exercise' : 'Start 1-Min Guided Breathing'}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
