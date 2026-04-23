import { useEffect, useState } from 'react';
import Link from 'next/link';
import CourseCard from '../components/elearning/CourseCard';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', level: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data.courses || []);
      setCategories(data.categories || []);
    }
    load();
  }, []);

  const filtered = courses.filter((course) => {
    const matchesCategory = filters.category ? course.category === filters.category : true;
    const matchesLevel = filters.level ? course.level === filters.level : true;
    const matchesSearch =
      search.trim().length === 0 ||
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-semibold text-slate-900">Robe Academy</h1>
        <p className="text-lg text-slate-600">Learn from expert instructors and advance your skills</p>
        <div className="max-w-md mx-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-full border border-slate-300 px-6 py-3 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.3fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Filters</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <button
                onClick={() => setFilters({ category: '', level: '' })}
                className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Courses ({filtered.length})</h2>
              <Link href="/teacher/dashboard" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white">
                Create Course
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}