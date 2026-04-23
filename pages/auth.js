import Link from 'next/link';

export default function AuthPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Login or register</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Access your Engocha-style marketplace account</h1>
        <p className="mt-4 text-slate-600 leading-7">Sign in to manage saved offers, view orders, and post your own classifieds and ads in one place.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/login" className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-900 shadow-sm hover:border-slate-300">
          <p className="text-sm text-slate-500">Existing user</p>
          <h2 className="mt-4 text-xl font-semibold">Login</h2>
        </Link>
        <Link href="/register" className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-900 shadow-sm hover:border-slate-300">
          <p className="text-sm text-slate-500">New account</p>
          <h2 className="mt-4 text-xl font-semibold">Register</h2>
        </Link>
      </div>

      <section className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Want to post an ad?</h2>
        <p className="mt-3 text-slate-600">Use the vendor dashboard to submit your item for sale, add photos, and publish your listing quickly.</p>
        <Link href="/vendor-dashboard" className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          Go to Vendor Dashboard
        </Link>
      </section>
    </div>
  );
}
