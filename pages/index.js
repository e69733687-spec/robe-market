import Head from 'next/head';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import CourseCard from '../components/elearning/CourseCard';
import OptimizedImage from '../components/OptimizedImage';
import { getCategoryLabel } from '../lib/formatters';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

const browseCategories = [
  { name: 'Mobile Phones', count: 627, icon: '📱', href: '/classifieds?category=Mobile Phones' },
  { name: 'Laptops', count: 238, icon: '💻', href: '/classifieds?category=Laptops' },
  { name: 'Electronics', count: 411, icon: '📺', href: '/classifieds?category=Electronics' },
  { name: 'Fashion', count: 1453, icon: '👗', href: '/classifieds?category=Fashion' },
  { name: 'Vehicles', count: 782, icon: '🏍️', href: '/classifieds?category=Vehicles' },
  { name: 'Real Estate', count: 1866, icon: '🏠', href: '/classifieds?category=Real Estate' },
  { name: 'Home Appliances', count: 3141, icon: '🧊', href: '/classifieds?category=Home Appliances' },
  { name: 'Services', count: 553, icon: '🛠️', href: '/classifieds?category=Services' },
  { name: 'Pharmacy & Drugs', count: 0, icon: '💊', href: '/pharmacy' },
  { name: 'Hotel & Food', count: 0, icon: '🏨', href: '/hotels' },
  { name: 'Tailor & Clothing', count: 0, icon: '👔', href: '/tailor' },
  { name: 'General Store', count: 0, icon: '🏪', href: '/general-store' }
];

const popularSearches = [
  'iPhone 17 Pro Max',
  'HP Laptop',
  'Samsung Galaxy S25 Ultra',
  'Apartment',
  'Motorbike',
  'Traditional Robe'
];

