import { Router } from 'express';
import { analyzeResume, getCareerProfile, getRoleMatches, generateRoadmap, generateMockInterview, evaluateAnswer, getResumeHistory } from '../controllers/careerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../utils/validateRequest.js';
import { body } from 'express-validator';

const router = Router();
router.use(authenticateToken);

router.post('/analyze-resume', [
  body('noteId').isMongoId().withMessage('Valid noteId required'),
], validateRequest, analyzeResume);

router.get('/profile', getCareerProfile);
router.get('/role-matches', getRoleMatches);
router.get('/resume-history', getResumeHistory);

router.post('/roadmap', [
  body('targetRole').trim().notEmpty().withMessage('targetRole required'),
], validateRequest, generateRoadmap);

router.post('/mock-interview', [
  body('targetRole').trim().notEmpty().withMessage('targetRole required'),
], validateRequest, generateMockInterview);

router.post('/evaluate-answer', [
  body('targetRole').trim().notEmpty().withMessage('targetRole required'),
  body('question').trim().notEmpty().withMessage('question required'),
  body('answer').trim().notEmpty().withMessage('answer required'),
], validateRequest, evaluateAnswer);

export default router;
