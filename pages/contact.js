import Head from 'next/head';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us - Robe Market | Get Help & Support</title>
        <meta name="description" content="Need help with orders or product details? Contact Robe Market support team. WhatsApp support available. Delivery service in Robe town and surrounding areas." />
        <meta name="keywords" content="contact robe market, customer support, whatsapp support, delivery area, robe ethiopia" />
        <meta property="og:title" content="Contact Us - Robe Market" />
        <meta property="og:description" content="Get help with orders, products, and delivery in Robe town. Fast WhatsApp support available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://robe-market.com/contact" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Robe Market Support" />
        <meta name="twitter:description" content="Need help? Contact our support team via WhatsApp for fast assistance." />
        <link rel="canonical" href="https://robe-market.com/contact" />
      </Head>

      <div className="max-w-3xl mx-auto space-y-6">
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Contact us</h1>
        <p className="mt-2 text-slate-600">Need help with orders or product details? Send us a message and we’ll respond quickly.</p>
      </section>
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <p className="text-slate-700">WhatsApp support:</p>
        <a href="https://wa.me/251900000000" className="text-indigo-700 font-semibold">+251 900 000 000</a>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-slate-600">Delivery service area:</p>
          <p className="mt-2 text-slate-900">Robe town, surrounding neighborhoods, and nearby routes.</p>
          <div className="mt-4 h-64 rounded-3xl overflow-hidden bg-slate-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31500.000000000002!2d39.6261!3d7.0500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17bdf4f7f2d3f5f1%3A0x0000000000000000!2sRobe%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1700000000000"
              className="h-full w-full"
              allowFullScreen=""
              loading="lazy"
              title="Robe location"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
