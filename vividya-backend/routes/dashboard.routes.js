import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/stats', authenticateToken, dashboardController.getStats);
router.get('/daily-greeting', authenticateToken, dashboardController.getDailyGreeting);
router.get('/health-score', authenticateToken, dashboardController.getHealthScore);
router.get('/activity-feed', authenticateToken, dashboardController.getActivityFeed);

export default router;
