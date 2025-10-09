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
    serverActions: true,
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