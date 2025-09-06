import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true,
    qualities: [25, 50, 75, 100],
  },
};

export default nextConfig;
