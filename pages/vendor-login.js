import { useState } from 'react';
import { useRouter } from 'next/router';

export default function VendorLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Simulate API call
    setTimeout(() => {
      if (isLogin) {
        if (form.email === 'vendor@example.com' && form.password === 'vendor123') {
          router.push('/vendor-dashboard');
        } else {
          setError('Invalid credentials.');
        }
      } else {
        if (form.email && form.password && form.name) {
          router.push('/vendor-dashboard');
        } else {
          setError('All fields are required.');
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-emerald-700 mb-6 text-center">{isLogin ? 'Vendor Login' : 'Vendor Sign Up'}</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-2 bg-slate-50"
                placeholder="Your Name"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-2 bg-slate-50"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-2 bg-slate-50"
              placeholder="Password"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 transition"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-emerald-700 hover:underline text-sm"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'New vendor? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
