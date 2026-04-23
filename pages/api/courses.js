import connectToDatabase from '../../lib/database/connect';
import Course from '../../models/elearning/Course';

export default async function handler(req, res) {
  const dbConnection = await connectToDatabase();

  // Check if we're using mock database (when MongoDB connection fails)
  const isMockMode = dbConnection?.connection?.db?.databaseName === 'mock-db';

  if (req.method === 'GET') {
    try {
      const { instructor } = req.query;
      let courses, categories;

      if (isMockMode) {
        // Return mock data when database is not available
        courses = [
          {
            _id: 'mock-course-1',
            title: 'Introduction to Web Development',
            category: 'Technology',
            description: 'Learn the basics of web development',
            instructor: { _id: 'mock-instructor', name: 'John Doe' },
            price: 49.99,
            duration: '4 weeks',
            level: 'Beginner',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            _id: 'mock-course-2',
            title: 'Advanced JavaScript',
            category: 'Programming',
            description: 'Master advanced JavaScript concepts',
            instructor: { _id: 'mock-instructor', name: 'Jane Smith' },
            price: 79.99,
            duration: '6 weeks',
            level: 'Advanced',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        categories = ['Technology', 'Programming'];
      } else {
        // Use real database
        let query = {};
        if (instructor) {
          query.instructor = instructor;
        }
        courses = await Course.find(query).populate('instructor', 'name').sort({ createdAt: -1 });
        categories = [...new Set(courses.map((course) => course.category))];
      }

      return res.status(200).json({ courses, categories });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }
  }

  if (req.method === 'POST') {
    try {
      const course = new Course(req.body);
      await course.save();
      return res.status(201).json({ course });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create course' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}