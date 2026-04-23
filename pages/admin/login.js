import { useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '../../components/ToastContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin-token', data.token);
        addToast('Login successful!', 'success');
        router.push('/admin/dashboard');
      } else {
        addToast(data.error || 'Login failed.', 'error');
      }
    } catch (error) {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-slate-600">Access the admin dashboard for Robe Market.</p>
      </section>
      <form onSubmit={handleLogin} className="space-y-4 rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">Username</label>
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3" 
          disabled={isLoading}
        />
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          type="password" 
          className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3" 
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="w-full rounded-3xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
}