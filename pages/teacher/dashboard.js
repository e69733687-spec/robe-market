import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const courseSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  price: yup.number().min(0, 'Price must be positive'),
  level: yup.string().required('Level is required'),
});

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(courseSchema),
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchCourses();
      fetchEnrollments();
    }
  }, [session]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/courses?instructor=${session.user.id}`);
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      // Get enrollments for all teacher's courses
      const allEnrollments = [];
      for (const course of courses) {
        const res = await fetch(`/api/enrollments?courseId=${course._id}`);
        const data = await res.json();
        allEnrollments.push(...(data.enrollments || []));
      }
      setEnrollments(allEnrollments);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCourse = async (data) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          instructor: session.user.id,
          modules: [],
        }),
      });

      if (res.ok) {
        reset();
        setShowCreateForm(false);
        fetchCourses();
      }
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handleFileUpload = async (event, courseId, moduleIndex, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      // Update course with new file
      const updatedCourses = courses.map(course => {
        if (course._id === courseId) {
          const updatedModules = [...course.modules];
          if (type === 'video') {
            updatedModules[moduleIndex].videos.push({
              title: file.name,
              url: data.url,
            });
          } else if (type === 'material') {
            updatedModules[moduleIndex].materials.push(data.url);
          }
          return { ...course, modules: updatedModules };
        }
        return course;
      });

      setCourses(updatedCourses);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Please sign in to access your dashboard</h1>
          <Link href="/login" className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-3 text-white">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] bg-gradient-to-br from-green-600 via-teal-600 to-green-800 p-8 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Teacher Dashboard</h1>
            <p className="mt-2 text-green-100">Manage your courses and students</p>
          </div>
          <div className="hidden md:block">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">👨‍🏫</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-4"
      >
        <div className="rounded-[28px] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{courses.length}</p>
              <p className="text-slate-600">My Courses</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{enrollments.length}</p>
              <p className="text-slate-600">Total Students</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                {courses.reduce((sum, course) => sum + (course.price * course.enrolledStudents.length), 0).toLocaleString()} ETB
              </p>
              <p className="text-slate-600">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                {courses.length > 0 ? (courses.reduce((sum, course) => sum + (course.ratings.reduce((a, b) => a + b, 0) / course.ratings.length || 0), 0) / courses.length).toFixed(1) : 0}
              </p>
              <p className="text-slate-600">Avg Rating</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Course Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-full bg-gradient-to-r from-green-600 to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-green-700 hover:to-teal-700"
        >
          {showCreateForm ? 'Cancel' : '+ Create New Course'}
        </button>
      </motion.div>

      {/* Create Course Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl"
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Create New Course</h2>
          <form onSubmit={handleSubmit(onSubmitCourse)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Course Title</label>
                <input
                  {...register('title')}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter course title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  {...register('category')}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select category</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Language">Language</option>
                  <option value="Technology">Technology</option>
                  <option value="Arts">Arts</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                placeholder="Describe your course"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Price (ETB)</label>
                <input
                  {...register('price')}
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  placeholder="0 for free"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Level</label>
                <select
                  {...register('level')}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>}
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                  Create Course
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* My Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold text-slate-900">My Courses</h2>

        {courses.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-slate-900">No courses created yet</h3>
            <p className="mt-2 text-slate-600">Start teaching by creating your first course</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl"
              >
                <div className="relative h-48 overflow-hidden rounded-[24px] bg-slate-100 mb-4">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">
                      No thumbnail
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{course.enrolledStudents?.length || 0} students</span>
                    <span>{course.modules?.length || 0} modules</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCourse(selectedCourse === course._id ? null : course._id)}
                      className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Manage Content
                    </button>
                    <Link
                      href={`/course/${course._id}`}
                      className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 text-center hover:bg-slate-50"
                    >
                      View Course
                    </Link>
                  </div>
                </div>

                {/* Content Management */}
                {selectedCourse === course._id && (
                  <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
                    <h4 className="font-semibold text-slate-900">Course Modules</h4>

                    {course.modules?.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="rounded-lg border border-slate-200 p-4">
                        <h5 className="font-medium text-slate-900">{module.title}</h5>
                        <p className="text-sm text-slate-600">{module.description}</p>

                        <div className="mt-3 space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Add Video</label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleFileUpload(e, course._id, moduleIndex, 'video')}
                              className="mt-1 w-full text-sm"
                              disabled={uploading}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Add Material</label>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload(e, course._id, moduleIndex, 'material')}
                              className="mt-1 w-full text-sm"
                              disabled={uploading}
                            />
                          </div>
                        </div>

                        {module.videos?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-slate-700">Videos:</p>
                            <ul className="text-sm text-slate-600">
                              {module.videos.map((video, i) => (
                                <li key={i}>• {video.title}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}

                    <button className="w-full rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                      + Add New Module
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}