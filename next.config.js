/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fixes 'Yjs was already imported' error by enforcing a single instance
    config.resolve.alias.yjs = require.resolve('yjs');
    return config;
  },
};

module.exports = nextConfig;
