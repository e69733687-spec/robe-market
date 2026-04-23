import Link from 'next/link';

const categories = [
  { name: 'Mobile Phones', href: '/classifieds?category=mobile' },
  { name: 'Laptops & Computers', href: '/classifieds?category=laptops' },
  { name: 'Electronics', href: '/classifieds?category=electronics' },
  { name: 'Fashion & Clothing', href: '/classifieds?category=fashion' },
  { name: 'Real Estate', href: '/classifieds?category=real-estate' },
  { name: 'Vehicles', href: '/classifieds?category=vehicles' },
  { name: 'Home & Garden', href: '/classifieds?category=home' },
  { name: 'Services', href: '/classifieds?category=services' }
];

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Marketplace', href: '/classifieds' },
  { label: 'Post Ad', href: '/listing/add' },
  { label: 'Vendor Dashboard', href: '/vendor-dashboard' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Help Center', href: '/help' }
];

const supportLinks = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Safety Guidelines', href: '/safety' },
  { label: 'FAQ', href: '/faq' }
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { name: 'Twitter', href: '#', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
  { name: 'Instagram', href: '#', icon: 'M12.017 0C8.396 0 7.966.021 6.675.07 5.385.118 4.663.26 4.035.478c-.664.236-1.23.55-1.797.984A4.945 4.945 0 00.98 2.457C.74 3.085.598 3.807.55 5.097.502 6.388.48 6.818.48 10.439c0 3.621.022 4.051.07 5.342.048 1.29.19 2.012.408 2.64.236.664.55 1.23.984 1.797a4.945 4.945 0 001.795.984c.628.218 1.35.36 2.64.408 1.291.048 1.721.07 5.342.07 3.621 0 4.051-.022 5.342-.07 1.29-.048 2.012-.19 2.64-.408.664-.236 1.23-.55 1.797-.984a4.945 4.945 0 00.984-1.795c.218-.628.36-1.35.408-2.64.048-1.291.07-1.721.07-5.342 0-3.621-.022-4.051-.07-5.342-.048-1.29-.19-2.012-.408-2.64-.236-.664-.55-1.23-.984-1.797A4.945 4.945 0 0019.543.98c-.628-.218-1.35-.36-2.64-.408C16.252.021 15.822 0 12.201 0h-.184zM12.017 2.4a9.639 9.639 0 019.639 9.639c0 5.33-4.309 9.639-9.639 9.639A9.639 9.639 0 012.378 12.04C2.378 6.71 6.687 2.4 12.017 2.4zm0 15.927a6.288 6.288 0 100-12.576 6.288 6.288 0 000 12.576zm9.917-14.916a2.288 2.288 0 11-4.576 0 2.288 2.288 0 014.576 0z' },
  { name: 'WhatsApp', href: 'https://wa.me/251900000000', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' }
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-black text-lg font-bold text-white">
                R
              </div>
              <div>
                <p className="text-lg font-bold text-white">Robe Market</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Ethiopia's Marketplace</p>
              </div>
            </Link>

            <p className="text-slate-300 leading-relaxed mb-6">
              Your trusted local marketplace for buying and selling in Ethiopia. Connect with sellers, discover great deals, and grow your business.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+251900000000" className="text-orange-400 hover:text-orange-300 transition-colors">
                  +251 900 000 000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@robemarket.et" className="text-orange-400 hover:text-orange-300 transition-colors">
                  info@robemarket.et
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Browse Categories</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-slate-300 hover:text-orange-400 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Social */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 mb-6">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="text-sm text-slate-400">
              <p>© 2024 Robe Market. All rights reserved.</p>
              <p className="mt-1">Powered by local commerce for Ethiopia 🇪🇹</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Developed by Endashaw</span>
              <span>•</span>
              <span>Made with ❤️ in Ethiopia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
