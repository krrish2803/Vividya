import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();

// Set Slide Size to Widescreen (16:9)
pptx.layout = 'LAYOUT_16x9';

// Common Slide Styling Constants
const BG_COLOR = '121214';       // Deep dark background
const TEXT_COLOR = 'F3F4F6';     // Light gray body text
const GOLD_COLOR = 'FBBF24';     // Gold headings
const PURPLE_COLOR = '8B5CF6';   // Purple accent

// Helper to configure background and slide template
function createSlide(title) {
  const slide = pptx.addSlide();
  // Set slide background color
  slide.background = { fill: BG_COLOR };
  
  // Header bar text
  slide.addText(title, {
    x: 0.6,
    y: 0.4,
    w: 12.0,
    h: 1.0,
    fontSize: 28,
    fontFace: 'Arial',
    color: GOLD_COLOR,
    bold: true,
  });

  // Small footer text
  slide.addText('Vividya (विविद्या) — AI Life & Career Navigator', {
    x: 0.6,
    y: 7.0,
    w: 6.0,
    h: 0.4,
    fontSize: 10,
    color: '6B7280',
  });

  return slide;
}

// ────────────────────────────────────────────────────────
// SLIDE 1: Title Slide (Cover Slide)
// ────────────────────────────────────────────────────────
const s1 = pptx.addSlide();
s1.background = { fill: BG_COLOR };

// Add AI Graphic on the right half
s1.addImage({
  path: 'scratch/vividya_cover.jpg',
  x: 6.2,
  y: 1.3,
  w: 6.0,
  h: 4.5
});

// Title & Subtitle on the left half
s1.addText('Vividya (विविद्या)', {
  x: 0.6,
  y: 2.0,
  w: 5.2,
  h: 1.0,
  fontSize: 44,
  fontFace: 'Arial',
  color: GOLD_COLOR,
  bold: true,
});

s1.addText('AI Life & Career Navigator\nfor Indian Students', {
  x: 0.6,
  y: 3.1,
  w: 5.2,
  h: 1.2,
  fontSize: 22,
  fontFace: 'Arial',
  color: PURPLE_COLOR,
  italic: true,
});

s1.addText('Pitch & Presentation Deck', {
  x: 0.6,
  y: 4.8,
  w: 5.2,
  h: 0.4,
  fontSize: 14,
  color: TEXT_COLOR,
});

