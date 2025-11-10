import type { NextConfig } from 'next';

// Detect build mode
const isStaticExport = process.env.BUILD_MODE === 'static';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // For GitHub Pages with custom domain, use root-relative paths
  ...(isStaticExport && {
    basePath: '',  // Empty basePath for custom domain
  }),

  // Static export for GitHub Pages
  ...(isStaticExport && {
    output: 'export',
    images: {
      unoptimized: true,
    },
    // Disable features not supported in static export
    experimental: undefined,
  }),

  // Dynamic features for Vercel (default)
  ...(!isStaticExport && {
    experimental: {
      serverActions: {
        allowedOrigins: ['localhost:9002'],
        bodySizeLimit: '2mb',
      },
    },
  }),

  // Webpack configuration
  webpack: (config, { isServer }) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_BUILD_MODE: isStaticExport ? 'static' : 'dynamic',
  },

  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    unoptimized: isStaticExport,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
