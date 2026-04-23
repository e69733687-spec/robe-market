import { useEffect, useState } from 'react';

const defaultFilters = {
  category: '',
  location: '',
  minPrice: '',
  maxPrice: '',
  condition: ''
};

export default function FilterPanel({ categories = [], filters, setFilters, onReset, onFilter }) {
  const [localFilters, setLocalFilters] = useState(filters || defaultFilters);

  useEffect(() => {
    if (typeof setFilters !== 'function') {
      setLocalFilters(filters || defaultFilters);
    }
  }, [filters, setFilters]);

  const isControlled = typeof setFilters === 'function';
  const currentFilters = isControlled ? filters || defaultFilters : localFilters;

  const updateFilters = (updater) => {
    const nextFilters = typeof updater === 'function' ? updater(currentFilters) : updater;

    if (isControlled) {
      setFilters(nextFilters);
    } else {
      setLocalFilters(nextFilters);
    }

    if (typeof onFilter === 'function') {
      onFilter(nextFilters);
    }
  };

  const resetFilters = () => {
    if (isControlled) {
      setFilters(defaultFilters);
    } else {
      setLocalFilters(defaultFilters);
    }

    if (typeof onFilter === 'function') {
      onFilter(defaultFilters);
    }

    if (typeof onReset === 'function') {
      onReset();
    }
  };

  const categoryNames = Array.isArray(categories)
    ? categories.map((item) => (typeof item === 'string' ? item : item.name || item.label || 'Other'))
    : [];

  const locations = ['All locations', 'Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Adama', 'Robe', 'Jimma'];
  const conditions = ['Any', 'New', 'Used'];

  return (
    <aside className="sticky top-6 space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/5">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-600">Refine result</p>
        <h3 className="text-2xl font-semibold text-slate-950">Search filters</h3>
        <p className="text-sm leading-6 text-slate-500">Fine-tune results with location, category, price, and condition.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">Location</label>
          <select
            value={currentFilters?.location || ''}
            onChange={(e) => updateFilters((prev) => ({ ...prev, location: e.target.value }))}
            className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
          >
            {locations.map((location) => (
              <option key={location} value={location === 'All locations' ? '' : location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">Category</label>
          <div className="flex flex-wrap gap-2">
            {categoryNames.slice(0, 8).map((category) => {
              const selected = currentFilters?.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => updateFilters((prev) => ({ ...prev, category: prev.category === category ? '' : category }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selected ? 'bg-black text-white shadow-lg shadow-orange-950/10' : 'bg-slate-100 text-slate-700 hover:bg-orange-50'}`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">Price range</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              value={currentFilters?.minPrice || ''}
              onChange={(e) => updateFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
              placeholder="Min price"
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
            />
            <input
              type="number"
              value={currentFilters?.maxPrice || ''}
              onChange={(e) => updateFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
              placeholder="Max price"
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">Condition</label>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => {
              const selected = currentFilters?.condition === condition;
              return (
                <button
                  key={condition}
                  type="button"
                  onClick={() => updateFilters((prev) => ({ ...prev, condition: condition === 'Any' ? '' : condition }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selected ? 'bg-black text-white shadow-lg shadow-orange-950/10' : 'bg-slate-100 text-slate-700 hover:bg-orange-50'}`}
                >
                  {condition}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="w-full rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
      >
        Reset filters
      </button>
    </aside>
  );
}