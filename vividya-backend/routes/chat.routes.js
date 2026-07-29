import { Router } from 'express';
import multer from 'multer';
import * as chatController from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { chatLimiter } from '../middleware/rateLimitMiddleware.js';
import { chatMessageValidation } from '../utils/validators.js';
import { validateRequest } from '../utils/validateRequest.js';

const router = Router();
const voiceUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/message', authenticateToken, chatLimiter, chatMessageValidation, validateRequest, chatController.sendTextMessage);
router.post('/voice', authenticateToken, chatLimiter, voiceUpload.single('audioFile'), chatController.sendVoiceMessage);
router.get('/voice/:conversationId/:messageId', authenticateToken, chatController.getVoiceAudio);
router.get('/history', authenticateToken, chatController.getChatHistory);
router.post('/translate', authenticateToken, chatController.translateText);

export default router;
