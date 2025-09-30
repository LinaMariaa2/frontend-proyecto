/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // fuerza que todas las páginas se procesen dinámicamente
    serverActions: { enabled: true },
  },
  output: "standalone",
  reactStrictMode: false,
};

module.exports = nextConfig;
