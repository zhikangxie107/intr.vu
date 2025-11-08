// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false, // Disable app/ directory
    /* config options here */
  },
  reactCompiler: true,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:5000/api/:path*' },
    ];
  },
};

export default nextConfig;
