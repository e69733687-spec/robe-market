import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getCategoryLabel } from '../../lib/formatters';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Products', href: '/admin' },
  { label: 'Bulk Upload', href: '/admin/bulk-upload' },
  { label: 'Orders', href: '#orders' },
  { label: 'Users', href: '#users' },
  { label: 'Settings', href: '#settings' },
];

const fallbackOrders = [
  { id: 'ORD-1023', customer: 'Eleni', total: 6800, status: 'Delivered', date: 'Today' },
  { id: 'ORD-1022', customer: 'Bekele', total: 4200, status: 'Processing', date: 'Yesterday' },
  { id: 'ORD-1021', customer: 'Hanna', total: 1380, status: 'Pending', date: 'Apr 15' },
  { id: 'ORD-1020', customer: 'Mekdes', total: 5600, status: 'Delivered', date: 'Apr 14' },
  { id: 'ORD-1019', customer: 'Samuel', total: 2950, status: 'Cancelled', date: 'Apr 13' },
];

const fallbackProducts = [
  { id: 'P-501', name: 'Handwoven Robe', category: 'Traditional', price: 1200, stock: 18 },
  { id: 'P-502', name: 'Silk Scarf', category: 'Accessories', price: 550, stock: 36 },
  { id: 'P-503', name: 'Leather Sandals', category: 'Men', price: 890, stock: 12 },
  { id: 'P-504', name: 'Embroidered Dress', category: 'Women', price: 2200, stock: 9 },
  { id: 'P-505', name: 'Kids Jacket', category: 'Kids', price: 1450, stock: 20 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router, session, status]);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/orders'),
        fetch('/api/products'),
      ]);

      if (!statsRes.ok) {
        throw new Error('Unauthorized');
      }

      const statsData = await statsRes.json();
      setStats(statsData);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const displayOrders = orders.length > 0 ? orders.slice(0, 5) : fallbackOrders;
  const displayProducts = products.length > 0 ? products.slice(0, 5) : fallbackProducts;
  const totalSales = stats.sales || displayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900">Admin Menu</h2>
              <p className="mt-2 text-sm text-slate-500">Quick links for platform management.</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
                  <p className="mt-2 text-slate-600">Overview of sales, orders, users, and inventory.</p>
                </div>
                <div className="inline-flex rounded-3xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  Live analytics available
                </div>
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Sales</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{totalSales.toLocaleString()} ETB</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Orders</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.orders || displayOrders.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Users</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.users || 0}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Products</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.products || displayProducts.length}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest order activity from your marketplace.</p>
                </div>
                <Link href="#orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all orders</Link>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-200 last:border-b-0">
                        <td className="py-4 px-4 font-medium text-slate-900">{order.id}</td>
                        <td className="py-4 px-4">{order.customer || order.user || 'Guest'}</td>
                        <td className="py-4 px-4">{(order.total || 0).toLocaleString()} ETB</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Top Products</h2>
                  <p className="mt-1 text-sm text-slate-500">Current inventory highlights.</p>
                </div>
                <Link href="#users" className="text-sm font-medium text-blue-600 hover:text-blue-700">Manage products</Link>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProducts.map((product) => (
                      <tr key={product.id} className="border-b border-slate-200 last:border-b-0">
                        <td className="py-4 px-4 font-medium text-slate-900">{product.name}</td>
                        <td className="py-4 px-4">{getCategoryLabel(product.category)}</td>
                        <td className="py-4 px-4">{product.price?.toLocaleString()} ETB</td>
                        <td className="py-4 px-4">{product.stock ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
