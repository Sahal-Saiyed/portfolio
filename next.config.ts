import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Portfolio images are bundled static assets. Serving them directly keeps
  // local development independent of Cloudflare's ASSETS/IMAGES bindings.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
