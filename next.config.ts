import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // `page.dev.tsx` files (the /dev/components showcase) only count as routes outside production.
  pageExtensions: isProd ? ['tsx', 'ts'] : ['dev.tsx', 'tsx', 'ts'],
  experimental: {
    // Commission reference photos are downscaled in the browser first; Vercel caps bodies at 4.5 MB
    serverActions: { bodySizeLimit: '4.5mb' },
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
