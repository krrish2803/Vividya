import React, { useState } from 'react';
import { translations } from '../data/translations';
import { ChevronDown, Search, Lock, Wifi, Globe, Shield, Code, Heart, HelpCircle } from 'lucide-react';

export default function FaqSection({ lang }) {
  const t = translations[lang].faq;
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: lang === 'hi' ? "क्या सारथी सच में मुफ्त है?" : "Is Sarthi really free?",
      a: lang === 'hi' 
        ? "हाँ! स्टार्टर प्लान 100% मुफ्त है जिसमें 500 संदेश/महीना शामिल हैं। आप बिना किसी क्रेडिट कार्ड के हमेशा मुफ्त उपयोग कर सकते हैं।"
        : "Yes! The Starter plan is completely free forever with 500 messages/month. Pro and Elite plans unlock unlimited RAG and mock interview features. No credit card required.",
      icon: <HelpCircle className="w-4 h-4 text-sarthiGold" />
    },
    {
      q: lang === 'hi' ? "क्या मेरा डेटा सुरक्षित है? क्या सारथी मेरा डेटा बेचता है?" : "Is my data safe? Does Sarthi sell my data?",
      a: lang === 'hi' 
        ? "नहीं, कभी नहीं। हम भारतीय डेटा सुरक्षा कानूनों और GDPR का पालन करते हैं। आपकी चैट, रिज्यूमे और वेलनेस डेटा पूरी तरह से एन्क्रिप्टेड है।"
        : "Never. We are India-based and GDPR-compliant. Your conversations, resume, and wellness data are encrypted end-to-end. We make money from subscription plans, never data selling.",
      icon: <Lock className="w-4 h-4 text-sarthiPink" />
    },
    {
      q: lang === 'hi' ? "ऑफलाइन मोड कैसे काम करता है?" : "How does offline mode work?",
      a: lang === 'hi' 
        ? "सारथी आपके डिवाइस पर एक हल्का ऑन-डिवाइस LLM मॉडल डाउनलोड करता है। जब हॉस्टल में Wi-Fi बंद होता है, तब भी यह सुचारू रूप से चलता है।"
        : "Sarthi downloads a lightweight 3B parameter on-device LLM. You get instant doubt solving even during hostel Wi-Fi outages. It automatically syncs when online.",
      icon: <Wifi className="w-4 h-4 text-sarthiPurple" />
    },
    {
      q: lang === 'hi' ? "सारथी किन भाषाओं का समर्थन करता है?" : "Which languages does Sarthi support?",
      a: lang === 'hi' 
        ? "अंग्रेजी, हिंदी, हिंग्लिश, बंगाली, तमिल, तेलुगु, मराठी और गुजराती। आप अपनी सामान्य भाषा में बोल या लिख सकते हैं।"
        : "English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, and Gujarati. Speak or type in your natural everyday tone!",
      icon: <Globe className="w-4 h-4 text-sarthiPrimary" />
    },
    {
      q: lang === 'hi' ? "करियर मार्गदर्शन कितना सटीक है?" : "How accurate is the career guidance?",
      a: lang === 'hi' 
        ? "हम 100,000+ वास्तविक भारतीय नौकरियों के डेटाबेस का विश्लेषण करते हैं। यह जेनेरिक सलाह नहीं देता, बल्कि वास्तविक टियर-2/3 मांगों पर आधारित है।"
        : "We analyze 100k+ real Indian job postings daily from LinkedIn, Naukri & company career portals. Recommendations match actual skills required by Indian recruiters.",
      icon: <Shield className="w-4 h-4 text-emerald-400" />
    },
    {
      q: lang === 'hi' ? "सारथी किस तकनीक से बना है?" : "What tech is Sarthi built with?",
      a: lang === 'hi' 
        ? "हम Groq LPU (तेज एलएलएम), Llama-3.1, Whisper (वॉइस) और करियर व वेलनेस के लिए फाइन-ट्यून मॉडल का उपयोग करते हैं।"
        : "Powered by Groq LPUs for ultra-fast inference, Llama-3.1 reasoning engines, Whisper for voice, and custom fine-tuned career RAG models.",
      icon: <Code className="w-4 h-4 text-cyan-400" />
    },
    {
      q: lang === 'hi' ? "क्या सारथी एक थेरेपिस्ट है?" : "Is Sarthi a therapist?",
      a: lang === 'hi' 
        ? "नहीं। सारथी एक मित्रवत AI गाइड है, पेशेवर मानसिक स्वास्थ्य सेवा का विकल्प नहीं। आपात स्थिति में हम सीधे संकट हेल्पलाइन (Helpline 14416) से जोड़ते हैं।"
        : "No. Sarthi is a supportive companion, not a substitute for clinical therapy. In severe distress, we connect you directly to verified national student crisis helplines.",
      icon: <Heart className="w-4 h-4 text-sarthiAlert" />
    },
    {
      q: lang === 'hi' ? "यदि कोई समस्या आती है तो सहायता कैसे पाएं?" : "What if something breaks or I need help?",
      a: lang === 'hi' 
        ? "हमें support@sarthi.ai पर ईमेल करें या ऐप में चैट करें। हमारी टीम 4 घंटे के भीतर जवाब देती है।"
        : "Email us at support@sarthi.ai or reach out on our Discord community. Our team responds within 4 hours.",
      icon: <HelpCircle className="w-4 h-4 text-sarthiGold" />
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  return (
    <section id="faq" className="py-24 bg-darkBg relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-sarthiGold uppercase bg-sarthiGold/10 px-3 py-1 rounded-full border border-sarthiGold/20">
            {t.tag}
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-sarthiMuted leading-relaxed">
            {t.subtitle}
          </p>

          {/* Search Input Bar */}
          <div className="relative max-w-md mx-auto pt-4">
            <Search className="w-4 h-4 text-sarthiMuted absolute left-3.5 top-7" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-darkSurface border border-white/10 focus:border-sarthiPurple rounded-xl text-xs text-white placeholder-sarthiMuted outline-none"
            />
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-darkBg border border-white/10 flex items-center justify-center shrink-0">
                      {faq.icon}
                    </div>
                    <span className="font-headline font-bold text-base text-white">
                      {faq.q}
                    </span>
                  </div>

                  <ChevronDown className={`w-5 h-5 text-sarthiMuted shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sarthiPink' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-sarthiMuted leading-relaxed border-t border-white/5 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
