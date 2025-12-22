/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routesのみ使用するため、ページは不要
  experimental: {
    appDir: false,
  },
};

module.exports = nextConfig;
