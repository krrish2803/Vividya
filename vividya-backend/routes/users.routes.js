import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { profileUpdateValidation, moodCheckValidation } from '../utils/validators.js';
import { validateRequest } from '../utils/validateRequest.js';

const router = Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, profileUpdateValidation, validateRequest, userController.updateProfile);
router.post('/mood-check', authenticateToken, moodCheckValidation, validateRequest, userController.moodCheck);

export default router;
