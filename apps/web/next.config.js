/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.platform === 'win32' ? {} : { output: 'standalone' }),
};

module.exports = nextConfig;
