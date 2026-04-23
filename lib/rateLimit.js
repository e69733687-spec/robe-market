import LRUCache from 'lru-cache';

const rateLimitCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 15, // 15 minutes
});

export function rateLimit(identifier, limit = 10, windowMs = 1000 * 60 * 15) {
  const key = `${identifier}`;
  const now = Date.now();

  const userRequests = rateLimitCache.get(key) || [];

  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < windowMs);

  if (validRequests.length >= limit) {
    return { success: false, resetTime: validRequests[0] + windowMs };
  }

  validRequests.push(now);
  rateLimitCache.set(key, validRequests);

  return { success: true };
}

export function rateLimitMiddleware(limit = 10, windowMs = 1000 * 60 * 15) {
  return (req, res, next) => {
    const identifier = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const result = rateLimit(identifier, limit, windowMs);

    if (!result.success) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        resetTime: new Date(result.resetTime).toISOString()
      });
    }

    next();
  };
}