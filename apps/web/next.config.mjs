/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bukiebrainjobs/api-types',
    '@bukiebrainjobs/db',
    '@bukiebrainjobs/store',
    '@bukiebrainjobs/types',
    '@bukiebrainjobs/ui',
    '@bukiebrainjobs/utils',
    '@bukiebrainjobs/validation',
  ],
  serverExternalPackages: ['@prisma/client', 'prisma'],
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
