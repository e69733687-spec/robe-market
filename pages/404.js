import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - Robe Market</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Robe Market homepage." />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="text-9xl font-bold text-slate-300 mb-4">404</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Page Not Found</h1>
            <p className="text-slate-600 mb-8">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/" 
              className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
            
            <div className="text-sm text-slate-500">
              <p>Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}