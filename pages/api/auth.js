const store = require('../../lib/store');
const { rateLimitMiddleware } = require('../../lib/rateLimit');

export default rateLimitMiddleware(10, 15 * 60 * 1000)(function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, name, email, password } = req.body;

  if (action === 'login') {
    const user = store.users.find((user) => user.email === email && user.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    return res.status(200).json({ user: { id: user.id, name: user.name, email: user.email } });
  }

  if (action === 'register') {
    if (store.users.find((user) => user.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const newUser = { id: `u${Date.now()}`, name, email, password };
    store.users.push(newUser);
    return res.status(201).json({ user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  }

  return res.status(400).json({ error: 'Invalid action' });
});
