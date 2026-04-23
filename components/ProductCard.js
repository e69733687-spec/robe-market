import Link from 'next/link';

export default function ProductCard({ product, onAddToCart, onAddToWishlist }) {
  return (
    <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="h-52 bg-slate-100 flex items-center justify-center overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">{product.category}</span>
          <span className="text-slate-900 font-semibold">{product.price} ETB</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 leading-6">{product.name}</h2>
        <p className="mt-2 text-slate-500 text-sm">{product.description}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href={`/product/${product.id}`} className="block rounded-xl bg-slate-900 text-white text-center py-2 text-sm">View details</Link>
          <button onClick={() => onAddToCart(product)} className="w-full rounded-xl border border-slate-300 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Add to cart
          </button>
          <button onClick={() => onAddToWishlist(product)} className="w-full rounded-xl bg-slate-100 text-slate-700 py-2 text-sm hover:bg-slate-200">
            Add to wishlist
          </button>
        </div>
      </div>
    </article>
  );
}
