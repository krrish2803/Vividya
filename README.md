# Vividya (विविद्या) — AI Life & Career Guide for Indian Students

Vividya is an AI-powered career assistant and life tutor tailored for Indian college students. It integrates advanced LLM technologies and voice capabilities to assist with academic planning, resume building, placement mock interviews, and personalized career roadmaps.

---

## 📌 Problem Statement
Many college students in India face major challenges in career planning:
- **Lack of DSA/Development roadmap planning**: Generic roadmaps do not target specific skill gaps in their resumes.
- **Generic resume formats**: Hard-to-use resume tools without ATS feedback or automated structure.
- **Generic Study Timetables**: Schedulers do not customize slots to student preferences or DSA lesson breakdowns.
- **Stressful interview prep**: Lack of mock interviews where users can submit code/answers and get graded out of 10 with detailed recommendations.

---

## 💡 What the Project Does
Vividya addresses these challenges through three main portals:
1. **Interactive AI Tutor Chat**: Voice and text interface (English, Hindi, Hinglish, Marathi) supported by Sarvam AI TTS/STT and NVIDIA Meta Llama. Automatically generates daily/weekly study planner slots parsed from the chat context.
2. **Step-by-Step Resume Builder**: A multi-step stepper wizard that uses AI to construct dynamic resume JSON profiles and compile them into persistent PDF documents with instant downloads.
3. **Career Advisor & Mock Interviewer**: Offers resume ATS analysis, career fit scoring, target DSA roadmaps, and mock interview rooms where students can write answers to DSA or technical questions and get graded (scored out of 10) by AI with detailed reviews.

---

## 🛠️ Tech Stack & Key Dependencies

### Frontend
- **Framework**: React.js with Vite
- **Styling**: TailwindCSS & Lucide icons
- **Libraries**: `html2pdf.js` (loaded dynamically for client-side vector PDF generation), `lucide-react`, `react-router-dom`

### Backend
- **Framework**: Node.js & Express.js
- **Database**: MongoDB (Mongoose ODM)
- **AI Services**: 
  - **NVIDIA NIM (Meta Llama 3.1 8B Instruct)**: Used for tutor chat, resume analysis, study planner curriculum generation, and answer evaluations.
  - **Sarvam AI APIs**: Used for Bulbul TTS voice synthesis and Saaras STT voice transcription.
- **Libraries**: `pdf-parse` (for parsing uploaded resume text), `mongoose`, `jsonwebtoken`, `cors`, `dotenv`

---

## 🔑 Test Credentials
For local testing, log in with the following preset demo account:
- **Email**: `demo@vividya.ai`
- **Password**: `Demo@12345`

---

## 🚀 How to Run the Project Locally

### Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### 1. Backend Setup
1. Open the backend folder:
   ```bash
   cd vividya-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file (see `.env.example`):
   ```env
   MONGODB_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_signing_key
   NVIDIA_API_KEY=your_nvidia_nim_api_key
   SARVAM_API_KEY=your_sarvam_ai_api_key
   PORT=3000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open the frontend root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:3001`!
