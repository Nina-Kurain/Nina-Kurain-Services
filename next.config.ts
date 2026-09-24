import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ninakurainservices.in" }],
        destination: "https://ninakurainservices.in/:path*",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "vip.ninakurainservices.in" }],
        destination: "/feed",
        permanent: false,
      },
      {
        source: "/portfolio",
        destination: "/photos",
        permanent: true,
      },
      {
        source: "/news",
        destination: "/updates",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
