import type { NextConfig } from "next";

// Static export (D-02): `next build` writes the whole site to out/.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
