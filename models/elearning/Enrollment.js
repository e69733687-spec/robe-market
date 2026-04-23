import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: {
    completedModules: [{ type: mongoose.Schema.Types.ObjectId }], // Module IDs
    completedVideos: [{ type: mongoose.Schema.Types.ObjectId }], // Video IDs
    quizScores: [{
      quizId: { type: mongoose.Schema.Types.ObjectId },
      score: { type: Number },
      completedAt: { type: Date }
    }],
    overallProgress: { type: Number, default: 0 }, // Percentage
  },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  certificateIssued: { type: Boolean, default: false },
});

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);