/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // ESTE HOSTNAME DEBE COINCIDIR EXACTAMENTE CON EL DE TU SUPABASE_URL:
        hostname: 'yasjwniajgvwkrxyyfrm.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // ... resto de tu configuración
  experimental: {
    serverActions: {}, // CAMBIO: de 'true' a un objeto vacío para cumplir con la API de Next.js
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
};

module.exports = nextConfig;
