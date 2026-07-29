import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  FileText, Plus, Trash2, Download, Sparkles, Loader2,
  User, GraduationCap, Briefcase, Award, Trophy, Code, Globe
} from 'lucide-react';

const emptySection = () => ({ title: '', description: '', duration: '' });

const defaultResume = {
  name: 'Priya Sharma',
  email: 'priya@iitb.ac.in',
  phone: '+91 98765 43210',
  location: 'Mumbai, India',
  summary: 'Motivated CSE student at IIT Bombay with strong problem-solving skills and passion for full-stack development. Experienced in building real-world projects through hackathons and open-source contributions.',
  education: [{ title: 'B.Tech CSE, IIT Bombay', description: 'CGPA: 8.5/10', duration: '2022 - 2026' }],
  experience: [
    { title: 'SDE Intern, TechCorp', description: 'Built a real-time dashboard using React and Node.js. Reduced API latency by 40%.', duration: 'Summer 2025' },
  ],
  projects: [
    { title: 'Vividya AI', description: 'AI-powered career guide for Indian students using NVIDIA LLM and SARVAM voice API.', duration: '2025' },
    { title: 'E-Commerce Platform', description: 'Full-stack MERN app with payment integration and admin dashboard.', duration: '2024' },
  ],
  skills: 'React, Node.js, Python, Java, MongoDB, PostgreSQL, Git, Docker, AWS',
  certifications: [{ title: 'AWS Cloud Practitioner', description: 'Amazon Web Services', duration: '2024' }],
  hackathons: [{ title: 'Smart India Hackathon 2024', description: 'Winner - Built AI tutor for rural students', duration: '2024' }],
  languages: 'English, Hindi, Marathi',
  interests: 'Open Source, AI/ML, Web Dev, Hackathons',
};

