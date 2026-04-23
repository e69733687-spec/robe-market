import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setMessage('Invalid credentials');
    } else {
      setMessage('Login successful.');
      router.push('/');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-slate-600">Access your account history and checkout faster.</p>
      </section>
      {message && <div className="rounded-3xl bg-amber-50 border border-amber-200 p-4 text-amber-800">{message}</div>}
      <form onSubmit={handleLogin} className="space-y-4 rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3" />
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3" />
        <button type="submit" className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white">Login</button>
      </form>
      <p className="text-center text-slate-500">
        New to Robe Market? <Link href="/register" className="text-slate-900 font-semibold">Register</Link>
      </p>
    </div>
  );
}
