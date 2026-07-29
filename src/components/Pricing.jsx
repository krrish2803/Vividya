import React, { useState } from 'react';
import { translations } from '../data/translations';
import confetti from 'canvas-confetti';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function Pricing({ lang, onOpenAuth }) {
  const t = translations[lang].pricing;
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSelectPlan = (planName) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onOpenAuth();
  };

  const plans = [
    {
      name: t.plan1Name,
      priceMonthly: "₹0",
      priceAnnual: "₹0",
      period: t.plan1Period,
      desc: t.plan1Desc,
      popular: true,
      badge: t.popularBadge,
      cta: t.ctaStart,
      ctaStyle: "bg-primary-gradient text-white shadow-xl shadow-sarthiPrimary/30",
      features: [
        "Chat doubts (500 msgs / month)",
        "Notes summarization (10 PDFs / mo)",
        "Daily mood & wellness check-ins",
        "Basic ATS resume score audit",
        "Access to Indian Student Community"
      ]
    },
    {
      name: t.plan2Name,
      priceMonthly: "₹99",
      priceAnnual: "₹74",
      period: t.plan2Period,
      desc: t.plan2Desc,
      popular: false,
      cta: t.ctaPro,
      ctaStyle: "bg-darkSurface border border-white/20 text-white hover:bg-sarthiPurple",
      features: [
        "Everything in Starter Plan",
        "Unlimited Chat & Doubt solving",
        "Unlimited ATS Resume Analysis",
        "100% Offline Hostel Mode (Local LLM)",
        "Custom Daily Study Timetable",
        "Peer Study Group Matching Engine"
      ]
    },
    {
      name: t.plan3Name,
      priceMonthly: "₹299",
      priceAnnual: "₹224",
      period: t.plan3Period,
      desc: t.plan3Desc,
      popular: false,
      cta: t.ctaPro,
      ctaStyle: "bg-darkSurface border border-white/20 text-white hover:bg-sarthiPink",
      features: [
        "Everything in Pro Student Plan",
        "1-on-1 AI Mock Technical Interviews",
        "AI Portfolio & Project Architect",
        "Real-time Placement Job Alerts",
        "Priority 24/7 Mentor Support",
        "GATE & CAT Mock Test RAG"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-darkSurface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-sarthiPink uppercase bg-sarthiPink/10 px-3 py-1 rounded-full border border-sarthiPink/20">
            {t.tag}
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-sarthiMuted leading-relaxed">
            {t.subtitle}
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${!isAnnual ? 'text-white' : 'text-sarthiMuted'}`}>
              {t.monthly}
            </span>
            
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-7 bg-darkBg border border-white/20 rounded-full p-1 transition-colors relative"
            >
              <div
                className={`w-5 h-5 rounded-full bg-sarthiPurple transition-transform duration-300 ${
                  isAnnual ? 'translate-x-7 bg-sarthiPink' : 'translate-x-0'
                }`}
              ></div>
            </button>

            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-white' : 'text-sarthiMuted'}`}>
              {t.annual}
              <span className="bg-sarthiGold/20 text-sarthiGold text-[10px] font-mono px-2 py-0.5 rounded-full border border-sarthiGold/30">
                SAVE 25%
              </span>
            </span>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`glass-card rounded-2xl p-8 border relative flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'border-sarthiGold bg-darkSurfaceElevated/90 shadow-2xl scale-105 z-10'
                  : 'border-white/10 bg-darkSurface/70 hover:border-white/30'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold-gradient text-darkBg font-headline font-extrabold text-[11px] tracking-wider uppercase shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-darkBg" />
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Plan Title & Price */}
                <h3 className="font-headline font-bold text-xl text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-xs text-sarthiMuted mb-6">{plan.desc}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-headline font-black text-4xl text-white">
                    {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-xs font-mono text-sarthiMuted">{plan.period}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 text-xs text-sarthiText mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-sarthiPurple/20 border border-sarthiPurple flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-sarthiGold stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-3.5 rounded-xl font-headline font-bold text-xs transition-all duration-200 ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
