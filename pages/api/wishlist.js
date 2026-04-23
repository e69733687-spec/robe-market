import connectToDatabase from '../../lib/database/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Wishlist from '../../models/marketplace/Wishlist';
import Product from '../../models/marketplace/Product';

export default async function handler(req, res) {
  await connectToDatabase();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const wishlist = await Wishlist.find({ user: session.user.id })
        .populate('product')
        .sort({ addedAt: -1 });
      return res.status(200).json({ wishlist: wishlist.map(item => item.product) });
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { productId } = req.body;

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const existing = await Wishlist.findOne({ user: session.user.id, product: productId });
      if (existing) {
        return res.status(400).json({ error: 'Product already in wishlist' });
      }

      const wishlistItem = new Wishlist({
        user: session.user.id,
        product: productId,
      });

      await wishlistItem.save();
      return res.status(201).json({ message: 'Added to wishlist' });
    } catch (error) {
      console.error('Wishlist add error:', error);
      return res.status(500).json({ error: 'Failed to add to wishlist' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { productId } = req.body;

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      await Wishlist.findOneAndDelete({ user: session.user.id, product: productId });
      return res.status(200).json({ message: 'Removed from wishlist' });
    } catch (error) {
      console.error('Wishlist remove error:', error);
      return res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
