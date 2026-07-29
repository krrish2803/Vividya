export const PLANS = {
  free: {
    name: 'free',
    chatMessagesLimit: 500,
    noteSummariesLimit: 10,
    voiceMinutesLimit: 30,
  },
  pro: {
    name: 'pro',
    chatMessagesLimit: 5000,
    noteSummariesLimit: 100,
    voiceMinutesLimit: 300,
  },
  elite: {
    name: 'elite',
    chatMessagesLimit: -1,
    noteSummariesLimit: -1,
    voiceMinutesLimit: -1,
  },
};

export const CONVERSATION_TYPES = ['tutor', 'career', 'wellness'];
export const SUPPORTED_LANGUAGES = ['en', 'hi', 'hi-en', 'ta', 'te', 'mr', 'bn', 'gu', 'kn', 'ml', 'or', 'pa', 'ur'];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_NOTE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export const MOOD_VALUES = { MIN: 1, MAX: 5 };
