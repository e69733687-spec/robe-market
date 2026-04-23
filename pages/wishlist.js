import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('robe-wishlist') || '[]');
    setWishlist(stored);
  }, []);

  const removeItem = (id) => {
    const next = wishlist.filter((item) => item.id !== id);
    setWishlist(next);
    localStorage.setItem('robe-wishlist', JSON.stringify(next));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Wishlist</h1>
        <p className="mt-2 text-slate-600">Save favorite items and add them to your cart later.</p>
      </section>

      {wishlist.length === 0 ? (
        <div className="rounded-3xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center text-slate-500">Your wishlist is empty.</div>
      ) : (
        <div className="grid gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm sm:flex sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-3xl object-cover" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                  <p className="text-slate-500">{item.category}</p>
                  <p className="mt-2 text-slate-700 font-semibold">{item.price} ETB</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-col gap-2">
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-3xl border border-slate-300 px-4 py-3 text-slate-700"
                >
                  Remove
                </button>
                <Link href="/cart" className="rounded-3xl bg-slate-900 px-4 py-3 text-center text-white">View cart</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
