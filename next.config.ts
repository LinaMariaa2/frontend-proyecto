/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    appDir: true,
  },
  // 🚨 clave: fuerza todo a render dinámico
  output: "standalone",
  reactStrictMode: false,
};

module.exports = nextConfig;