const banners = [
  {
    id: 1,
    title: 'New Arrivals',
    subtitle: 'Discover the latest products',
    image: '/api/placeholder/800/300',
    link: '/classifieds'
  },
  {
    id: 2,
    title: 'Special Offers',
    subtitle: 'Up to 50% off on selected items',
    image: '/api/placeholder/800/300',
    link: '/classifieds?category=Electronics'
  },
  {
    id: 3,
    title: 'Premium Quality',
    subtitle: 'Shop with confidence',
    image: '/api/placeholder/800/300',
    link: '/classifieds'
  }
];

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', location: '', condition: '' });
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [courses, setCourses] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);

      const courseRes = await fetch('/api/courses');
      const courseData = await courseRes.json();
      setCourses(courseData.courses || []);
    }
    load();

    // Load recently viewed from localStorage
    const viewed = JSON.parse(localStorage.getItem('robe-recently-viewed') || '[]');
    setRecentlyViewed(viewed.slice(0, 6)); // Show only 6 recent items

    // Banner carousel
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('Listening for a category or product phrase...');
      };

      rec.onend = () => {
        setIsListening(false);
        setVoiceFeedback('Tap the mic and speak now.');
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event?.error || event);
        setIsListening(false);
        setVoiceFeedback('Voice search is not available right now.');
      };

      rec.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (!transcript) {
          setVoiceFeedback('No speech was captured. Try again.');
          return;
        }
        setSearch(transcript);
        handleVoiceResult(transcript);
      };

      setVoiceSupported(true);
      recognitionRef.current = rec;
    }

    const queryCategory = typeof router.query.category === 'string' ? router.query.category : '';
    const querySearch = typeof router.query.search === 'string' ? router.query.search : '';
    if (queryCategory || querySearch) {
      setFilters((prev) => ({ ...prev, category: queryCategory }));
      setSearch(querySearch);
    }

    return () => {
      clearInterval(bannerInterval);
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.warn('Error aborting recognition on cleanup', error);
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const startVoiceSearch = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setVoiceFeedback('Voice search is not supported in this browser.');
      return;
    }
    if (isListening) {
      setVoiceFeedback('Voice search is already active. Please wait for it to finish.');
      return;
    }
    try {
      rec.start();
    } catch (error) {
      console.error('Speech recognition start error:', error);
      setVoiceFeedback('Voice search failed to start. Please try again.');
    }
  };

  const handleVoiceResult = (transcript) => {
    const normalized = transcript?.trim();
    if (!normalized) {
      setVoiceFeedback('No speech detected. Please speak a category or item name.');
      return;
    }

    const voiceCategories = [
      { name: 'Pharmacy', route: '/pharmacy' },
      { name: 'Hotel', route: '/hotels' },
      { name: 'Clothes', route: '/tailor' },
      { name: 'Tailor', route: '/tailor' },
      { name: 'General Store', route: '/general-store' },
      { name: 'Electronics', route: '/classifieds?category=Electronics' },
      { name: 'Fashion', route: '/classifieds?category=Fashion' },
      { name: 'Vehicles', route: '/classifieds?category=Vehicles' },
      { name: 'Real Estate', route: '/classifieds?category=Real Estate' },
      { name: 'Home Appliances', route: '/classifieds?category=Home Appliances' },
      { name: 'Services', route: '/classifieds?category=Services' },
      { name: 'Books', route: '/classifieds?category=Books' }
    ];

    const match = voiceCategories.find((category) => normalized.toLowerCase().includes(category.name.toLowerCase()));
    if (match) {
      setVoiceFeedback(`Voice search recognized category: ${match.name}`);
      router.push(match.route);
      return;
    }

    setVoiceFeedback(`Voice search recognized: ${normalized}`);
    router.push(`/classifieds?search=${encodeURIComponent(normalized)}`);
  };

  const goSearch = () => {
    const trimmed = search.trim();
    if (trimmed.length > 0) {
      router.push(`/classifieds?search=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push('/classifieds');
  };

  // const filtered = useMemo(() => {
  //   return products.filter((product) => {
  //     const matchesCategory = filters.category ? product.category === filters.category : true;
  //     const matchesSearch =
  //       search.trim().length === 0 ||
  //       product.name.toLowerCase().includes(search.toLowerCase()) ||
  //       product.description.toLowerCase().includes(search.toLowerCase()) ||
  //       product.category.toLowerCase().includes(search.toLowerCase());
  //     const matchesMin = filters.minPrice ? product.price >= Number(filters.minPrice) : true;
  //     const matchesMax = filters.maxPrice ? product.price <= Number(filters.maxPrice) : true;
  //     const matchesLocation = filters.location ? product.location === filters.location : true;
  //     const matchesCondition = filters.condition ? product.condition === filters.condition : true;
  //     return matchesCategory && matchesSearch && matchesMin && matchesMax && matchesLocation && matchesCondition;
  //   });
  // }, [products, filters, search]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryLabel = getCategoryLabel(product.category).toLowerCase();
      const matchesCategory = filters.category ? getCategoryLabel(product.category) === filters.category : true;
      const matchesSearch = normalizedSearch.length === 0 ||
        (product.name || '').toLowerCase().includes(normalizedSearch) ||
        (product.description || '').toLowerCase().includes(normalizedSearch) ||
        categoryLabel.includes(normalizedSearch);
      const matchesMin = filters.minPrice ? product.price >= Number(filters.minPrice) : true;
      const matchesMax = filters.maxPrice ? product.price <= Number(filters.maxPrice) : true;
      const matchesLocation = filters.location ? product.location === filters.location : true;
      const matchesCondition = filters.condition ? product.condition === filters.condition : true;
      return matchesCategory && matchesSearch && matchesMin && matchesMax && matchesLocation && matchesCondition;
    });
  }, [products, filters, search]);

  const trending = filtered.slice(0, 6);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('robe-cart') || '[]');
    const existing = cart.find((item) => item.id === product.id);
    if (!existing) {
      localStorage.setItem('robe-cart', JSON.stringify([...cart, { ...product, quantity: 1 }]));
      setMessage('Added to cart');
      window.dispatchEvent(new Event('robe-cart-updated'));
    } else {
      setMessage('Product already in cart');
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!session) {
      setMessage('Please sign in to add items to your wishlist');
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id || product.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Added to wishlist');
        window.dispatchEvent(new Event('robe-wishlist-updated'));
      } else {
        setMessage(data.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      setMessage('Failed to add to wishlist');
    }
  };

  return (
    <>
      <Head>
        <title>Robe Market - Premium Ethiopian Marketplace & E-Learning Platform</title>
        <meta name="description" content="Discover premium classifieds, courses, and marketplace in Ethiopia. Buy, sell, and learn with Robe Market - your trusted digital platform." />
      </Head>

      {/* Hero Section with Search */}
      <section className="hero-section relative overflow-hidden py-16 md:py-24 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-orange-600 to-black opacity-95"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="hero-title font-bold tracking-tight">
              Welcome to <span className="text-orange-200">Robe Market</span>
            </h1>
            <p className="hero-subtitle mx-auto mt-6 max-w-2xl text-gray-100">
              Ethiopia's premier marketplace for buying, selling and learning. Discover trusted products, local offers and expert-led courses.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <div className="search-container">
              <div className="flex flex-col gap-3 rounded-full bg-white p-3 sm:flex-row sm:items-center sm:px-4">
                <div className="flex flex-1 items-center gap-3 px-4 py-3 rounded-full bg-white shadow-sm">
                  <svg className="icon-responsive text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for products, services, or courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-black placeholder-slate-500 outline-none"
                  />
                </div>
                <button
                  onClick={startVoiceSearch}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                  aria-label="Start voice search"
                >
                  <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  onClick={goSearch}
                  className="btn-primary inline-flex items-center justify-center px-8 py-3 text-sm font-semibold"
                >
                  Search
                </button>
              </div>
              {voiceFeedback && (
                <p className="mt-2 text-sm text-orange-200">{voiceFeedback}</p>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="professional-card p-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900">Secure purchases</h3>
              <p className="mt-2 text-sm text-gray-600">Verified sellers, secure checkout and fast local delivery.</p>
            </div>
            <div className="professional-card p-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900">Fast local discovery</h3>
              <p className="mt-2 text-sm text-gray-600">Search nearby listings with smart filters and save favorites.</p>
            </div>
            <div className="professional-card p-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900">Expert-led courses</h3>
              <p className="mt-2 text-sm text-gray-600">Track progress, watch lessons, and earn completion certificates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden professional-card">
            <div className="relative h-64 sm:h-80">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentBanner ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex h-full items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-black sm:text-3xl">{banner.title}</h2>
                      <p className="mt-2 text-slate-600">{banner.subtitle}</p>
                      <Link
                        href={banner.link}
                        className="btn-primary mt-4 inline-block"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentBanner ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Shop by Category</h2>
            <p className="mt-4 text-lg text-slate-600">Find exactly what you're looking for</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {browseCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-orange-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-sm text-orange-700 group-hover:bg-orange-100 transition-colors">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black group-hover:text-orange-700 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500">{category.count} items</p>
                  </div>
                </div>
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="h-5 w-5 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="mt-4 text-lg text-gray-600">Handpicked items just for you</p>
            </div>
            <Link
              href="/classifieds"
              className="btn-primary"
            >
              View All →
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
            <p className="mt-4 text-lg text-gray-600">Most popular items this week</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product, index) => (
              <div key={product._id || product.id} className="professional-card group relative overflow-hidden transition-all hover:shadow-lg">
                <div className="relative">
                  <div className="aspect-video overflow-hidden">
                    <OptimizedImage
                      src={product.images?.[0] || product.image || '/api/placeholder/400/300'}
                      alt={product.title || product.name}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute top-3 left-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
                    #{index + 1}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title || product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{getCategoryLabel(product.category)}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {product.price?.toLocaleString()} ETB
                    </span>
                    <Link
                      href={`/product/${product._id || product.id}`}
                      className="btn-primary text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Recently Viewed</h2>
                <p className="mt-4 text-lg text-gray-600">Continue where you left off</p>
              </div>
              <Link
                href="/classifieds"
                className="btn-primary"
              >
                View All →
              </Link>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyViewed.map((product) => (
                <div key={product._id || product.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-lg hover:ring-blue-200">
                  <div className="relative">
                    <div className="aspect-video overflow-hidden">
                      <OptimizedImage
                        src={product.images?.[0] || product.image || '/api/placeholder/400/300'}
                        alt={product.title || product.name}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{product.title || product.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{getCategoryLabel(product.category)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">
                        {product.price?.toLocaleString()} ETB
                      </span>
                      <Link
                        href={`/product/${product._id || product.id}`}
                        className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* E-Learning Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Learn & Grow</h2>
              <p className="mt-4 text-lg text-slate-600">Expand your knowledge with expert-led courses</p>
            </div>
            <Link
              href="/courses"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Browse Courses →
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <div key={course._id} className="site-card group relative overflow-hidden transition-all hover:shadow-lg hover:ring-blue-200">
                <div className="aspect-video overflow-hidden">
                  <OptimizedImage
                    src={course.thumbnail || '/api/placeholder/400/225'}
                    alt={course.title}
                    width={400}
                    height={225}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">by {course.instructor?.name || course.instructor}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      {course.price} ETB
                    </span>
                    <Link
                      href={`/student/course/${course._id}`}
                      className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start Selling?</h2>
          <p className="mt-4 text-xl text-blue-100">Join thousands of sellers on Robe Market</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              href="/vendor-dashboard"
              className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Post Your First Ad
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  // Temporarily disable redirects to prevent loops
  /*
  if (session) {
    if (session.user.role === 'admin') {
      return {
        redirect: {
          destination: '/admin/dashboard',
          permanent: false,
        },
      };
    }
    if (session.user.role === 'student') {
      return {
        redirect: {
          destination: '/student/dashboard',
          permanent: false,
        },
      };
    }
    if (session.user.role === 'teacher') {
      return {
        redirect: {
          destination: '/teacher/dashboard',
          permanent: false,
        },
      };
    }
    if (session.user.role === 'seller') {
      return {
        redirect: {
          destination: '/vendor-dashboard',
          permanent: false,
        },
      };
    }
  }
  */
  return {
    props: {},
  };
}
