import connectToDatabase from '../../../lib/database/connect';
import Course from '../../../models/elearning/Course';

export default async function handler(req, res) {
  await connectToDatabase();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const course = await Course.findById(id).populate('instructor', 'name avatar');
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      return res.status(200).json({ course });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch course' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}