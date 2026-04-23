import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  grade: { type: String }, // e.g., 'Grade 1', 'Grade 2', etc.
  subject: { type: String },
  skill: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { type: String },
  price: { type: Number, default: 0 }, // 0 for free
  duration: { type: Number }, // in hours
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  modules: [{
    title: { type: String, required: true },
    description: { type: String },
    videos: [{
      title: { type: String },
      url: { type: String }, // Video URL
      duration: { type: Number } // in minutes
    }],
    materials: [{ type: String }], // PDF URLs
    quizzes: [{
      question: { type: String },
      options: [{ type: String }],
      correctAnswer: { type: Number }
    }]
  }],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ratings: [{ type: Number, min: 1, max: 5 }],
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);