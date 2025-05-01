import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cards.scryfall.io",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/lowest-price/:path*",
        destination: "https://api.gishathfetch.com/:path*",
      },
    ];
  },
};

export default nextConfig;
