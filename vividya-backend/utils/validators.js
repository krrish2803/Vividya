import { body, query, param } from 'express-validator';

export const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('branch').optional().trim().isLength({ max: 50 }),
  body('year').optional().isInt({ min: 1, max: 8 }),
  body('college').optional().trim().isLength({ max: 200 }),
  body('preferredLanguage').optional().isIn(['en', 'hi', 'hi-en', 'mr']),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const chatMessageValidation = [
  body('message').trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be 1-5000 characters'),
  body('language').optional().isIn(['en', 'hi', 'hi-en', 'mr']),
  body('conversationType').optional().isIn(['tutor', 'career', 'wellness']),
];

export const moodCheckValidation = [
  body('mood').isInt({ min: 1, max: 5 }).withMessage('Mood must be between 1 and 5'),
  body('note').optional().trim().isLength({ max: 500 }),
];

export const validateMoodCheckIn = [
  body('mood').isInt({ min: 1, max: 5 }).withMessage('Mood must be between 1 and 5'),
  body('stressLevel').optional().isInt({ min: 1, max: 5 }),
  body('energyLevel').optional().isInt({ min: 1, max: 5 }),
  body('note').optional().trim().isLength({ max: 500 }),
];

export const profileUpdateValidation = [
  body('profile.fullName').optional().trim().isLength({ min: 2, max: 100 }),
  body('profile.interests').optional().isArray(),
  body('profile.goals').optional().isArray(),
  body('profile.preferredLanguage').optional().isIn(['en', 'hi', 'hi-en', 'mr']),
];
