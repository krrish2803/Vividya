import multer from 'multer';
import { extractText } from '../services/noteService.js';
import * as nvidiaService from '../services/nvidiaService.js';
import * as userService from '../services/userService.js';
import UploadedNote from '../models/UploadedNote.js';
import DailyLog from '../models/DailyLog.js';
import { BadRequestError, NotFoundError } from '../utils/error-handler.js';
import { MAX_FILE_SIZE, ALLOWED_NOTE_TYPES } from '../config/constants.js';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_NOTE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Invalid file type. Allowed: PDF, JPEG, PNG, WebP'));
    }
  },
});

export const uploadNote = async (req, res, next) => {
  try {
    if (!req.file) throw new BadRequestError('File required');

    const { subject, chapter, branch } = req.body;

    // Check usage limits
    await userService.incrementNoteUsage(req.user.sub);

    // Determine file type
    let fileType;
    if (req.file.mimetype === 'application/pdf') fileType = 'pdf';
    else fileType = 'image';

    // Extract text from file
    const extractedText = await extractText(req.file.buffer, fileType);
    if (!extractedText || extractedText.trim().length < 10) {
      throw new BadRequestError('Could not extract sufficient text from file');
    }

    // Generate summary and key points with NVIDIA
    const analysis = await nvidiaService.summarizeNotes(extractedText, subject);

    // Generate quiz
    const quiz = await nvidiaService.generateQuiz(
      analysis.summary,
      analysis.keyPoints,
      analysis.difficulty
    );

    // Save to MongoDB with file data
    const note = await UploadedNote.create({
      userId: req.user.sub,
      filename: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      fileData: req.file.buffer,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      analysis: {
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        quizGenerated: quiz,
        topicsDetected: [subject || 'General'],
        estimatedReadTime: Math.ceil(extractedText.split(/\s+/).length / 200),
      },
      metadata: {
        branch,
        subject,
        chapter: chapter ? parseInt(chapter) : undefined,
      },
    });

    // Update daily log
    await DailyLog.findOneAndUpdate(
      { userId: req.user.sub, date: new Date().toISOString().split('T')[0] },
      { $inc: { 'activities.notesUploaded': 1 } },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      data: {
        noteId: note._id,
        filename: note.filename,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        quiz,
        estimatedReadTime: note.analysis.estimatedReadTime,
        uploadedAt: note.uploadedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getNote = async (req, res, next) => {
  try {
    const note = await UploadedNote.findOne({ _id: req.params.noteId, userId: req.user.sub })
      .select('-fileData'); // exclude binary data from response
    if (!note) throw new NotFoundError('Note not found');

    note.accessedAt = new Date();
    await note.save();

    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const getNoteFile = async (req, res, next) => {
  try {
    const note = await UploadedNote.findOne({ _id: req.params.noteId, userId: req.user.sub });
    if (!note || !note.fileData) throw new NotFoundError('File not found');

    res.set({
      'Content-Type': note.mimeType,
      'Content-Disposition': `inline; filename="${note.filename}"`,
    });
    res.send(note.fileData);
  } catch (error) {
    next(error);
  }
};

export const listNotes = async (req, res, next) => {
  try {
    const { subject, limit = 10, skip = 0 } = req.query;
    const query = { userId: req.user.sub };
    if (subject) query['metadata.subject'] = subject;

    const notes = await UploadedNote.find(query)
      .select('-fileData') // exclude binary data
      .sort({ uploadedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const total = await UploadedNote.countDocuments(query);

    res.json({ success: true, data: { notes, total } });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await UploadedNote.findOneAndDelete({ _id: req.params.noteId, userId: req.user.sub });
    if (!note) throw new NotFoundError('Note not found');

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};
