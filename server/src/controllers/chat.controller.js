const ChatMessage = require('../models/ChatMessage');
const HardwareRequest = require('../models/HardwareRequest');

/**
 * GET /api/chat/:requestId
 * Get messages for a specific request conversation
 */
const getMessages = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    // Verify user is part of this request
    const request = await HardwareRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const userId = String(req.userId);
    if (String(request.requester_id) !== userId && String(request.owner_id) !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to view these messages' });
    }

    const messages = await ChatMessage.find({ request_id: requestId })
      .populate('sender_id', 'name email avatar_url')
      .populate('receiver_id', 'name email avatar_url')
      .sort({ createdAt: 1 });

    // Mark messages as read for current user
    await ChatMessage.updateMany(
      { request_id: requestId, receiver_id: req.userId, read: false },
      { read: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/conversations
 * Get list of conversations (requests) for current user
 */
const getConversations = async (req, res, next) => {
  try {
    const requests = await HardwareRequest.find({
      $or: [
        { requester_id: req.userId },
        { owner_id: req.userId },
      ],
    })
      .populate('hardware_id', 'name category image_url')
      .populate('requester_id', 'name email avatar_url')
      .populate('owner_id', 'name email avatar_url')
      .sort({ updatedAt: -1 });

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      requests.map(async (request) => {
        const unreadCount = await ChatMessage.countDocuments({
          request_id: request._id,
          receiver_id: req.userId,
          read: false,
        });
        return {
          ...request.toObject(),
          unread_count: unreadCount,
        };
      })
    );

    res.json({ success: true, data: conversationsWithUnread });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, getConversations };
