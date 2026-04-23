import Link from 'next/link';

export default function ListingAddPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Post a classified</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Add your listing to the marketplace</h1>
        <p className="mt-4 text-slate-600 leading-7">Let buyers in Ethiopia discover your item. Upload details, add photos, and publish your ad instantly from the vendor dashboard.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/vendor-dashboard" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
            Open Vendor Dashboard
          </Link>
          <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Need help?
          </Link>
        </div>
      </section>
    </div>
  );
}
