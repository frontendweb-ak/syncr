import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,

  images: {
    remotePatterns: [{ protocol: "https", hostname: "*" }],
  },
  /* config options here */
};

export default nextConfig;
