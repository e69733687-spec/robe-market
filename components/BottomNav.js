import Link from 'next/link';
import { useRouter } from 'next/router';

const nav = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Classifieds', href: '/classifieds', icon: '📋' },
  { label: 'Sell', href: '/vendor-dashboard', icon: '➕' },
  { label: 'Cart', href: '/cart', icon: '🛒' },
  { label: 'Profile', href: '/login', icon: '👤' }
];

export default function BottomNav() {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around py-2">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center p-2 text-xs ${router.pathname === item.href ? 'text-orange-600' : 'text-slate-600'}`}>
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}