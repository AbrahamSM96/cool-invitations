import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Dev only: lets phones on the local network open `next dev` through the
  // computer's IP. Without it Next blocks the dev scripts and nothing on the
  // page responds to taps.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.*.*.*', '*.local'],
  cacheComponents: true,
  experimental: {
    // Photos are shrunk in the browser first; 4 MB leaves room to spare and
    // stays under Vercel's 4.5 MB request limit.
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: {
    // Event photos live in our R2 bucket; older events may use other hosts.
    remotePatterns: [{ hostname: '**', protocol: 'https' }],
  },
  partialPrefetching: true,
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
