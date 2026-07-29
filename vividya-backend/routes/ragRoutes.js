import { Router } from 'express';
import { indexNote, queryRAG, getIndexedDocs, chatHybrid, chatWithRAG, getModelUsage } from '../controllers/ragController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../utils/validateRequest.js';
import { body } from 'express-validator';

const router = Router();
router.use(authenticateToken);

router.post('/index', [
  body('noteId').isMongoId().withMessage('Valid noteId required'),
], validateRequest, indexNote);
router.post('/query', [
  body('query').trim().notEmpty().withMessage('Query required'),
], validateRequest, queryRAG);
router.get('/docs', getIndexedDocs);
router.post('/chat-hybrid', [
  body('message').trim().notEmpty().withMessage('Message required'),
], validateRequest, chatHybrid);
router.post('/chat-with-rag', [
  body('message').trim().notEmpty().withMessage('Message required'),
], validateRequest, chatWithRAG);
router.get('/usage', getModelUsage);

export default router;
