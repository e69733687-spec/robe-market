import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import { generateCSRFToken } from '../../../lib/csrf';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sessionId = session.user.id;
  const csrfToken = generateCSRFToken(sessionId);

  return res.status(200).json({ csrfToken, sessionId });
}
