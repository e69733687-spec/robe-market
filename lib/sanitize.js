export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((value) => sanitizeObject(value));
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((sanitized, key) => {
      const safeKey = key.replace(/^[.$]+|[.$]+/g, '');
      sanitized[safeKey] = sanitizeObject(obj[key]);
      return sanitized;
    }, {});
  }
  return obj;
}

export function escapeRegex(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
