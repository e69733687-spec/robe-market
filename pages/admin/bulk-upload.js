import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminBulkUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session?.user?.role !== 'admin') {
      router.push('/login');
    }
  }, [router, session, status]);

  const handleFileSelect = (event) => {
    setFile(event.target.files?.[0] || null);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a CSV or JSON file first.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Upload failed. Please check the file and try again.');
      } else {
        setMessage(`Upload complete: ${data.imported}/${data.total} products imported.`);
        setFile(null);
        const fileInput = document.getElementById('bulk-file-input');
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bulk Product Upload</h1>
            <p className="mt-2 text-slate-600">Securely upload thousands of products in one file using CSV or JSON.</p>
          </div>
          <Link href="/admin/dashboard" className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900">
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-700">How it works</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>1. Download or create a CSV/JSON file with product name, category, description, price, images, location, stock, and condition.</li>
              <li>2. Upload the file using the form below.</li>
              <li>3. Your products are inserted in bulk using secure, sanitized database operations.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Select CSV or JSON file</label>
            <input
              id="bulk-file-input"
              type="file"
              accept=".csv,application/json"
              onChange={handleFileSelect}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
            />
            <p className="mt-3 text-sm text-slate-500">Supported fields: name, category, description, price, images, stock, location, condition.</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleUpload}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
            >
              {submitting ? 'Uploading…' : 'Upload Products'}
            </button>
            {file && <p className="text-sm text-slate-600">Selected file: {file.name}</p>}
          </div>

          {message && (
            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
