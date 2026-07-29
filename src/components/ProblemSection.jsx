import React, { useState } from 'react';
import { translations } from '../data/translations';
import { BookOpen, FileSpreadsheet, ShieldAlert, ChevronDown, Sparkles } from 'lucide-react';

export default function ProblemSection({ lang }) {
  const t = translations[lang].problem;
  const [expandedCard, setExpandedCard] = useState(null);

  const cards = [
    {
      id: 'juggling',
      title: t.card1Title,
      body: t.card1Body,
      icon: "📚",
      color: "from-indigo-500 to-purple-600",
      detail: lang === 'hi' 
        ? "भारतीय कॉलेजों में 80% छात्र अकेले बिना किसी पर्सनल मेंटर के पढ़ाई करते हैं। विविद्या इस दूरी को समाप्त करता है।"
        : "Over 80% of students in Indian Tier-2/3 colleges report having no career mentor. Vividya acts as your always-available guide."
    },
    {
      id: 'overload',
      title: t.card2Title,
      body: t.card2Body,
      icon: "📄",
      color: "from-purple-500 to-pink-600",
      detail: lang === 'hi' 
        ? "यूट्यूब वीडियो और जेनेरिक AI कभी यह नहीं बताते कि आपके विशिष्ट कॉलेज सिलेबस और ब्रांच के लिए क्या सही है।"
        : "Generic AI chatbots lack local Indian college context. Vividya understands your exact syllabus and regional placement realities."
    },
    {
      id: 'safetynet',
      title: t.card3Title,
      body: t.card3Body,
      icon: "🛡️",
      color: "from-pink-500 to-amber-500",
      detail: lang === 'hi' 
        ? "परीक्षा और प्लेसमेंट के तनाव में कोई ध्यान नहीं देता। विविद्या संवाद शैली से मानसिक तनाव का समय पर पता लगाता है।"
        : "Placement panic & backlog anxiety cause silent burnout. Vividya incorporates gentle wellness prompts to keep your mind healthy."
    }
  ];

  return (
    <section className="py-20 bg-darkSurface relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-sarthiPink uppercase bg-sarthiPink/10 px-3 py-1 rounded-full border border-sarthiPink/20">
            {t.tag}
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-sarthiMuted leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 3-Column Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => {
            const isExpanded = expandedCard === card.id;

            return (
              <div
                key={card.id}
                onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                className="group glass-card glass-card-hover rounded-2xl p-7 border border-white/10 relative cursor-pointer flex flex-col justify-between"
              >
                {/* Top Animated Icon Container */}
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-darkBg to-darkSurfaceElevated border border-white/10 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-6">
                    <span className="animate-pulse">{card.icon}</span>
                  </div>

                  {/* Card Title */}
                  <h3 className="font-headline font-bold text-xl text-white mb-3 group-hover:text-sarthiPink transition-colors">
                    {card.title}
                  </h3>

                  {/* Body Text */}
                  <p className="text-sm text-sarthiMuted leading-relaxed">
                    {card.body}
                  </p>
                </div>

                {/* Expandable detail footer */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs font-mono text-sarthiGold font-semibold">
                    <span>{isExpanded ? (lang === 'hi' ? 'कम देखें' : 'Hide Context') : (lang === 'hi' ? 'और विस्तार से जानें' : 'Read Deep Dive')}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-sarthiPink' : ''}`} />
                  </div>

                  {isExpanded && (
                    <div className="mt-3 p-3 rounded-xl bg-darkBg/90 text-xs text-sarthiMuted border border-sarthiPurple/30 animate-fade-in leading-relaxed">
                      <Sparkles className="w-3.5 h-3.5 text-sarthiPink inline mr-1" />
                      {card.detail}
                    </div>
                  )}
                </div>

                {/* Hover Gradient Border accent */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sarthiPrimary via-sarthiPurple to-sarthiPink opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
