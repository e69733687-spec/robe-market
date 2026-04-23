import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchEnrollments();
    }
  }, [session]);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch(`/api/enrollments?userId=${session.user.id}`);
      const data = await res.json();
      setEnrollments(data.enrollments || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
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
          <p className="mt-2 text-slate-600">Loading your courses...</p>
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
        className="rounded-[32px] bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-8 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Welcome back, {session.user.name}!</h1>
            <p className="mt-2 text-blue-100">Continue your learning journey</p>
          </div>
          <div className="hidden md:block">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <div className="rounded-[28px] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{enrollments.length}</p>
              <p className="text-slate-600">Enrolled Courses</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                {enrollments.filter(e => e.completedAt).length}
              </p>
              <p className="text-slate-600">Completed Courses</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                {enrollments.filter(e => e.certificateIssued).length}
              </p>
              <p className="text-slate-600">Certificates Earned</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enrolled Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">My Courses</h2>
          <Link href="/courses" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Browse More Courses
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-slate-900">No courses enrolled yet</h3>
            <p className="mt-2 text-slate-600">Start your learning journey by enrolling in a course</p>
            <Link href="/courses" className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * enrollments.indexOf(enrollment) }}
                className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {enrollment.course.thumbnail ? (
                    <Image
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">
                      No image available
                    </div>
                  )}
                  <div className="absolute inset-x-4 bottom-4 rounded-3xl bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                    {enrollment.progress.overallProgress}% Complete
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="space-y-3">
                    <h3 className="line-clamp-2 text-xl font-semibold text-slate-950">
                      {enrollment.course.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                      {enrollment.course.description}
                    </p>
                    <p className="text-sm text-slate-600">
                      By {enrollment.course.instructor?.name || 'Instructor'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress.overallProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{enrollment.progress.completedModules?.length || 0} modules completed</span>
                      <span>{enrollment.progress.overallProgress}%</span>
                    </div>
                  </div>

                  <Link
                    href={`/student/course/${enrollment.course._id}`}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-purple-700"
                  >
                    {enrollment.completedAt ? 'Review Course' : 'Continue Learning'}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Certificates */}
      {enrollments.filter(e => e.certificateIssued).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-slate-900">My Certificates</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {enrollments.filter(e => e.certificateIssued).map((enrollment) => (
              <div key={enrollment._id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{enrollment.course.title}</h3>
                    <p className="text-sm text-slate-600">Completed on {new Date(enrollment.completedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="mt-4 w-full rounded-full bg-yellow-500 px-6 py-3 text-sm font-semibold text-white hover:bg-yellow-600">
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}