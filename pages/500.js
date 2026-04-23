import Head from 'next/head';
import Link from 'next/link';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>Server Error - Robe Market</title>
        <meta name="description" content="We're experiencing technical difficulties. Please try again later." />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="text-8xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-8">
              We're experiencing technical difficulties on our end. Our team has been notified and is working to fix the issue.
            </p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            
            <Link 
              href="/" 
              className="inline-block w-full bg-white text-slate-700 px-6 py-3 rounded-2xl font-semibold border border-slate-300 hover:bg-slate-50 transition-colors"
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