import Link from 'next/link';
import Image from 'next/image';

export default function CourseCard({ course }) {
  if (!course) return null;

  const ratings = Array.isArray(course.ratings) ? course.ratings : [];
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return (
    <article className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">No image available</div>
        )}
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/85 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
          <span>{course.level}</span>
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm">
          {course.category}
        </div>
        <div className="absolute inset-x-4 bottom-4 rounded-3xl bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
          {course.price === 0 ? 'Free' : `${course.price} ETB`}
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="space-y-3">
          <h2 className="line-clamp-2 text-xl font-semibold text-slate-950">{course.title}</h2>
          <p className="line-clamp-2 text-sm leading-6 text-slate-500">{course.description}</p>
          <p className="text-sm text-slate-600">By {course.instructor?.name || 'Instructor'}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">⭐ {ratings.length > 0 ? avgRating.toFixed(1) : 'New'}</span>
          <span>{course.enrolledStudents?.length || 0} students</span>
        </div>

        <Link
          href={`/student/course/${course._id}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-purple-700"
        >
          Enroll Now
        </Link>
      </div>
    </article>
  );
}