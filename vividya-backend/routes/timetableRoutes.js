import { Router } from 'express';
import {
  createTask, getTasks, completeTask, deleteTask,
  generateStudyPlan, getCurrentPlan, logPomodoro, autoAdjustPlan
} from '../controllers/timetableController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../utils/validateRequest.js';
import { body } from 'express-validator';

const router = Router();
router.use(authenticateToken);

router.post('/tasks', [
  body('title').trim().notEmpty().withMessage('Task title required'),
  body('subject').trim().notEmpty().withMessage('Subject required'),
  body('estimatedTime').isNumeric({ min: 1 }).withMessage('Estimated time required'),
  body('priority').optional().isInt({ min: 1, max: 5 }),
], validateRequest, createTask);
router.get('/tasks', getTasks);
router.put('/tasks/:taskId/complete', completeTask);
router.delete('/tasks/:taskId', deleteTask);
router.post('/generate', [
  body('duration').optional().isIn(['daily', 'weekly']),
], validateRequest, generateStudyPlan);
router.get('/plan', getCurrentPlan);
router.post('/pomodoro', [
  body('taskId').notEmpty().withMessage('taskId required'),
  body('minutes').optional().isNumeric({ min: 1 }),
], validateRequest, logPomodoro);
router.post('/auto-adjust', autoAdjustPlan);

export default router;
