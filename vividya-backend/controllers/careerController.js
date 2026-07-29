import * as careerService from '../services/careerService.js';
import { BadRequestError } from '../utils/error-handler.js';
import UploadedNote from '../models/UploadedNote.js';
import ResumeAnalysisHistory from '../models/ResumeAnalysisHistory.js';

export const analyzeResume = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    if (!noteId) throw new BadRequestError('noteId required');
    const note = await UploadedNote.findOne({ _id: noteId, userId: req.user.sub });
    if (!note) throw new BadRequestError('Note not found');
    const parsedData = await careerService.parseResumeFromBuffer(note.fileData, note.mimeType);
    const analysis = await careerService.analyzeCareerFit(req.user.sub, parsedData);
    const profile = await careerService.createOrUpdateCareerProfile(req.user.sub, {
      parsedResumeData: parsedData, analysis, resumeFileRef: note._id,
    });
    
    // Save to history
    await ResumeAnalysisHistory.create({
      userId: req.user.sub,
      fileName: note.title || note.filename || 'Uploaded Resume',
      parsedResumeData: parsedData,
      analysis,
    });

    res.json({ success: true, profile });
  } catch (err) { next(err); }
};

export const getCareerProfile = async (req, res, next) => {
  try {
    const profile = await careerService.getCareerProfile(req.user.sub);
    res.json({ success: true, profile });
  } catch (err) { next(err); }
};

export const getRoleMatches = async (req, res, next) => {
  try {
    const profile = await careerService.getCareerProfile(req.user.sub);
    if (!profile || !profile.analysis) throw new BadRequestError('Upload resume first');
    res.json({
      success: true,
      roles: profile.analysis.topRoles,
      skillGaps: profile.analysis.skillGaps,
      userSkills: profile.analysis.userSkills || [],
    });
  } catch (err) { next(err); }
};

export const generateRoadmap = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole) throw new BadRequestError('targetRole required');
    const profile = await careerService.getCareerProfile(req.user.sub);
    const parsedData = profile?.parsedResumeData || {};
    const roadmap = await careerService.generateRoadmap(req.user.sub, targetRole, parsedData);
    res.json({ success: true, roadmap, targetRole });
  } catch (err) { next(err); }
};

export const generateMockInterview = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole) throw new BadRequestError('targetRole required');
    const mockInterview = await careerService.generateMockInterview(req.user.sub, targetRole);
    res.json({ success: true, ...mockInterview, targetRole });
  } catch (err) { next(err); }
};

export const evaluateAnswer = async (req, res, next) => {
  try {
    const { targetRole, question, answer } = req.body;
    if (!targetRole || !question || !answer) {
      throw new BadRequestError('targetRole, question, and answer required');
    }
    const evaluation = await careerService.evaluateAnswer(req.user.sub, targetRole, question, answer);
    res.json({ success: true, evaluation });
  } catch (err) { next(err); }
};

export const getResumeHistory = async (req, res, next) => {
  try {
    const history = await ResumeAnalysisHistory.find({ userId: req.user.sub }).sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (err) { next(err); }
};
