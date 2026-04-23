import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';

export default function CourseView() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && session?.user?.id) {
      fetchCourse();
      fetchEnrollment();
    }
  }, [id, session]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${id}`);
      const data = await res.json();
      setCourse(data.course);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    }
  };

  const fetchEnrollment = async () => {
    try {
      const res = await fetch(`/api/enrollments?userId=${session.user.id}&courseId=${id}`);
      const data = await res.json();
      setEnrollment(data.enrollments?.[0]);
    } catch (error) {
      console.error('Failed to fetch enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: session.user.id,
          courseId: id,
        }),
      });

      if (res.ok) {
        fetchEnrollment();
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  const markVideoComplete = async (moduleIndex, videoIndex) => {
    if (!enrollment) return;

    try {
      const videoId = course.modules[moduleIndex].videos[videoIndex]._id;
      const res = await fetch('/api/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: session.user.id,
          courseId: id,
          videoId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEnrollment(data.enrollment);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Please sign in to view this course</h1>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-3 text-white"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Course not found</h1>
        </div>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const currentModuleData = course.modules?.[currentModule];
  const currentVideoData = currentModuleData?.videos?.[currentVideo];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-8 text-white shadow-2xl mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{course.title}</h1>
            <p className="mt-2 text-blue-100">{course.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span>By {course.instructor?.name}</span>
              <span>•</span>
              <span>{course.level}</span>
              <span>•</span>
              <span>{course.modules?.length || 0} modules</span>
            </div>
          </div>
          {!isEnrolled && (
            <button
              onClick={handleEnroll}
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-slate-100"
            >
              {course.price === 0 ? 'Enroll Free' : `Enroll for ${course.price} ETB`}
            </button>
          )}
        </div>

        {isEnrolled && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{enrollment.progress.overallProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${enrollment.progress.overallProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </motion.div>

      {isEnrolled ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl"
            >
              {currentVideoData ? (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {currentVideoData.title}
                  </h3>
                  <div className="aspect-video rounded-[24px] overflow-hidden bg-slate-100">
                    <ReactPlayer
                      url={currentVideoData.url}
                      width="100%"
                      height="100%"
                      controls
                      onEnded={() => markVideoComplete(currentModule, currentVideo)}
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-[24px] bg-slate-100 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="text-6xl mb-4">🎥</div>
                    <p>Select a video to start learning</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Materials */}
            {currentModuleData?.materials?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Course Materials</h3>
                <div className="space-y-2">
                  {currentModuleData.materials.map((material, index) => (
                    <a
                      key={index}
                      href={material}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <span className="text-2xl">📄</span>
                      <span className="text-slate-900">Download Material {index + 1}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Course Content */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Course Content</h3>
              <div className="space-y-4">
                {course.modules?.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="space-y-2">
                    <button
                      onClick={() => setCurrentModule(moduleIndex)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        currentModule === moduleIndex
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-medium text-slate-900">{module.title}</div>
                      <div className="text-sm text-slate-600">{module.description}</div>
                    </button>

                    {currentModule === moduleIndex && (
                      <div className="ml-4 space-y-1">
                        {module.videos?.map((video, videoIndex) => (
                          <button
                            key={videoIndex}
                            onClick={() => setCurrentVideo(videoIndex)}
                            className={`w-full text-left p-2 rounded text-sm transition ${
                              currentVideo === videoIndex
                                ? 'bg-blue-100 text-blue-900'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            ▶ {video.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quiz Section */}
            {currentModuleData?.quizzes?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Module Quiz</h3>
                <button className="w-full rounded-full bg-green-600 px-6 py-3 text-white hover:bg-green-700">
                  Take Quiz
                </button>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-xl"
        >
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Enroll to Access Course Content</h2>
          <p className="text-slate-600 mb-6">
            {course.price === 0
              ? 'This course is free! Click enroll to start learning.'
              : `Enroll for ${course.price} ETB to access all course materials and videos.`
            }
          </p>
          <button
            onClick={handleEnroll}
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
          >
            {course.price === 0 ? 'Enroll Free' : `Enroll for ${course.price} ETB`}
          </button>
        </motion.div>
      )}
    </div>
  );
}