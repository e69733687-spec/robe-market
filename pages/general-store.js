import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSession } from 'next-auth/react';
import { getCategoryLabel } from '../lib/formatters';

export default function GeneralStore({ products, totalPages, currentPage }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleFilter = (filters) => {
    setLoading(true);
    let filtered = products.filter(product => {
      const productCategory = getCategoryLabel(product.category);
      if (filters.category && productCategory !== filters.category) return false;
      if (filters.minPrice && product.price < filters.minPrice) return false;
      if (filters.maxPrice && product.price > filters.maxPrice) return false;
      if (filters.location && !product.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      return true;
    });
    setFilteredProducts(filtered);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>General Store - Engocha Marketplace</title>
        <meta name="description" content="Find other shopping needs on Engocha Marketplace" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🏪</div>
              <div>
                <h1 className="text-3xl font-bold">General Store</h1>
                <p className="text-orange-100">Other shopping needs and general products</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <FilterPanel onFilter={handleFilter} />
            </div>

            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  General Store Products ({filteredProducts.length})
                </h2>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                    Sort by Price
                  </button>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                    Sort by Date
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-lg text-gray-600">Loading products...</div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <div className="text-6xl text-gray-300">🏪</div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">No general store products found</h3>
                  <p className="mt-2 text-gray-600">Check back later for new general shopping products.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => router.push(`/general-store?page=${page}`)}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          page === currentPage
                            ? 'bg-orange-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export async function getServerSideProps({ query }) {
  try {
    const page = parseInt(query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const { connectToDatabase } = await import('../lib/database/connect');
    const { db } = await connectToDatabase();

    const products = await db
      .collection('products')
      .find({ category: 'General Store' })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();

    const totalProducts = await db.collection('products').countDocuments({ category: 'General Store' });
    const totalPages = Math.ceil(totalProducts / limit);

    return {
      props: {
        products: JSON.parse(JSON.stringify(products)),
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error('Error fetching general store products:', error);
    return {
      props: {
        products: [],
        totalPages: 0,
        currentPage: 1,
      },
    };
  }
}