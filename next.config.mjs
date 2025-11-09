// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      { 
        source: "/api/:path((?!auth).*)", destination: 'https://intr-vu.onrender.com/' },
    ];
  },
};

export default nextConfig;
