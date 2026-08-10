/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bukiebrainjobs/ui',
    '@bukiebrainjobs/store',
    '@bukiebrainjobs/types',
  ],
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
