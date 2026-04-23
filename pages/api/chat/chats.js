import connectToDatabase from '../../../lib/database/connect';
import Chat from '../../../models/chat/Chat';
import User from '../../../models/user/User';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      // Find all chats for the user
      const chats = await Chat.find({
        participants: userId
      })
      .populate('participants', 'name avatar')
      .populate('lastMessage.sender', 'name')
      .populate('lastMessage.receiver', 'name')
      .sort({ lastActivity: -1 });

      // Transform the data for the frontend
      const transformedChats = chats.map(chat => {
        const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);

        // Count unread messages for this user
        const unreadCount = chat.messages.filter(msg =>
          msg.receiver.toString() === userId && !msg.read
        ).length;

        return {
          _id: chat._id,
          otherParticipant: {
            _id: otherParticipant._id,
            name: otherParticipant.name,
            avatar: otherParticipant.avatar
          },
          lastMessage: chat.lastMessage,
          unreadCount,
          lastActivity: chat.lastActivity
        };
      });

      return res.status(200).json({ chats: transformedChats });
    } catch (error) {
      console.error('Error fetching chats:', error);
      return res.status(500).json({ error: 'Failed to fetch chats' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}