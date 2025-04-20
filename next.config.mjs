/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true, // Modo estrito do React
  output: 'export',
  images: {
    unoptimized: true, // Disable image optimization
  }
};

export default nextConfig;
