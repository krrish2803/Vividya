import React from 'react';
import { translations } from '../data/translations';
import { Mic, WifiOff, FileSearch, BookOpenCheck, Smile, Users, Cpu } from 'lucide-react';

export default function FeaturesSection({ lang }) {
  const t = translations[lang].features;

  const features = [
    {
      title: t.card1Title,
      body: t.card1Body,
      icon: <Mic className="w-7 h-7 text-sarthiPurple" />,
      badge: "Whisper AI Engine",
      color: "from-indigo-500/20 to-purple-500/20",
      accent: "#8B5CF6"
    },
    {
      title: t.card2Title,
      body: t.card2Body,
      icon: <WifiOff className="w-7 h-7 text-sarthiGold" />,
      badge: "Local LLM 3B",
      color: "from-amber-500/20 to-orange-500/20",
      accent: "#FBBF24"
    },
    {
      title: t.card3Title,
      body: t.card3Body,
      icon: <FileSearch className="w-7 h-7 text-sarthiPink" />,
      badge: "CV Parser v2",
      color: "from-pink-500/20 to-rose-500/20",
      accent: "#EC4899"
    },
    {
      title: t.card4Title,
      body: t.card4Body,
      icon: <BookOpenCheck className="w-7 h-7 text-sarthiPrimary" />,
      badge: "Vector DB RAG",
      color: "from-blue-500/20 to-indigo-500/20",
      accent: "#6366F1"
    },
    {
      title: t.card5Title,
      body: t.card5Body,
      icon: <Smile className="w-7 h-7 text-emerald-400" />,
      badge: "Sentiment AI",
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "#34D399"
    },
    {
      title: t.card6Title,
      body: t.card6Body,
      icon: <Users className="w-7 h-7 text-cyan-400" />,
      badge: "Matching Engine",
      color: "from-cyan-500/20 to-sky-500/20",
      accent: "#38BDF8"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-darkSurface to-darkBg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-sarthiGold uppercase bg-sarthiGold/10 px-3 py-1 rounded-full border border-sarthiGold/20">
            {t.tag}
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-sarthiMuted leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className="group glass-card glass-card-hover rounded-2xl p-7 border border-white/10 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Icon + Tech Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-darkBg border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {item.icon}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-sarthiMuted group-hover:text-white group-hover:border-sarthiPurple/40 transition-colors">
                    <Cpu className="w-3 h-3 text-sarthiGold" />
                    {item.badge}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-headline font-bold text-xl text-white mb-2 group-hover:text-sarthiPink transition-colors">
                  {item.title}
                </h3>

                {/* Body Description */}
                <p className="text-sm text-sarthiMuted leading-relaxed">
                  {item.body}
                </p>
              </div>

              {/* Ambient Glowing background gradient */}
              <div
                className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${item.color} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              ></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
