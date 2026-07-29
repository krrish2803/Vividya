import React, { useState, useEffect } from 'react';
import { translations } from '../data/translations';
import { Star, Quote, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function SocialProof({ lang }) {
  const t = translations[lang].testimonials;
  const [filter, setFilter] = useState('All');
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: lang === 'hi'
        ? "मेरे कॉलेज में कोई गाइड नहीं है। सारथी मेरे लिए सबसे बढ़िया मेंटर है। जब मैं रात 2 बजे प्लेसमेंट के लिए परेशान होता हूं, तो यह हमेशा उपलब्ध रहता है!"
        : "I don't have a mentor at my college. Sarthi is the next best thing. Actually, better—it's available at 2 AM when I'm panicking about placements.",
      author: "Priya Sharma",
      role: "B.Tech CSE",
      college: "Tier-2 College, Bangalore",
      rating: 5,
      stream: "CSE",
      avatar: "👩‍💻"
    },
    {
      id: 2,
      quote: lang === 'hi'
        ? "रिज्यूमे फीडबैक बहुत ही शानदार था! सारथी के सुझावों के आधार पर अपडेट करने के बाद मुझे 3 इंटरव्यू कॉल मिले। वास्तव में गेम-चेंजर।"
        : "The resume feedback was SO detailed. I got 3 interview calls after updating based on Sarthi's suggestions. Legit game-changer.",
      author: "Arjun Verma",
      role: "ECE Final Year",
      college: "Tier-3 Institute, Mumbai",
      rating: 5,
      stream: "ECE",
      avatar: "👨‍💻"
    },
    {
      id: 3,
      quote: lang === 'hi'
        ? "परीक्षा के दौरान जब मैं बहुत तनाव में थी, तब सारथी के वेलनेस चेक ने वास्तव में मदद की। ऐसा लगा जैसे कोई मेरी चिंता करता है।"
        : "When I was stressed during exams, Sarthi's wellness checks actually helped. It felt like someone genuinely cared about my mental health.",
      author: "Divya Krishnan",
      role: "Mechanical Eng",
      college: "Tier-2 College, Chennai",
      rating: 5,
      stream: "Core",
      avatar: "👩‍🔬"
    },
    {
      id: 4,
      quote: lang === 'hi'
        ? "हिंग्लिश में डाउट्स पूछना बहुत आसान है। सर से 5 बार एक ही सवाल पूछने में डर लगता था, पर सारथी कभी जज नहीं करता।"
        : "Asking doubts in Hinglish is so seamless. I was scared to ask the same doubt to professors, but Sarthi never judges!",
      author: "Rohan Gupta",
      role: "B.Com Honors",
      college: "State Univ, Lucknow",
      rating: 5,
      stream: "Commerce",
      avatar: "👨‍🎓"
    }
  ];

  const filtered = filter === 'All' 
    ? testimonials 
    : testimonials.filter(item => item.stream === filter);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % filtered.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [filtered.length]);

  return (
    <section className="py-24 bg-darkBg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-sarthiGold uppercase bg-sarthiGold/10 px-3 py-1 rounded-full border border-sarthiGold/20">
            {t.tag}
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-sarthiMuted leading-relaxed">
            {t.subtitle}
          </p>

          {/* Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {['All', 'CSE', 'ECE', 'Core'].map((f, idx) => (
              <button
                key={idx}
                onClick={() => { setFilter(f); setActiveSlide(0); }}
                className={`text-xs px-3.5 py-1.5 rounded-full border font-mono transition-all ${
                  filter === f
                    ? 'bg-sarthiPurple text-white border-sarthiPurple font-bold shadow-lg'
                    : 'bg-darkSurface text-sarthiMuted border-white/10 hover:text-white'
                }`}
              >
                {f === 'All' ? 'All Reviews' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              className={`glass-card glass-card-hover rounded-2xl p-7 border relative flex flex-col justify-between transition-all ${
                activeSlide === idx ? 'border-sarthiPink bg-darkSurfaceElevated/90' : 'border-white/10 bg-darkSurface/70'
              }`}
            >
              <div>
                {/* Rating stars & Avatar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-sarthiGold gap-0.5">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-sarthiGold text-sarthiGold" />
                    ))}
                  </div>

                  <span className="text-2xl">{item.avatar}</span>
                </div>

                {/* Quote Text */}
                <p className="text-sm text-sarthiText leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-headline font-bold text-sm text-white flex items-center gap-1">
                    {item.author}
                    <CheckCircle className="w-3.5 h-3.5 text-sarthiGold" />
                  </h4>
                  <p className="text-xs text-sarthiMuted">{item.role} • {item.college}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Stats Summary Bar */}
        <div className="mt-16 glass-card p-6 rounded-2xl border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h4 className="font-headline font-extrabold text-3xl text-sarthiPrimary">10,000+</h4>
            <p className="text-xs text-sarthiMuted font-mono mt-1">Students Enrolled</p>
          </div>
          <div>
            <h4 className="font-headline font-extrabold text-3xl text-sarthiGold">4.8 / 5.0</h4>
            <p className="text-xs text-sarthiMuted font-mono mt-1">Average Rating</p>
          </div>
          <div>
            <h4 className="font-headline font-extrabold text-3xl text-sarthiPink">95%</h4>
            <p className="text-xs text-sarthiMuted font-mono mt-1">Student Retention</p>
          </div>
          <div>
            <h4 className="font-headline font-extrabold text-3xl text-sarthiPurple">8+</h4>
            <p className="text-xs text-sarthiMuted font-mono mt-1">Vernacular Languages</p>
          </div>
        </div>

      </div>
    </section>
  );
}
