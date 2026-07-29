import { Router } from 'express';
import * as noteController from '../controllers/noteController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.post('/upload', authenticateToken, uploadLimiter, noteController.upload.single('file'), noteController.uploadNote);
router.get('/', authenticateToken, noteController.listNotes);
router.get('/:noteId', authenticateToken, noteController.getNote);
router.get('/:noteId/file', authenticateToken, noteController.getNoteFile);
router.delete('/:noteId', authenticateToken, noteController.deleteNote);

export default router;
