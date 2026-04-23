import connectToDatabase from '../../../lib/database/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Product from '../../../models/marketplace/Product';
import Order from '../../../models/marketplace/Order';
import User from '../../../models/user/User';

export default async function handler(req, res) {
  await connectToDatabase();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [productCount, orderCount, userCount, recentOrders, recentProducts] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      User.countDocuments({}),
      Order.find({}).sort({ placedAt: -1 }).limit(10),
      Product.find({}).sort({ createdAt: -1 }).limit(10),
    ]);

    const sales = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    return res.status(200).json({ products: productCount, orders: orderCount, users: userCount, sales, recentOrders, recentProducts });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Unable to load dashboard stats' });
  }
}