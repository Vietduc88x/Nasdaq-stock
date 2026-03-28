/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://market-api.techmadeeasy.info'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
