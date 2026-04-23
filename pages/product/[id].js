import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useChat } from '../../context/ChatContext';
import OptimizedImage from '../../components/OptimizedImage';
import { getCategoryLabel } from '../../lib/formatters';

export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products`);
    const data = await res.json();
    const product = data.products.find((entry) => String(entry._id || entry.id) === String(params.id));

    if (!product) {
      return { notFound: true };
    }

    return { props: { product } };
  } catch (error) {
    return { notFound: true };
  }
}

export default function ProductDetail({ product: initialProduct }) {
  const router = useRouter();
  const [product] = useState(initialProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const categoryLabel = getCategoryLabel(product.category);
  const images = product.images || [product.image];
  const ratings = product.ratings || [];
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  useEffect(() => {
    // Check if product is in wishlist
    const wishlist = JSON.parse(localStorage.getItem('robe-wishlist') || '[]');
    setIsWishlisted(wishlist.some(item => (item._id || item.id) === (product._id || product.id)));
  }, [product]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pageUrl = window.location.href;
      setWhatsappUrl(
        `https://wa.me/251900000000?text=${encodeURIComponent(
          `Hi, I'm interested in this ${product.title || product.name} on Robe Market: ${pageUrl}`
        )}`
      );
    }
  }, [product]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('robe-cart') || '[]');
    const existing = cart.find(item => (item._id || item.id) === (product._id || product.id));

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem('robe-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('robe-cart-updated'));

    // Show success message
    alert(`Added ${quantity} ${product.title || product.name} to cart!`);
  };

  const handleToggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('robe-wishlist') || '[]');
    const productId = product._id || product.id;

    if (isWishlisted) {
      const filtered = wishlist.filter(item => (item._id || item.id) !== productId);
      localStorage.setItem('robe-wishlist', JSON.stringify(filtered));
      setIsWishlisted(false);
    } else {
      wishlist.push(product);
      localStorage.setItem('robe-wishlist', JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title || product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const { data: session } = useSession();
  const { openChat } = useChat();
  const sellerId = product.seller?._id || product.seller;
  const sellerName = product.seller?.name || 'Seller';
  const isOwnListing = session?.user?.id === sellerId;

  const handleChatSeller = () => {
    if (!sellerId) return;
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (isOwnListing) return;
    openChat(sellerId, sellerName);
  };

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.title || product.name} - Robe Market</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.title || product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={images[0]} />
        <meta property="og:url" content={`https://robemarket.com/product/${product._id || product.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/classifieds" className="hover:text-blue-600">Marketplace</Link>
            <span>/</span>
            <span className="text-slate-900">{product.title || product.name}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
              <OptimizedImage
                src={images[selectedImage] || '/api/placeholder/600/600'}
                alt={product.title || product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-blue-500' : 'border-slate-200'
                    }`}
                  >
                    <OptimizedImage
                      src={image}
                      alt={`${product.title || product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {categoryLabel}
                  </span>
                  {product.verified && (
                    <span className="inline-flex items-center ml-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <button
                  onClick={handleShare}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {product.title || product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-slate-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-slate-600 ml-1">
                    {avgRating > 0 ? `${avgRating.toFixed(1)} (${ratings.length} reviews)` : 'No reviews yet'}
                  </span>
                </div>
              </div>

              <div className="text-3xl font-bold text-slate-900 mb-4">
                {product.price?.toLocaleString()} ETB
              </div>

              {product.condition && (
                <p className="text-sm text-slate-600 mb-4">
                  Condition: <span className="font-medium">{product.condition}</span>
                </p>
              )}

              {product.location && (
                <p className="text-sm text-slate-600 mb-4">
                  Location: <span className="font-medium">{product.location}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Quantity:</label>
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-4 py-2 text-slate-900 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1-5m1.1 5l1.1 5M9 21h6m-3-3v3" />
                  </svg>
                  Add to Cart
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-lg border transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <svg className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Contact Seller
              </a>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Seller Information</h3>
                <p className="text-slate-600">Sold by: <span className="font-medium">{sellerName}</span></p>
                <p className="text-sm text-slate-500 mt-1">Contact via WhatsApp for more details</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* This would be populated with related products in a real implementation */}
            <div className="text-center text-slate-500 py-8">
              Related products would be displayed here
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