// ────────────────────────────────────────────────────────
// SLIDE 2: The Vision & Objective
// ────────────────────────────────────────────────────────
const s2 = createSlide('The Vision & Objective');
s2.addText([
  { text: '• Demystify the path to placements for engineering and college students across tier-2/3 cities.\n', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
  { text: '• Deliver a localized, voice-first AI companion speaking Hinglish, Hindi, and Marathi.\n', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
  { text: '• Bridge high-stress academic preparation with career guides and interactive mock interviews.\n', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
  { text: '• Automate planning, resume building, and evaluation under a single unified student dashboard.', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 3: The Problem Statement (Indian College Challenges)
// ────────────────────────────────────────────────────────
const s3 = createSlide('The Placement & Academic Struggle');
s3.addText([
  { text: '1. Disorganized Calendars: Generic schedulers cannot parse study hours, breaks, or specific topics from dynamic student conversations.\n\n', options: { fontSize: 15, color: TEXT_COLOR, bold: true } },
  { text: '2. Clunky Resume Formats: Static formats are overwhelming, lack modular sections, and fail to provide quick ATS reviews.\n\n', options: { fontSize: 15, color: TEXT_COLOR, bold: true } },
  { text: '3. Technical Interview Fear: Static DSA questions are easily accessible, but students cannot write explanations and get graded with critical reviews.\n\n', options: { fontSize: 15, color: TEXT_COLOR, bold: true } },
  { text: '4. Placement Anxiety: High pressure leads to severe mental stress; students have no tools to log logs or access coping tools.', options: { fontSize: 15, color: TEXT_COLOR, bold: true } }
], { x: 0.8, y: 1.6, w: 11.0, h: 5.0 });

// ────────────────────────────────────────────────────────
// SLIDE 4: The Innovation Overview
// ────────────────────────────────────────────────────────
const s4 = createSlide('Our Innovation: The Connected Ecosystem');
s4.addText([
  { text: '• Seamless Connection: Integrating natural tutor chat with calendar schedulers, resume audits, and mock interview rooms.\n', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
  { text: '• Real-time Syllabuses: AI reads the student’s learning topic and dynamically compiles a multi-day focus syllabus.\n', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
  { text: '• Regional Support: Multilingual translation enables complex voice learning in code-mixed languages like Hinglish.\n', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
  { text: '• Zero Overhead: Complex features (like PDF rendering and local cache logs) are computed directly client-side.', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 5: Technical Stack (Implementation)
// ────────────────────────────────────────────────────────
const s5 = createSlide('Technical Architecture');
s5.addText([
  { text: '• Frontend: Single Page Application built on React (Vite environment) styled with custom glassmorphism components.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Backend: High-performance Express.js server connected with Mongoose ODM.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Vector Storage: Qdrant client to store and scroll note chunk embeddings for Retrieval-Augmented Generation.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Databases: MongoDB Atlas storing users, study plans, mock sessions, and parsed resume history records.', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } }
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 6: Advanced AI Usage (NVIDIA & Sarvam)
// ────────────────────────────────────────────────────────
const s6 = createSlide('Advanced AI Integration');
s6.addText([
  { text: '• NVIDIA NIM Inference: Invokes Meta Llama 3.1 8B Instruct model for tutor chat, syllabus creation, and code answers reviews.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Sarvam AI Speech: Integrated with Saaras STT for voice capture and Bulbul TTS for audio feedback.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Embedding Generation: Meta Llama structured embeddings enable lightning-fast content search inside user uploaded notes.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• AI Scoring Engine: Custom grading prompts evaluate mock responses to check logic, correctness, and speed.', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } }
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 7: Multilingual Tutor Chat
// ────────────────────────────────────────────────────────
const s7 = createSlide('Feature: Multilingual Voice Tutor');
s7.addText([
  { text: '• Conversational Learning: Text and audio-driven interactions designed for interactive student questions.\n', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
  { text: '• Language Auto-detection: Supports code-mixed input, translating technical terms correctly in Hindi/Hinglish.\n', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
  { text: '• Note Integration: RAG context allows students to query notes, creating a personalized academic copilot.', options: { fontSize: 16, color: TEXT_COLOR, bullet: true } },
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 8: Topic-Based Timetable Generator
// ────────────────────────────────────────────────────────
const s8 = createSlide('Feature: Topic-Based Study Scheduler');
s8.addText([
  { text: '• Automated Syllabus: Converts custom study topics (e.g. Backpropagation) into sequential lesson topics.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Focus Allocation: Automatically configures session categories (Deep Study, Light Review, Coding).\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Timetable Calendar: Generates complete study plans containing smart rest slots and resource suggestions.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Seamless Navigation: Redirects users from chat screens directly into their active interactive calendar grid.', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } }
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 9: Stepper Resume Builder
// ────────────────────────────────────────────────────────
const s9 = createSlide('Feature: Stepper Resume Builder');
s9.addText([
  { text: '• Multi-Step Form: Refactored wizard form (Personal ➡️ Education ➡️ Experience ➡️ Projects ➡️ Extras).\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Client-Side Compilation: Loads html2pdf.js dynamically to compile templates into high-fidelity vector PDF files.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Local Storage Caching: Saves the generated PDF as a Base64 string locally to prevent data loss on reloads.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Integrated Previewer: Offers toggling views between standard HTML drafts and compiled PDF iframe viewers.', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } }
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 10: Mock Interview room
// ────────────────────────────────────────────────────────
const s10 = createSlide('Feature: Interactive Mock Interviewer');
s10.addText([
  { text: '• Customized Questions: Role-based questionnaire (Software Engineer, Data Analyst) across difficulty levels.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Detailed Input: Interactive answer sheets let students write full explanations and conceptual descriptions.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Live AI Grading: Evaluates answer logic, context, and code structure, returning scores out of 10.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Resume History: Saves and scrolls past resume parses so students can track historical progress logs.', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } }
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 11: Deployment & Scalability
// ────────────────────────────────────────────────────────
const s11 = createSlide('Deployment, Feasibility & Scalability');
s11.addText([
  { text: '• Render Infrastructure: Backend deployed on Render using blueprint configs (render.yaml) for auto-deployment.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Netlify Infrastructure: Frontend deployed on Netlify using SPA redirection hooks (netlify.toml) to prevent route refreshes.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• DB Scalability: Atlas cluster and Qdrant collections handle simultaneous note indexing efficiently.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• User Security: Cookies-based JWT token management secures user private profile data logs.', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } }
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// ────────────────────────────────────────────────────────
// SLIDE 12: Summary & Outro
// ────────────────────────────────────────────────────────
const s12 = createSlide('Summary & Impact');
s12.addText([
  { text: '• Demystifies placement training for students across campuses in their own native languages.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Drives productivity by matching academic schedulers with DSA mock evaluations.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Delivers high innovation, robust technical implementation, and state-of-the-art AI integration.\n', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } },
  { text: '• Live App Links: Frontend (netlify.app) and Backend (onrender.com) are fully online and verified!', options: { fontSize: 15, color: TEXT_COLOR, bullet: true } }
], { x: 0.8, y: 1.8, w: 11.0, h: 4.5 });

// Save presentation to file
pptx.writeFile({ fileName: 'Vividya_AI_Presentation.pptx' })
  .then(fileName => {
    console.log(`Presentation generated successfully: ${fileName}`);
  })
  .catch(err => {
    console.error('Error writing PPTX:', err);
  });
