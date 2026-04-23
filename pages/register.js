import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('robe-user', JSON.stringify(data.user));
      setMessage('Registration successful.');
    } else {
      setMessage(data.error || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Register</h1>
        <p className="mt-2 text-slate-600">Create your account to track orders and save favorites.</p>
      </section>
      {message && <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">{message}</div>}
      <form onSubmit={handleRegister} className="space-y-4 rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3" />
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3" />
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3" />
        <button type="submit" className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white">Register</button>
      </form>
      <p className="text-center text-slate-500">
        Already have an account? <Link href="/login" className="text-slate-900 font-semibold">Login</Link>
      </p>
    </div>
  );
}
