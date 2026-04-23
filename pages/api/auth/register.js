import connectToDatabase from '../../../lib/database/connect';
import User from '../../../models/user/User';
import bcrypt from 'bcryptjs';
import { rateLimit } from '../../../lib/rateLimit';
import { runCsrfProtection } from '../../../lib/csrf';
import { sanitizeObject } from '../../../lib/sanitize';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CSRF protection
  try {
    await runCsrfProtection(req, res);
  } catch (error) {
    return res.status(403).json({ error: error.message || 'CSRF validation failed' });
  }

  // Rate limiting: 5 registrations per 15 minutes per IP
  const identifier = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const rateLimitResult = rateLimit(identifier, 5, 1000 * 60 * 15);

  if (!rateLimitResult.success) {
    return res.status(429).json({
      error: 'Too many registration attempts. Please try again later.',
      resetTime: new Date(rateLimitResult.resetTime).toISOString()
    });
  }

  await connectToDatabase();

  const sanitizedBody = sanitizeObject(req.body);
  const { name, email, password, role } = sanitizedBody;

  // Input validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const validRoles = ['buyer', 'seller', 'student', 'teacher'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'buyer',
    });

    await user.save();

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create user. Please try again.' });
  }
}