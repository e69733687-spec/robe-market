import connectToDatabase from '../../lib/database/connect';
import Enrollment from '../../models/elearning/Enrollment';
import Course from '../../models/elearning/Course';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId, courseId } = req.query;

    try {
      let query = {};
      if (userId) query.student = userId;
      if (courseId) query.course = courseId;

      const enrollments = await Enrollment.find(query)
        .populate('course')
        .sort({ enrolledAt: -1 });

      return res.status(200).json({ enrollments });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
  }

  if (req.method === 'POST') {
    const { studentId, courseId } = req.body;

    try {
      // Check if already enrolled
      const existing = await Enrollment.findOne({ student: studentId, course: courseId });
      if (existing) {
        return res.status(400).json({ error: 'Already enrolled' });
      }

      const enrollment = new Enrollment({
        student: studentId,
        course: courseId,
      });

      await enrollment.save();

      // Add student to course enrolledStudents
      await Course.findByIdAndUpdate(courseId, {
        $push: { enrolledStudents: studentId }
      });

      const populatedEnrollment = await Enrollment.findById(enrollment._id).populate('course');

      return res.status(201).json({ enrollment: populatedEnrollment });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to enroll' });
    }
  }

  if (req.method === 'PATCH') {
    const { studentId, courseId, videoId } = req.body;

    if (!studentId || !courseId || !videoId) {
      return res.status(400).json({ error: 'studentId, courseId and videoId are required' });
    }

    try {
      const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const completedVideos = enrollment.progress.completedVideos || [];
      if (!completedVideos.some((id) => id.toString() === videoId)) {
        completedVideos.push(videoId);
      }
      enrollment.progress.completedVideos = completedVideos;

      const totalVideos = course.modules.reduce((sum, module) => sum + (module.videos?.length || 0), 0);
      enrollment.progress.overallProgress = totalVideos > 0
        ? Math.round((completedVideos.length / totalVideos) * 100)
        : enrollment.progress.overallProgress || 0;

      if (enrollment.progress.overallProgress >= 100) {
        enrollment.completedAt = enrollment.completedAt || new Date();
        enrollment.certificateIssued = true;
      }

      await enrollment.save();
      const populatedEnrollment = await Enrollment.findById(enrollment._id).populate('course');
      return res.status(200).json({ enrollment: populatedEnrollment });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update enrollment progress' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}