import connectToDatabase from '../../lib/database/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Order from '../../models/marketplace/Order';
import Product from '../../models/marketplace/Product';
import User from '../../models/user/User';

export default async function handler(req, res) {
  await connectToDatabase();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = await User.findById(session.user.id);
  if (!user) {
    return res.status(401).json({ error: 'Invalid session user' });
  }

  if (req.method === 'GET') {
    if (user.role === 'admin') {
      const orders = await Order.find({}).populate('user', 'name email role').sort({ createdAt: -1 });
      return res.status(200).json({ orders });
    }

    const orders = await Order.find({ user: user._id }).populate('items.product', 'name price images').sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  }

  if (req.method === 'POST') {
    const { cart, payment, address } = req.body;
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    if (!address || typeof address !== 'string' || address.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid delivery address' });
    }

    if (!payment || typeof payment !== 'string') {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    const items = [];
    let total = 0;

    for (const item of cart) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Invalid cart item' });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      const amount = product.price * item.quantity;
      total += amount;

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
      });
    }

    const order = new Order({
      user: user._id,
      items,
      total,
      paymentMethod: payment,
      shippingAddress: address.trim(),
      status: 'pending',
      trackingNumber: `RM-${Date.now()}`,
    });

    await order.save();

    return res.status(201).json({ message: 'Order placed successfully.', order });
  }

  if (req.method === 'PATCH') {
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Order ID and status are required' });
    }

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    try {
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).populate('user', 'name email role');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json({ order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
