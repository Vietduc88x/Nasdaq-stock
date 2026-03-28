/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Auth endpoints → Energy Analyst backend (Better Auth)
      {
        source: '/auth-api/:path*',
        destination: 'https://api.techmadeeasy.info/api/auth/:path*',
      },
      // Market API endpoints → Market backend
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://market-api.techmadeeasy.info'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
