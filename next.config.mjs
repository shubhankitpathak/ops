// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages
  images: {
    unoptimized: true,
  },
  
  // Disable features not supported on Cloudflare
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Initialize OpenNext for local development with Cloudflare bindings
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

export default nextConfig;
