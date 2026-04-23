import connectToDatabase from '../../lib/database/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Product from '../../models/marketplace/Product';
import { rateLimit } from '../../lib/rateLimit';
import { sanitizeObject, escapeRegex } from '../../lib/sanitize';
import { runCsrfProtection } from '../../lib/csrf';

export default async function handler(req, res) {
  const dbConnection = await connectToDatabase();

  // Check if we're using mock database (when MongoDB connection fails)
  const isMockMode = dbConnection?.connection?.db?.databaseName === 'mock-db';

  if (req.method === 'GET') {
    try {
      let products, categories;
      const query = sanitizeObject(req.query || {});
      const categoryFilter = typeof query.category === 'string' ? query.category.trim() : '';
      const searchFilter = typeof query.search === 'string' ? query.search.trim() : '';

      if (isMockMode) {
        products = [
          {
            _id: 'mock-1',
            name: 'Sample Product 1',
            category: 'Electronics',
            description: 'This is a sample product for testing',
            price: 99.99,
            images: ['/uploads/sample1.jpg'],
            condition: 'New',
            location: 'New York',
            seller: { _id: 'mock-seller', name: 'Sample Seller' },
            stock: 10,
            verified: true,
            ratings: [5, 4, 5],
            reviews: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            _id: 'mock-2',
            name: 'Sample Product 2',
            category: 'Books',
            description: 'Another sample product for testing',
            price: 19.99,
            images: ['/uploads/sample2.jpg'],
            condition: 'Used',
            location: 'California',
            seller: { _id: 'mock-seller', name: 'Sample Seller' },
            stock: 5,
            verified: false,
            ratings: [4, 5],
            reviews: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        categories = ['Electronics', 'Books'];
      } else {
        const filter = {};
        if (categoryFilter) {
          filter.category = categoryFilter;
        }
        if (searchFilter) {
          const escaped = escapeRegex(searchFilter);
          const searchRegex = new RegExp(escaped, 'i');
          filter.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex }
          ];
        }

        products = await Product.find(filter).populate('seller', 'name').sort({ createdAt: -1 });
        categories = [...new Set(products.map((product) => product.category))];
      }

      return res.status(200).json({ products, categories });
    } catch (error) {
      console.error('Products fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch products. Please try again.' });
    }
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !['admin', 'seller'].includes(session.user?.role)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      await runCsrfProtection(req, res);
    } catch (error) {
      return res.status(403).json({ error: error.message || 'Invalid CSRF token' });
    }

    const identifier = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const rateLimitResult = rateLimit(identifier, 10, 1000 * 60 * 15);

    if (!rateLimitResult.success) {
      return res.status(429).json({
        error: 'Too many product creation attempts. Please try again later.',
        resetTime: new Date(rateLimitResult.resetTime).toISOString()
      });
    }

    try {
      const sanitizedBody = sanitizeObject(req.body);
      const { title, description, price, category, images, stock, location, condition } = sanitizedBody;

      if (!title || typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).json({ error: 'Title must be at least 3 characters long' });
      }

      if (!description || typeof description !== 'string' || description.trim().length < 10) {
        return res.status(400).json({ error: 'Description must be at least 10 characters long' });
      }

      const parsedPrice = Number(price);
      if (!price || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      if (!category || typeof category !== 'string' || category.trim().length < 2) {
        return res.status(400).json({ error: 'Category is required' });
      }

      if (!Array.isArray(images) || images.filter((image) => typeof image === 'string' && image.trim().length > 0).length === 0) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      const seller = session.user.id;
      const product = new Product({
        name: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        category: category.trim(),
        images: images.map((image) => String(image).trim()).filter(Boolean),
        stock: Number(stock) || 1,
        location: String(location || 'Unknown').trim(),
        condition: ['New', 'Used', 'Refurbished'].includes(String(condition)) ? String(condition) : 'New',
        seller,
      });

      await product.save();
      return res.status(201).json({ product });
    } catch (error) {
      console.error('Product creation error:', error);
      return res.status(500).json({ error: 'Failed to create product. Please try again.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await runCsrfProtection(req, res);
    } catch (error) {
      return res.status(403).json({ error: error.message || 'Invalid CSRF token' });
    }

    const sanitizedBody = sanitizeObject(req.body);
    const { id } = sanitizedBody;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Product deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete product. Please try again.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
