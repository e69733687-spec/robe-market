import multer from 'multer';
import connectToDatabase from '../../../lib/database/connect';
import Product from '../../../models/marketplace/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { rateLimit } from '../../../lib/rateLimit';
import { sanitizeObject } from '../../../lib/sanitize';
import { runCsrfProtection } from '../../../lib/csrf';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

function parseCsv(text) {
  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(',').map((col) => col.trim()));

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.toLowerCase().replace(/[^a-z0-9]/gi, '_'));
  return rows.slice(1).map((cells) => {
    const row = {};
    cells.forEach((cell, index) => {
      row[headers[index] || `column_${index}`] = cell;
    });
    return row;
  });
}

function normalizeProductItem(item, sellerId) {
  if (!item || typeof item !== 'object') return null;

  const raw = sanitizeObject(item);
  const name = String(raw.name || raw.title || raw.product || '').trim();
  const category = String(raw.category || '').trim();
  const description = String(raw.description || '').trim();
  const price = Number(raw.price || raw.amount || 0);
  const images = Array.isArray(raw.images)
    ? raw.images.map((image) => String(image).trim()).filter(Boolean)
    : raw.image
      ? [String(raw.image).trim()]
      : [];
  const stock = Number(raw.stock ?? 1);
  const location = String(raw.location || 'Unknown').trim();
  const condition = ['New', 'Used', 'Refurbished'].includes(String(raw.condition)) ? String(raw.condition) : 'Used';

  if (!name || !category || !description || Number.isNaN(price) || price <= 0 || images.length === 0) {
    return null;
  }

  return {
    name,
    category,
    description,
    price,
    images,
    stock: Math.max(0, stock),
    location,
    condition,
    seller: sellerId,
  };
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const limitResult = rateLimit(identifier, 10, 1000 * 60 * 15);
  if (!limitResult.success) {
    return res.status(429).json({ error: 'Too many upload attempts. Try again later.' });
  }

  try {
    await runMiddleware(req, res, upload.single('file'));
  } catch (err) {
    console.error('Upload middleware error:', err);
    return res.status(400).json({ error: 'Failed to parse uploaded file.' });
  }

  try {
    const csrfValid = await runCsrfProtection(req, res);
    if (!csrfValid) {
      return;
    }
  } catch (error) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Please provide a CSV or JSON file containing products.' });
  }

  const text = file.buffer.toString('utf-8');
  let items = [];
  const isJson = file.mimetype === 'application/json' || file.originalname.toLowerCase().endsWith('.json');

  if (isJson) {
    try {
      items = JSON.parse(text);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON upload file.' });
    }
  } else {
    items = parseCsv(text);
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Uploaded file must contain at least one product record.' });
  }

  await connectToDatabase();

  const sellerId = session.user.id;
  const parsedProducts = items.map((item) => normalizeProductItem(item, sellerId)).filter(Boolean);

  if (parsedProducts.length === 0) {
    return res.status(400).json({ error: 'No valid product records found in the uploaded file.' });
  }

  try {
    const inserted = await Product.insertMany(parsedProducts, { ordered: false });
    return res.status(201).json({ message: 'Products uploaded successfully.', imported: inserted.length, total: parsedProducts.length });
  } catch (error) {
    console.error('Bulk upload insert error:', error);
    return res.status(500).json({ error: 'Failed to insert products. Some records may be invalid.' });
  }
}
