/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ❌ OJO: Esto hace que el build no falle por errores de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ❌ Esto ignora errores de TS en producción
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
