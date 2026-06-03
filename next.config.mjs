import withPWA from "@ducanh2912/next-pwa";

// 1. OFFLINE INVENTORY ENGINE
const withPWAConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 2. DEV SERVER HMR FIX (Allows your iPad to receive live-reloads)
  allowedDevOrigins: [
    '192.168.18.69',
    '192.168.18.69:3000',
    '192.168.254.91',
    '192.168.254.91:3000'
  ],

  // 3. SECURE SERVER ACTIONS (Allows your iPad to safely mutate data/cart)
  experimental: {
    serverActions: {
      allowedOrigins: [
        '192.168.18.69:3000',
        '192.168.18.69',
        '192.168.254.91:3000',
        '192.168.254.91',
      ],
    },
  },
  
  // 4. HARDWARE ACCELERATED IMAGES
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dtoyfm9xk/**', 
      },
      { 
        protocol: 'https', 
        hostname: '**.supabase.co' 
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default withPWAConfig(nextConfig);