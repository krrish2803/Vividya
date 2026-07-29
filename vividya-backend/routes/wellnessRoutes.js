import { Router } from 'express';
import {
  moodCheckIn, getWellnessHistory, getWellnessInsights, respondToIntervention,
  getTodayCheckInStatus, getDailyNudge, getMoodChartData
} from '../controllers/wellnessController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateMoodCheckIn } from '../utils/validators.js';
import { validateRequest } from '../utils/validateRequest.js';

const router = Router();
router.use(authenticateToken);

router.post('/mood', validateMoodCheckIn, validateRequest, moodCheckIn);
router.get('/history', getWellnessHistory);
router.get('/insights', getWellnessInsights);
router.post('/intervention/respond', respondToIntervention);
router.get('/today-status', getTodayCheckInStatus);
router.get('/daily-nudge', getDailyNudge);
router.get('/chart-data', getMoodChartData);

export default router;