export default function ResumePage() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [pdfDataUri, setPdfDataUri] = useState(localStorage.getItem('savedResumePdf') || null);
  const [previewTab, setPreviewTab] = useState('preview'); // 'preview' or 'pdf'

  const saveAndShowPDF = () => {
    const element = document.getElementById('resume-preview-container');
    if (!element) return;

    setGenerating(true);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const opt = {
        margin: 0.5,
        filename: `${form.name.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      window.html2pdf().from(element).set(opt).outputPdf('datauristring').then((pdfBase64) => {
        localStorage.setItem('savedResumePdf', pdfBase64);
        setPdfDataUri(pdfBase64);
        setPreviewTab('pdf');
        setGenerating(false);
      }).catch(err => {
        console.error(err);
        setGenerating(false);
      });
    };
    document.body.appendChild(script);
  };

  const downloadPDFFile = () => {
    const element = document.getElementById('resume-preview-container');
    if (!element) return;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const opt = {
        margin: 0.5,
        filename: `${form.name.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      window.html2pdf().from(element).set(opt).save();
    };
    document.body.appendChild(script);
  };

  const [form, setForm] = useState({
    name: user?.profile?.fullName || '',
    email: user?.email || '',
    phone: '',
    location: '',
    summary: '',
    education: [emptySection()],
    experience: [emptySection()],
    projects: [emptySection()],
    skills: '',
    certifications: [emptySection()],
    hackathons: [emptySection()],
    languages: '',
    interests: '',
  });

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const updateSection = (section, index, key, val) => {
    setForm(prev => {
      const arr = [...prev[section]];
      arr[index] = { ...arr[index], [key]: val };
      return { ...prev, [section]: arr };
    });
  };

  const addSectionItem = (section) => {
    setForm(prev => ({ ...prev, [section]: [...prev[section], emptySection()] }));
  };

  const removeSectionItem = (section, index) => {
    setForm(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  };

  const generateResume = async (useSample = false) => {
    setGenerating(true);
    try {
      if (useSample) {
        setResume(defaultResume);
      } else {
        const prompt = `Create a professional resume in JSON format with these fields: name, email, phone, location, summary, education[{title,description,duration}], experience[{title,description,duration}], projects[{title,description,duration}], skills, certifications[{title,description,duration}], hackathons[{title,description,duration}], languages, interests. Use this data:\n${JSON.stringify(form)}`;

        const res = await api.sendMessage({
          message: prompt,
          language: 'en',
          conversationType: 'career',
        });

        const text = res.data.aiResponse.text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setResume(JSON.parse(jsonMatch[0]));
        } else {
          setResume({ ...form, summary: text.substring(0, 500) });
        }
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const stepOrder = ['personal', 'education', 'experience', 'projects', 'extras'];

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'extras', label: 'Extras', icon: Award },
  ];

  const renderSection = (section, label) => (
    <div className="space-y-3">
      {form[section].map((item, i) => (
        <div key={i} className="p-3 rounded-xl bg-darkBg border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-sarthiMuted">{label} {i + 1}</span>
            {form[section].length > 1 && (
              <button onClick={() => removeSectionItem(section, i)} className="text-sarthiAlert hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <input
            value={item.title}
            onChange={(e) => updateSection(section, i, 'title', e.target.value)}
            placeholder="Title"
            className="w-full bg-darkSurface border border-white/10 focus:border-sarthiPurple rounded-lg px-3 py-2 text-sm text-white placeholder-sarthiMuted/60 outline-none"
          />
          <input
            value={item.description}
            onChange={(e) => updateSection(section, i, 'description', e.target.value)}
            placeholder="Description"
            className="w-full bg-darkSurface border border-white/10 focus:border-sarthiPurple rounded-lg px-3 py-2 text-sm text-white placeholder-sarthiMuted/60 outline-none"
          />
          <input
            value={item.duration}
            onChange={(e) => updateSection(section, i, 'duration', e.target.value)}
            placeholder="Duration (e.g., 2022-2026)"
            className="w-full bg-darkSurface border border-white/10 focus:border-sarthiPurple rounded-lg px-3 py-2 text-sm text-white placeholder-sarthiMuted/60 outline-none"
          />
        </div>
      ))}
      <button
        onClick={() => addSectionItem(section)}
        className="flex items-center gap-1.5 text-xs text-sarthiPurple hover:text-sarthiPink transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add {label}
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-headline font-extrabold text-2xl text-white">Resume Builder</h1>
        <p className="text-sm text-sarthiMuted mt-1">Build a professional resume with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-darkSurface p-1 rounded-xl border border-white/10">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id ? 'bg-sarthiPurple text-white' : 'text-sarthiMuted hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-darkSurface rounded-2xl border border-white/10 p-5 space-y-4">
            {activeTab === 'personal' && (
              <div className="space-y-3">
                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Full Name"
                  className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none" />
                <input value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email"
                  className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none" />
                <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone"
                  className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none" />
                <input value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Location"
                  className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none" />
                <textarea value={form.summary} onChange={(e) => updateField('summary', e.target.value)} placeholder="Professional Summary" rows={3}
                  className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none resize-none" />
                <textarea value={form.skills} onChange={(e) => updateField('skills', e.target.value)} placeholder="Skills (comma separated)" rows={2}
                  className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none resize-none" />
                <input value={form.languages} onChange={(e) => updateField('languages', e.target.value)} placeholder="Languages"
                  className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none" />
                <input value={form.interests} onChange={(e) => updateField('interests', e.target.value)} placeholder="Interests"
                  className="w-full bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-2.5 text-sm text-white placeholder-sarthiMuted/60 outline-none" />
              </div>
            )}
            {activeTab === 'education' && renderSection('education', 'Education')}
            {activeTab === 'experience' && renderSection('experience', 'Experience')}
            {activeTab === 'projects' && renderSection('projects', 'Project')}
            {activeTab === 'extras' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-sarthiGold" /> Certifications
                  </h4>
                  {renderSection('certifications', 'Certification')}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-sarthiPink" /> Hackathons
                  </h4>
                  {renderSection('hackathons', 'Hackathon')}
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex gap-3">
            {activeTab !== 'personal' ? (
              <button
                onClick={() => {
                  const currentIndex = stepOrder.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(stepOrder[currentIndex - 1]);
                }}
                className="px-6 py-3 bg-darkSurface border border-white/10 text-sarthiMuted font-medium rounded-xl hover:text-white hover:border-sarthiPurple/50 transition-all text-sm"
              >
                Previous
              </button>
            ) : (
              <button
                onClick={() => generateResume(true)}
                className="px-6 py-3 bg-darkSurface border border-white/10 text-sarthiMuted font-medium rounded-xl hover:text-white hover:border-sarthiPurple/50 transition-all text-sm"
              >
                Use Sample
              </button>
            )}

            {activeTab !== 'extras' ? (
              <button
                onClick={() => {
                  const currentIndex = stepOrder.indexOf(activeTab);
                  if (currentIndex < stepOrder.length - 1) setActiveTab(stepOrder[currentIndex + 1]);
                }}
                className="flex-1 py-3 bg-sarthiPurple hover:bg-sarthiPrimary text-white font-headline font-bold rounded-xl shadow-lg transition-all text-center text-sm"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => generateResume(false)}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-gradient text-white font-headline font-bold rounded-xl shadow-lg shadow-sarthiPrimary/30 hover:shadow-sarthiPrimary/60 transition-all disabled:opacity-50 text-sm"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate your resume with AI
              </button>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col min-h-[600px]">
          {resume ? (
            <div className="bg-darkSurface rounded-2xl border border-white/10 p-5 space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewTab === 'preview' ? 'bg-sarthiPurple text-white' : 'text-sarthiMuted hover:text-white'
                    }`}
                  >
                    Draft Template
                  </button>
                  <button
                    onClick={() => {
                      if (!pdfDataUri) {
                        saveAndShowPDF();
                      } else {
                        setPreviewTab('pdf');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewTab === 'pdf' ? 'bg-sarthiPurple text-white' : 'text-sarthiMuted hover:text-white'
                    }`}
                  >
                    Stored PDF View
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveAndShowPDF}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sarthiPurple/20 text-sarthiPurple hover:bg-sarthiPurple/30 transition-colors text-[11px] font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Save & View PDF
                  </button>
                  <button
                    onClick={downloadPDFFile}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sarthiGold/20 text-sarthiGold hover:bg-sarthiGold/30 transition-colors text-[11px] font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>

              {previewTab === 'preview' ? (
                <div id="resume-preview-container" className="bg-white rounded-xl p-8 text-gray-800 flex-1 shadow-inner overflow-y-auto max-h-[650px]">
                  <div className="text-center border-b-2 border-gray-200 pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{resume.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{resume.email} | {resume.phone} | {resume.location}</p>
                  </div>

                  {resume.summary && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Summary</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{resume.summary}</p>
                    </div>
                  )}

                  {resume.education?.length > 0 && resume.education[0]?.title && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Education</h3>
                      {resume.education.map((e, i) => (
                        <div key={i} className="mb-2">
                          <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                          <p className="text-xs text-gray-600">{e.description} | {e.duration}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.experience?.length > 0 && resume.experience[0]?.title && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Experience</h3>
                      {resume.experience.map((e, i) => (
                        <div key={i} className="mb-2">
                          <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                          <p className="text-xs text-gray-600">{e.duration}</p>
                          <p className="text-xs text-gray-700 mt-1">{e.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.projects?.length > 0 && resume.projects[0]?.title && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Projects</h3>
                      {resume.projects.map((p, i) => (
                        <div key={i} className="mb-2">
                          <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                          <p className="text-xs text-gray-700 mt-1">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.skills && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Skills</h3>
                      <p className="text-sm text-gray-700">{resume.skills}</p>
                    </div>
                  )}

                  {resume.certifications?.length > 0 && resume.certifications[0]?.title && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Certifications</h3>
                      {resume.certifications.map((c, i) => (
                        <p key={i} className="text-sm text-gray-700">{c.title} - {c.description}</p>
                      ))}
                    </div>
                  )}

                  {resume.hackathons?.length > 0 && resume.hackathons[0]?.title && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Hackathons</h3>
                      {resume.hackathons.map((h, i) => (
                        <p key={i} className="text-sm text-gray-700">{h.title} - {h.description}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 min-h-[500px] bg-white rounded-xl overflow-hidden">
                  {pdfDataUri ? (
                    <iframe
                      src={pdfDataUri}
                      title="Stored Resume PDF"
                      className="w-full h-full min-h-[600px] border-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-sarthiMuted py-20 bg-darkSurface/50">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-sarthiPurple" />
                      <p>Generating PDF document view...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-darkSurface rounded-2xl border border-white/10 p-5 flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <FileText className="w-16 h-16 mb-4 opacity-30 text-sarthiMuted" />
              <p className="text-lg font-semibold text-gray-500">Resume Preview</p>
              <p className="text-sm mt-2 text-sarthiMuted">Fill in your details and click "Generate your resume with AI" on the Extras step!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
