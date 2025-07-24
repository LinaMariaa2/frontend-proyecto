/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // La configuración 'domains' está deprecada.
    // Usamos 'remotePatterns' para especificar los dominios permitidos de forma más granular.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yasjwniajgvwkrxyyfrm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', // Asegura que las imágenes de Supabase Storage sean accesibles
      },
      // Si tienes otros dominios de imágenes, agrégalos aquí de forma similar
      // {
      //   protocol: 'https',
      //   hostname: 'otro-dominio.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
};

module.exports = nextConfig;
