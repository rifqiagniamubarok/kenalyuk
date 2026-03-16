/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimized for Indonesian market - mid-range Android devices
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
