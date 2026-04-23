import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/database/connect';
import User from '../../../models/user/User';
import Order from '../../../models/marketplace/Order';
import Chat from '../../../models/chat/Chat';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'PATCH') {
    const { id, role } = req.body;

    if (!id || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }

    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    try {
      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      // Check for active orders
      const activeOrders = await Order.find({
        $or: [
          { buyer: id },
          { seller: id }
        ],
        status: { $in: ['pending', 'confirmed', 'shipped'] }
      });

      if (activeOrders.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete user with active orders. Please resolve all orders first.' 
        });
      }

      // Check for active chats
      const activeChats = await Chat.find({
        participants: id,
        messages: { $exists: true, $ne: [] }
      });

      if (activeChats.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete user with active chat conversations. Please resolve all chats first.' 
        });
      }

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
