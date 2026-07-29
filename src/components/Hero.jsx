import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations } from '../data/translations';
import HeroCanvas from './HeroCanvas';
import { Play, Sparkles, Send, CheckCircle2, ShieldCheck, Users, Globe2, ArrowRight } from 'lucide-react';

export default function Hero({ lang, onOpenDemo }) {
  const navigate = useNavigate();
  const t = translations[lang].hero;

  // Live quick ask simulator inside Hero
  const [userQuery, setUserQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [simulatedAnswer, setSimulatedAnswer] = useState(null);

  const samplePrompts = [
    { label: "Hindi", query: "B.Tech Tier-3 college se 12 LPA placement ki tayari kaise karein?" },
    { label: "Hinglish", query: "Exam pressure and semester backlog tension kaise kam karein?" },
    { label: "English", query: "How to craft an ATS resume without prior internship experience?" }
  ];

  const handleSimulateAsk = (promptText) => {
    const textToAsk = promptText || userQuery;
    if (!textToAsk.trim()) return;

    setUserQuery(textToAsk);
    setIsTyping(true);
    setSimulatedAnswer(null);

    setTimeout(() => {
      setIsTyping(false);
      if (textToAsk.includes('placement') || textToAsk.includes('12 LPA')) {
        setSimulatedAnswer(
          lang === 'hi'
            ? "विविद्या रोडमैप: 1. सबसे पहले Data Structures & Algorithms (Java/C++) पक्का करें। 2. 2 अच्छे फुल-स्टैक प्रोजेक्ट बनाएं। 3. विविद्या ATS-रिज्यूमे स्कैनर से अपना रिज्यूमे चेक करें। चिंता न करें, टियर-3 से भी 12+ LPA संभव है!"
            : "Vividya Roadmap: 1. Focus on Data Structures (DSA in Java/C++). 2. Build 2 real-world Full-Stack projects. 3. Scan resume on Vividya ATS module. Thousands of Tier-3 students achieved this—you can too! 🚀"
        );
      } else if (textToAsk.includes('Exam') || textToAsk.includes('pressure') || textToAsk.includes('backlog')) {
        setSimulatedAnswer(
          lang === 'hi'
            ? "विविद्या सलाह: सांस गहरी लें (1-min Breathing Exercise)! सबसे पहले कठिन सब्जेक्ट्स को छोटे 25-मिनट पॉमोडोरो ब्लॉक में बांटें। विविद्या RAG नोट्स से अपने कॉलेज के पिछले साल के प्रश्न देखें।"
            : "Vividya Advice: Take a deep breath! Divide heavy subjects into 25-min Pomodoro slots. Use Vividya RAG Notes to quickly scan past exam papers. You're not alone! ❤️"
        );
      } else {
        setSimulatedAnswer(
          lang === 'hi'
            ? "विविद्या रिज्यूमे टिप: बिना इंटर्नशिप के भी अपने कॉलेज प्रोजेक्ट्स, हैकाथॉन और ओपन-सोर्स योगदान को हाइलाइट करें। एक्शन वर्ब्स (e.g. 'Engineered', 'Optimized') का उपयोग करें!"
            : "Vividya Resume Tip: Highlight your college projects, hackathons & GitHub repositories. Use strong action verbs like 'Engineered', 'Architected' & quantify results (e.g., 'Optimized speed by 40%')!"
        );
      }
    }, 900);
  };

  return (
    <section id="home" className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 bg-hero-gradient overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-sarthiPrimary/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-sarthiPink/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-noise opacity-60 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sarthiPurple/15 border border-sarthiPurple/30 text-sarthiPink text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sarthiGold animate-spin-slow" />
              <span>{t.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-headline font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15]">
              {t.titlePrefix}
              <span className="gradient-text font-black"> {t.titleHighlight1}</span>,
              <span className="text-sarthiPink"> {t.titleHighlight2}</span> &
              <span className="gold-gradient-text"> {t.titleHighlight3}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl text-sarthiMuted max-w-2xl font-normal leading-relaxed">
              {t.subtitle}
            </p>

            {/* Social Proof Metric Counters */}
            <div className="grid grid-cols-3 gap-3 pt-2 pb-2">
              <div className="glass-card p-3 rounded-xl border border-white/10 text-center sm:text-left">
                <p className="font-headline font-bold text-xl sm:text-2xl text-white flex items-center justify-center sm:justify-start gap-1">
                  <Users className="w-4 h-4 text-sarthiPrimary" />
                  {t.stat1Number}
                </p>
                <p className="text-[11px] sm:text-xs text-sarthiMuted">{t.stat1Label}</p>
              </div>

              <div className="glass-card p-3 rounded-xl border border-white/10 text-center sm:text-left">
                <p className="font-headline font-bold text-xl sm:text-2xl text-sarthiGold flex items-center justify-center sm:justify-start gap-1">
                  <CheckCircle2 className="w-4 h-4 text-sarthiGold" />
                  {t.stat2Number}
                </p>
                <p className="text-[11px] sm:text-xs text-sarthiMuted">{t.stat2Label}</p>
              </div>

              <div className="glass-card p-3 rounded-xl border border-white/10 text-center sm:text-left">
                <p className="font-headline font-bold text-xl sm:text-2xl text-sarthiPink flex items-center justify-center sm:justify-start gap-1">
                  <Globe2 className="w-4 h-4 text-sarthiPink" />
                  {t.stat3Number}
                </p>
                <p className="text-[11px] sm:text-xs text-sarthiMuted">{t.stat3Label}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/auth')}
                className="group relative inline-flex items-center justify-center gap-2 font-headline font-bold text-base text-white bg-primary-gradient px-7 py-4 rounded-xl shadow-xl shadow-sarthiPrimary/30 hover:shadow-sarthiPrimary/60 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>{t.ctaPrimary}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenDemo}
                className="inline-flex items-center justify-center gap-2.5 font-headline font-semibold text-base text-white bg-darkSurface/90 border border-white/15 px-6 py-4 rounded-xl hover:bg-white/10 hover:border-sarthiPurple/50 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-full bg-sarthiPurple/30 flex items-center justify-center text-sarthiPink">
                  <Play className="w-3.5 h-3.5 fill-sarthiPink ml-0.5" />
                </div>
                <span>{t.ctaSecondary}</span>
              </button>
            </div>

            {/* Quick Vividya Simulator Card right in Hero */}
            <div className="mt-6 glass-card p-4 rounded-2xl border border-sarthiPurple/30 bg-darkSurface/80 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-sarthiGold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sarthiGold" />
                  Try Vividya AI Live Simulator
                </span>
                <span className="text-[10px] text-sarthiMuted font-mono">Offline Engine Active</span>
              </div>

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {samplePrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulateAsk(item.query)}
                    className="text-[11px] bg-darkBg/70 hover:bg-sarthiPurple/30 text-sarthiMuted hover:text-white px-2.5 py-1 rounded-full border border-white/10 transition-colors text-left truncate max-w-full"
                  >
                    <span className="text-sarthiPink font-bold mr-1">[{item.label}]</span>
                    {item.query}
                  </button>
                ))}
              </div>

              {/* Input box */}
              <form onSubmit={(e) => { e.preventDefault(); handleSimulateAsk(); }} className="flex gap-2">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder={t.quickAskPlaceholder}
                  className="flex-1 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-sarthiMuted/60 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isTyping}
                  className="bg-sarthiPurple hover:bg-sarthiPrimary text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.quickAskBtn}</span>
                </button>
              </form>

              {/* Typing state or Answer result */}
              {isTyping && (
                <div className="mt-3 flex items-center gap-2 text-xs text-sarthiPink font-mono animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Vividya is thinking in Hindi/English...
                </div>
              )}

              {simulatedAnswer && (
                <div className="mt-3 p-3 rounded-xl bg-sarthiPurple/15 border border-sarthiPurple/30 text-xs text-sarthiText animate-fade-in space-y-1">
                  <p className="font-bold text-sarthiGold flex items-center gap-1">
                    <span>🎓</span> {t.responseTag}
                  </p>
                  <p className="leading-relaxed">{simulatedAnswer}</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: 3D Interactive Canvas */}
          <div className="lg:col-span-5 relative">
            <HeroCanvas />
          </div>

        </div>
      </div>
    </section>
  );
}
