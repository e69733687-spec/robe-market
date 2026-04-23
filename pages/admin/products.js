import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getCategoryLabel } from '../../lib/formatters';

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchProducts();
  }, [router, session, status]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });

      if (res.ok) {
        setProducts(products.filter(p => p._id !== productId));
        setMessage('Product deleted successfully');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to delete product');
      }
    } catch (error) {
      setMessage('Failed to delete product');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900">Admin Menu</h2>
              <p className="mt-2 text-sm text-slate-500">Quick links for platform management.</p>
            </div>

            <nav className="space-y-2">
              <Link href="/admin/dashboard" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/admin/products" className="block rounded-2xl px-4 py-3 text-sm font-medium bg-slate-100 text-slate-900">
                Products
              </Link>
              <Link href="/admin/orders" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                Orders
              </Link>
              <Link href="/admin/users" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                Users
              </Link>
              <Link href="/admin/settings" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                Settings
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">Product Management</h1>
                  <p className="mt-2 text-slate-600">Manage all products on the platform.</p>
                </div>
                <Link
                  href="/vendor-dashboard"
                  className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Add New Product
                </Link>
              </div>
            </section>

            {message && (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                {message}
              </div>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Seller</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-b border-slate-200 last:border-b-0">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0] || '/api/placeholder/50/50'}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-500">{product.condition}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">{getCategoryLabel(product.category)}</td>
                        <td className="py-4 px-4">{product.price?.toLocaleString()} ETB</td>
                        <td className="py-4 px-4">{product.stock ?? '—'}</td>
                        <td className="py-4 px-4">{product.seller?.name || 'Unknown'}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/product/${product._id}`}
                              className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
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
