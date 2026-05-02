/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Removed eslint block (Deprecated)
  // 2. Removed typescript block (Deprecated in favor of CLI flags)
  
  experimental: {
    serverActions: {
      allowedOrigins: [
        '192.168.18.69:3000',
        '192.168.18.69',
      ],
    },
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dtoyfm9xk/**', 
      },
    ],
  },
};

export default nextConfig;