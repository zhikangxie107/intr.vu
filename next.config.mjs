// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path((?!auth).*)",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://localhost:5050/api/:path*" // Dev API
            : "https://intr-vu.onrender.com/api/:path*", // Prod API
      },
    ];
  },
};

export default nextConfig;