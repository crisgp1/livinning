import type { NextConfig } from "next";
import { withHighlightConfig } from "@highlight-run/next/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cx2s2mkrnifobgqx.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
    ],
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
      bodySizeLimit: '2mb'
    }
  },
  webpack: (config, { dev, isServer }) => {
    // SVG handling for regular webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  serverExternalPackages: ['winston', 'winston-daily-rotate-file', 'pino', 'pino-pretty', '@highlight-run/node', 'require-in-the-middle'],
};

export default withHighlightConfig(nextConfig);
