import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@startup-stack/catalog",
    "@startup-stack/workspace-gen",
  ],
  serverExternalPackages: ["archiver"],
};

export default nextConfig;
