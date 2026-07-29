import React, { useState } from 'react';
import { translations } from '../data/translations';
import { UserCheck, MessageSquareCode, Rocket, ArrowRight, Clock, Sparkles } from 'lucide-react';

export default function HowItWorks({ lang }) {
  const t = translations[lang].howItWorks;
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: t.step1Num,
      title: t.step1Title,
      desc: t.step1Desc,
      time: t.step1Time,
      icon: <UserCheck className="w-8 h-8 text-sarthiPrimary" />,
      detail: lang === 'hi'
        ? "अपना कॉलेज, ब्रांच (B.Tech CSE, ECE, B.Com), लक्ष्य और भाषा पसंद चुनें। केवल 2 मिनट में आपका पर्सनल सारथी AI तैयार हो जाता है।"
        : "Select your college, stream (B.Tech, B.Com, MBA), target companies & language preference. Sarthi initializes your personal engine in 2 minutes."
    },
    {
      num: t.step2Num,
      title: t.step2Title,
      desc: t.step2Desc,
      time: t.step2Time,
      icon: <MessageSquareCode className="w-8 h-8 text-sarthiPurple" />,
      detail: lang === 'hi'
        ? "हिंग्लिश, हिंदी या इंग्लिश में बिना किसी हिचकिचाहट के सवाल पूछें। क्लास नोट्स की फोटो स्कैन करें और आसान भाषा में उत्तर पाएं।"
        : "Ask doubts in Hinglish or Hindi naturally. Scan handwritten lecture notes or past papers to get instant syllabus answers."
    },
    {
      num: t.step3Num,
      title: t.step3Title,
      desc: t.step3Desc,
      time: t.step3Time,
      icon: <Rocket className="w-8 h-8 text-sarthiPink" />,
      detail: lang === 'hi'
        ? "रिज्यूमे स्कोर सुधारें, 1-ऑन-1 इंटरव्यू प्रेप करें, और परीक्षा तनाव को दूर भगाएं। प्लेसमेंट का सपना पूरा करें!"
        : "Improve your ATS resume score, practice AI mock interviews, and maintain mental balance through your entire placement drive."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-darkBg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-mono font-bold tracking-widest text-sarthiPink uppercase bg-sarthiPink/10 px-3 py-1 rounded-full border border-sarthiPink/20">
            {t.tag}
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-sarthiMuted leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 3 Steps Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Animated Connecting Line on Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-sarthiPrimary via-sarthiPurple to-sarthiPink -translate-y-12 -z-0 opacity-40"></div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`glass-card glass-card-hover rounded-2xl p-8 border relative cursor-pointer transition-all ${
                activeStep === idx
                  ? 'border-sarthiPurple bg-darkSurfaceElevated/90 shadow-2xl scale-105'
                  : 'border-white/10 bg-darkSurface/70'
              }`}
            >
              {/* Step Number Circle */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-darkBg border border-sarthiPurple/40 flex items-center justify-center shadow-xl">
                  {step.icon}
                </div>

                <span className="font-headline font-black text-4xl text-white/20">
                  0{step.num}
                </span>
              </div>

              {/* Step Title */}
              <h3 className="font-headline font-bold text-xl text-white mb-2">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-sm text-sarthiMuted leading-relaxed mb-4">
                {step.desc}
              </p>

              {/* Time Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sarthiGold/15 border border-sarthiGold/30 text-sarthiGold text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                {step.time}
              </div>

              {/* Detail Expansion */}
              {activeStep === idx && (
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-sarthiText animate-fade-in leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 text-sarthiPink inline mr-1" />
                  {step.detail}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
