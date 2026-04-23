import { useState } from 'react';

const initialForm = {
  title: '',
  price: '',
  category: '',
  description: '',
  image: null,
};

const categories = [
  'Traditional Robe',
  'Modern Dress',
  'Accessories',
  'Men',
  'Women',
  'Kids',
];

export default function VendorDashboard() {
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState([]); // This would be fetched from API in production
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setForm({ ...form, image: e.dataTransfer.files[0] });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');
    // Simulate upload with image compression
    if (form.image) {
      // In production, use sharp to compress
      // const compressed = await sharp(form.image).resize(800).jpeg({ quality: 80 }).toBuffer();
      // For now, just simulate
    }
    setTimeout(() => {
      setProducts([
        ...products,
        { ...form, id: Date.now(), imageUrl: form.image ? URL.createObjectURL(form.image) : null },
      ]);
      setForm(initialForm);
      setUploading(false);
      setMessage('Product submitted for admin approval.');
    }, 1200);
  };

  const handleFileChange = (e) => {
    setBulkFile(e.target.files[0]);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    setBulkUploading(true);
    setBulkMessage('');

    // Simulate bulk upload
    setTimeout(() => {
      setBulkUploading(false);
      setBulkMessage('Bulk upload completed successfully! Products submitted for admin approval.');
      setBulkFile(null);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Vendor Dashboard</h1>
      <div className="professional-card p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="e.g. Elegant Traditional Robe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Price (ETB)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="e.g. 1200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="form-input"
              rows="3"
              placeholder="Describe your product..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Product Image</label>
            <div
              className="w-full h-32 flex items-center justify-center border-2 border-dashed border-blue-400 rounded-xl bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('imageInput').click()}
            >
              {form.image ? (
                <img src={URL.createObjectURL(form.image)} alt="Preview" className="h-24 rounded-lg object-cover" />
              ) : (
                <div className="text-center">
                  <svg className="upload-icon mx-auto mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-blue-700 font-medium">Drag & Drop or Click to Upload</span>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Submit for Approval'}
          </button>
          {message && <div className="text-emerald-600 font-medium mt-2">{message}</div>}
        </form>
      </div>

      {/* Bulk Upload Section */}
      <div className="professional-card p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Bulk Upload Products (CSV/Excel)</h2>
        <p className="text-gray-600 mb-4">
          Upload multiple products at once using a CSV or Excel file. Download the template below.
        </p>
        <div className="mb-4">
          <a
            href="/templates/product-upload-template.csv"
            download
            className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV Template
          </a>
        </div>
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Upload CSV/Excel File</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="form-input"
              required
            />
          </div>
          <button
            type="submit"
            disabled={bulkUploading}
            className="btn-primary w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkUploading ? 'Uploading...' : 'Upload Products'}
          </button>
          {bulkMessage && <div className="text-emerald-600 font-medium mt-2">{bulkMessage}</div>}
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8">
        <h2 className="text-xl font-semibold mb-4">Your Product Listings</h2>
        {products.length === 0 ? (
          <div className="text-slate-400">No products uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="rounded-2xl border border-slate-200 p-4 flex gap-4 items-center bg-slate-50">
                {prod.imageUrl && <img src={prod.imageUrl} alt={prod.title} className="h-20 w-20 rounded-xl object-cover" />}
                <div>
                  <div className="font-semibold text-slate-900">{prod.title}</div>
                  <div className="text-slate-500 text-sm">{prod.category}</div>
                  <div className="text-emerald-700 font-bold mt-1">{prod.price} ETB</div>
                  <div className="text-slate-400 text-xs mt-1">Pending admin approval</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-10 text-center text-slate-400 text-xs">
        <span>Admin: <span className="font-semibold text-emerald-700">Endashaw</span> oversees all vendor submissions.</span>
      </div>
    </div>
  );
}
