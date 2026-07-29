import 'dotenv/config';
import mongoose from 'mongoose';
import * as nvidiaService from '../services/nvidiaService.js';

const sampleForm = {
  name: 'Krrish Yaduka',
  email: 'krrish@vividya.ai',
  phone: '+91 99999 88888',
  location: 'Kolkata, India',
  summary: 'Passionate software developer interested in AI tutoring tools and full-stack engineering.',
  education: [{ title: 'B.Tech CSE', description: 'GPA: 9.0/10', duration: '2022 - 2026' }],
  experience: [{ title: 'Frontend Developer Intern', description: 'Designed interactive web dashboards.', duration: '3 months' }],
  projects: [{ title: 'Vividya Resume Builder', description: 'Implemented step-by-step resume stepper with PDF storage.', duration: '2026' }],
  skills: 'React, Node.js, Express, MongoDB, JavaScript, TailwindCSS',
  certifications: [{ title: 'NVIDIA AI Developer Certification', description: 'NVIDIA', duration: '2025' }],
  hackathons: [{ title: 'Vividya Hackathon', description: '1st Place Winner', duration: '2026' }],
  languages: 'English, Hindi',
  interests: 'AI Engineering, Coding, System Design',
};

async function testResumeGeneration() {
  console.log('Testing Resume JSON Generation using NVIDIA LLM...');
  const prompt = `Create a professional resume in JSON format with these fields: name, email, phone, location, summary, education[{title,description,duration}], experience[{title,description,duration}], projects[{title,description,duration}], skills, certifications[{title,description,duration}], hackathons[{title,description,duration}], languages, interests. Use this data:\n${JSON.stringify(sampleForm)}`;

  try {
    const aiResponseText = await nvidiaService.generateTutorResponse(prompt, '', 'en');
    console.log('AI Response Text received:', aiResponseText);

    const aiText = aiResponseText.text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResume = JSON.parse(jsonMatch[0]);
      console.log('\n--- Successfully Parsed Resume JSON ---');
      console.log('Name:', parsedResume.name);
      console.log('Summary:', parsedResume.summary);
      console.log('Skills:', parsedResume.skills);
      console.log('Education count:', parsedResume.education?.length);
      console.log('Projects count:', parsedResume.projects?.length);
      console.log('Test Passed!');
    } else {
      console.error('No JSON block found in AI response text.');
    }
  } catch (err) {
    console.error('Resume Generation Test Failed:', err);
  }
}

testResumeGeneration();
