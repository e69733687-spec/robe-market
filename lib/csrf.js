import crypto from 'crypto';

const CSRF_TOKENS = new Map();

export function generateCSRFToken(sessionId) {
  const token = crypto.randomBytes(32).toString('hex');
  CSRF_TOKENS.set(sessionId, token);
  return token;
}

export function validateCSRFToken(sessionId, token) {
  const storedToken = CSRF_TOKENS.get(sessionId);
  if (!storedToken || storedToken !== token) {
    return false;
  }
  // Token is single-use, remove after validation
  CSRF_TOKENS.delete(sessionId);
  return true;
}

export function csrfProtection(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const sessionId = req.headers['x-session-id'] || req.body?.sessionId;
  const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken;

  if (!sessionId || !csrfToken) {
    return next(new Error('CSRF token and session ID required'));
  }

  if (!validateCSRFToken(sessionId, csrfToken)) {
    return next(new Error('Invalid CSRF token'));
  }

  next();
}

export function runCsrfProtection(req, res) {
  return new Promise((resolve, reject) => {
    csrfProtection(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}
