import { useEffect, useState } from 'react';
import { getCategoryLabel } from '../lib/formatters';

const initialForm = { name: '', price: '', category: '', description: '', stock: '', image: '' };

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Product created successfully.');
      setForm(initialForm);
      loadProducts();
    } else {
      setMessage(data.error || 'Could not create product.');
    }
  };

  const handleDelete = async (id) => {
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    loadProducts();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Inventory dashboard</h1>
        <p className="mt-2 text-slate-600">Add, update, or delete products and manage stock levels.</p>
      </section>

      {message && <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                <p className="text-slate-500">{getCategoryLabel(product.category)}</p>
                <p className="mt-2 text-slate-700">{product.price} ETB • Stock: {product.stock}</p>
              </div>
              <button onClick={() => handleDelete(product.id)} className="rounded-3xl bg-rose-500 px-4 py-3 text-white">
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Add product</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {['name', 'category', 'description', 'image'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  value={form[field]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Price</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </div>
            </div>
            <button type="submit" className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white">Save product</button>
          </form>
        </div>
      </div>
    </div>
  );
}
