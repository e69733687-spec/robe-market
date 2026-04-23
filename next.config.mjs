/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // output: 'export' // Commented out so API Routes can work in development and normal server mode.
};

export default nextConfig;
