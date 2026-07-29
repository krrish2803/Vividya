import * as ragService from '../services/ragService.js';
import * as hybridAIRouter from '../services/hybridAIRouter.js';
import User from '../models/User.js';
import UploadedNote from '../models/UploadedNote.js';
import { BadRequestError } from '../utils/error-handler.js';

export const indexNote = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    if (!noteId) throw new BadRequestError('noteId required');
    const note = await UploadedNote.findOne({ _id: noteId, userId: req.user.sub });
    if (!note) throw new BadRequestError('Note not found');
    const result = await ragService.indexUploadedNote(req.user.sub, note.fileData, note.mimeType, note.filename);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const queryRAG = async (req, res, next) => {
  try {
    const { query, language } = req.body;
    if (!query) throw new BadRequestError('query required');
    const result = await ragService.queryWithRAG(req.user.sub, query, language || 'en');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getIndexedDocs = async (req, res, next) => {
  try {
    const docs = await ragService.getIndexedDocs(req.user.sub);
    res.json({ success: true, docs });
  } catch (err) { next(err); }
};

export const chatHybrid = async (req, res, next) => {
  try {
    const { message, context, language } = req.body;
    if (!message) throw new BadRequestError('message required');
    const user = await User.findById(req.user.sub);
    const preference = user?.hybrid?.preferredModel || 'auto';
    const result = await hybridAIRouter.queryHybridAI(message, context, language || 'en', req.user.sub, preference);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const chatWithRAG = async (req, res, next) => {
  try {
    const { message, language } = req.body;
    if (!message) throw new BadRequestError('message required');

    // Retrieve relevant context from Qdrant
    const { context, sources, topScore } = await ragService.retrieveContext(req.user.sub, message);

    // Use hybrid router with classification, passing RAG context
    const user = await User.findById(req.user.sub);
    const preference = user?.hybrid?.preferredModel || 'auto';
    const result = await hybridAIRouter.queryHybridAI(message, context, language || 'en', req.user.sub, preference);

    // Attach source info
    res.json({
      success: true,
      ...result,
      sources,
      usingRAG: context.length > 0,
      topScore,
    });
  } catch (err) { next(err); }
};

export const getModelUsage = async (req, res, next) => {
  try {
    const stats = await hybridAIRouter.getModelUsageStats(req.user.sub);
    res.json({ success: true, stats });
  } catch (err) { next(err); }
};
