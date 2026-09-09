import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
});

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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default withSerwist(nextConfig);

