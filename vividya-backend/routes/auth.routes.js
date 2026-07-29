import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { signupValidation, loginValidation } from '../utils/validators.js';
import { validateRequest } from '../utils/validateRequest.js';

const router = Router();

router.post('/signup', authLimiter, signupValidation, validateRequest, authController.signup);
router.post('/login', authLimiter, loginValidation, validateRequest, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);

export default router;
