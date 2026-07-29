import * as conversationService from '../services/conversationService.js';
import * as nvidiaService from '../services/nvidiaService.js';
import * as sarvamService from '../services/sarvamService.js';
import * as userService from '../services/userService.js';
import DailyLog from '../models/DailyLog.js';
import { BadRequestError } from '../utils/error-handler.js';

export const sendTextMessage = async (req, res, next) => {
  try {
    const { message, language = 'en', conversationType = 'tutor', imageUrl, conversationId } = req.body;

    // Check usage limits
    await userService.incrementChatUsage(req.user.sub);

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await conversationService.findConversationById(conversationId);
    }
    if (!conversation) {
      conversation = await conversationService.createConversation(
        req.user.sub,
        conversationType,
        { userBranch: req.user.branch, userYear: req.user.year }
      );
    }

    // Add user message
    await conversationService.addMessage(conversation._id, {
      sender: 'user',
      messageType: imageUrl ? 'image' : 'text',
      content: message,
      language,
      timestamp: new Date(),
    });

    // Generate AI response
    const recentMessages = await conversationService.getRecentMessages(conversation._id, 5);
    const context = recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n');

    const aiResult = await nvidiaService.generateTutorResponse(message, context, language);

    // Add AI response
    await conversationService.addMessage(conversation._id, {
      sender: 'ai',
      messageType: 'text',
      content: aiResult.text,
      language,
      aiResponse: {
        text: aiResult.text,
        confidence: aiResult.confidence,
        modelUsed: aiResult.modelUsed,
        generatedAt: new Date(),
      },
      timestamp: new Date(),
    });

    // Update daily log
    await DailyLog.findOneAndUpdate(
      { userId: req.user.sub, date: new Date().toISOString().split('T')[0] },
      { $inc: { 'activities.messagesCount': 1 } },
      { upsert: true }
    );

    res.json({
      success: true,
      data: {
        messageId: Date.now().toString(),
        conversationId: conversation._id,
        userMessage: message,
        aiResponse: {
          text: aiResult.text,
          confidence: aiResult.confidence,
        },
        language,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendVoiceMessage = async (req, res, next) => {
  try {
    const { language = 'en', conversationType = 'tutor', conversationId } = req.body;

    if (!req.file) throw new BadRequestError('Audio file required');

    // Check usage limits
    await userService.incrementChatUsage(req.user.sub);

    // Transcribe audio using SARVAM
    const transcribedText = await sarvamService.transcribeAudio(req.file.buffer, language);

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await conversationService.findConversationById(conversationId);
    }
    if (!conversation) {
      conversation = await conversationService.createConversation(
        req.user.sub,
        conversationType,
        { userBranch: req.user.branch, userYear: req.user.year }
      );
    }

    // Add user voice message
    await conversationService.addMessage(conversation._id, {
      sender: 'user',
      messageType: 'voice',
      content: transcribedText,
      language,
      timestamp: new Date(),
    });

    // Generate AI text response
    const aiResult = await nvidiaService.generateTutorResponse(transcribedText, '', language);

    // Generate voice response using SARVAM
    const voiceBuffer = await sarvamService.generateSpeech(aiResult.text, language);

    // Add AI response with voice stored in MongoDB
    await conversationService.addMessage(conversation._id, {
      sender: 'ai',
      messageType: 'voice',
      content: aiResult.text,
      voiceData: voiceBuffer,
      voiceMimeType: 'audio/wav',
      language,
      aiResponse: {
        text: aiResult.text,
        confidence: aiResult.confidence,
        modelUsed: aiResult.modelUsed,
        generatedAt: new Date(),
      },
      timestamp: new Date(),
    });

    // Update daily log
    await DailyLog.findOneAndUpdate(
      { userId: req.user.sub, date: new Date().toISOString().split('T')[0] },
      { $inc: { 'activities.messagesCount': 1 } },
      { upsert: true }
    );

    res.json({
      success: true,
      data: {
        messageId: Date.now().toString(),
        conversationId: conversation._id,
        transcribedText,
        aiResponse: {
          text: aiResult.text,
          confidence: aiResult.confidence,
        },
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVoiceAudio = async (req, res, next) => {
  try {
    const conversation = await conversationService.findConversationById(req.params.conversationId);
    if (!conversation) throw new BadRequestError('Conversation not found');

    const message = conversation.messages.id(req.params.messageId);
    if (!message || !message.voiceData) throw new BadRequestError('Voice audio not found');

    res.set({
      'Content-Type': message.voiceMimeType || 'audio/wav',
    });
    res.send(message.voiceData);
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { conversationType, limit = 20, skip = 0 } = req.query;

    const result = await conversationService.getConversationHistory(
      req.user.sub,
      conversationType,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const translateText = async (req, res, next) => {
  try {
    const { text, targetLanguage = 'en' } = req.body;
    if (!text) throw new BadRequestError('text required');
    const translatedText = await nvidiaService.translateText(text, targetLanguage);
    res.json({ success: true, translatedText });
  } catch (error) {
    next(error);
  }
};
