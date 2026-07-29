import Conversation from '../models/Conversation.js';
import { NotFoundError } from '../utils/error-handler.js';

export const createConversation = async (userId, conversationType, context = {}) => {
  const conversation = new Conversation({
    userId,
    conversationType,
    context,
    messages: [],
  });
  await conversation.save();
  return conversation;
};

export const findOrCreateConversation = async (userId, conversationType, context = {}) => {
  let conversation = await Conversation.findOne({
    userId,
    conversationType,
    'metadata.isArchived': false,
  }).sort({ updatedAt: -1 });

  if (!conversation) {
    conversation = await createConversation(userId, conversationType, context);
  }

  return conversation;
};

export const addMessage = async (conversationId, message) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new NotFoundError('Conversation not found');

  conversation.messages.push(message);
  await conversation.save();
  return conversation;
};

export const getConversationHistory = async (userId, conversationType, limit = 20, skip = 0) => {
  const query = { userId };
  if (conversationType) query.conversationType = conversationType;

  const conversations = await Conversation.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Conversation.countDocuments(query);

  return { conversations, total, limit, skip };
};

export const getRecentMessages = async (conversationId, limit = 10) => {
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) throw new NotFoundError('Conversation not found');

  return conversation.messages.slice(-limit);
};

export const findConversationById = async (conversationId) => {
  return Conversation.findById(conversationId);
};

export const archiveConversation = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new NotFoundError('Conversation not found');

  conversation.metadata.isArchived = true;
  await conversation.save();
  return conversation;
};
