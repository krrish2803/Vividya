import React from 'react';
import { translations } from '../data/translations';
import { Check, X, Sparkles, ShieldCheck } from 'lucide-react';

export default function UspSection({ lang }) {
  const t = translations[lang].usp;

  const rows = [
    { name: t.f1, generic: false, edtech: false, sarthi: true, note: "Supports 8+ languages incl. Hinglish" },
    { name: t.f2, generic: false, edtech: false, sarthi: true, note: "Runs local 3B LLM without Wi-Fi" },
    { name: t.f3, generic: false, edtech: "Limited", sarthi: true, note: "Early stress detection & guided wellness" },
    { name: t.f4, generic: false, edtech: false, sarthi: true, note: "Real-time hiring data from 100k+ Indian postings" },
    { name: t.f5, generic: "₹1,600/mo", edtech: "₹15,000/yr", sarthi: "₹0 Free Plan", note: "100% Student budget friendly" },
  ];

  return (
    <section className="py-24 bg-darkSurface relative overflow-hidden">
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

        {/* 4-Column Table Matrix Container */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 bg-darkBg/80 font-headline">
                <th className="p-5 text-sm font-bold text-sarthiMuted w-2/5">{t.colFeature}</th>
                <th className="p-5 text-sm font-bold text-sarthiMuted text-center">{t.colGeneric}</th>
                <th className="p-5 text-sm font-bold text-sarthiMuted text-center">{t.colEdtech}</th>
                <th className="p-5 text-sm font-bold text-white text-center bg-sarthiPurple/20 border-x border-sarthiPurple/30">
                  <span className="flex items-center justify-center gap-1 gradient-text font-black text-base">
                    <Sparkles className="w-4 h-4 text-sarthiGold fill-sarthiGold" />
                    {t.colSarthi}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  
                  {/* Feature Name & Note */}
                  <td className="p-5">
                    <p className="text-white font-semibold">{row.name}</p>
                    <p className="text-xs text-sarthiMuted font-mono mt-0.5">{row.note}</p>
                  </td>

                  {/* Generic AI */}
                  <td className="p-5 text-center">
                    {row.generic === false ? (
                      <X className="w-5 h-5 text-sarthiAlert mx-auto opacity-60" />
                    ) : (
                      <span className="text-xs text-sarthiMuted font-mono">{row.generic}</span>
                    )}
                  </td>

                  {/* Traditional EdTech */}
                  <td className="p-5 text-center">
                    {row.edtech === false ? (
                      <X className="w-5 h-5 text-sarthiAlert mx-auto opacity-60" />
                    ) : (
                      <span className="text-xs text-sarthiMuted font-mono">{row.edtech}</span>
                    )}
                  </td>

                  {/* Sarthi AI - Highlighted Column */}
                  <td className="p-5 text-center bg-sarthiPurple/15 border-x border-sarthiPurple/30 font-bold text-sarthiGold">
                    {row.sarthi === true ? (
                      <div className="w-7 h-7 rounded-full bg-sarthiGold/20 border border-sarthiGold flex items-center justify-center mx-auto shadow-lg shadow-sarthiGold/20 animate-pulse">
                        <Check className="w-4 h-4 text-sarthiGold stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-sm font-mono text-sarthiGold font-extrabold">{row.sarthi}</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Banner callout */}
        <div className="mt-8 text-center">
          <p className="text-sm text-sarthiMuted font-medium italic">
            "Sarthi is built by Indian college graduates. We don't pretend to understand your situation — we lived it."
          </p>
        </div>

      </div>
    </section>
  );
}
