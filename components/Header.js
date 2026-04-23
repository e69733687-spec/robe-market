import Link from 'next/link';
import { useEffect, useState } from 'react';

const nav = [
  { label: 'Home', href: '/' },
  { label: 'Cart', href: '/cart' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Admin', href: '/admin' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('robe-cart') || '[]');
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener('robe-cart-updated', updateCartCount);
    return () => window.removeEventListener('robe-cart-updated', updateCartCount);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-semibold text-slate-900">Robe Market</Link>
          <div className="hidden md:flex items-center gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900 transition">{item.label}</Link>
            ))}
            <a
              href="https://wa.me/251900000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-white text-sm font-medium"
            >
              WhatsApp
            </a>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <span>{open ? '✕' : '☰'}</span>
          </button>
        </div>
        {open && (
          <div className="md:hidden py-3 space-y-2">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-md text-slate-700 bg-slate-50">{item.label}</Link>
            ))}
            <a
              href="https://wa.me/251900000000"
              target="_blank"
              rel="noreferrer"
              className="block px-3 py-2 rounded-md text-white bg-emerald-500"
            >
              WhatsApp
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
