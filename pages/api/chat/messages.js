import connectToDatabase from '../../../lib/database/connect';
import Chat from '../../../models/chat/Chat';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId, otherUserId } = req.query;

    try {
      const chat = await Chat.findOne({
        participants: { $all: [userId, otherUserId] }
      })
      .populate('messages.sender', 'name avatar')
      .populate('messages.receiver', 'name avatar')
      .populate('typingUsers.user', 'name');

      if (!chat) {
        return res.status(200).json({ messages: [], typingUsers: [] });
      }

      // Clean up old typing indicators (older than 10 seconds)
      const now = new Date();
      chat.typingUsers = chat.typingUsers.filter(t => 
        (now - t.timestamp) < 10000
      );
      await chat.save();

      return res.status(200).json({ 
        messages: chat.messages,
        typingUsers: chat.typingUsers.map(t => t.user)
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    const { senderId, receiverId, content, type = 'text' } = req.body;

    try {
      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          messages: [],
        });
      }

      chat.messages.push({
        sender: senderId,
        receiver: receiverId,
        content,
        type,
      });

      chat.lastMessage = new Date();
      await chat.save();

      const populatedChat = await Chat.findById(chat._id)
        .populate('messages.sender', 'name avatar')
        .populate('messages.receiver', 'name avatar');

      return res.status(201).json({ message: populatedChat.messages[populatedChat.messages.length - 1] });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to send message' });
    }
  }

  if (req.method === 'PUT') {
    const { userId, otherUserId, action } = req.body;

    if (action === 'startTyping') {
      try {
        const chat = await Chat.findOne({
          participants: { $all: [userId, otherUserId] }
        });

        if (chat) {
          // Remove existing typing entry for this user
          chat.typingUsers = chat.typingUsers.filter(t => t.user.toString() !== userId);
          // Add new typing entry
          chat.typingUsers.push({ user: userId, timestamp: new Date() });
          await chat.save();
        }

        return res.status(200).json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update typing status' });
      }
    }

    if (action === 'stopTyping') {
      try {
        const chat = await Chat.findOne({
          participants: { $all: [userId, otherUserId] }
        });

        if (chat) {
          chat.typingUsers = chat.typingUsers.filter(t => t.user.toString() !== userId);
          await chat.save();
        }

        return res.status(200).json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update typing status' });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}