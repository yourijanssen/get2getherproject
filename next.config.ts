import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/catalogue/**", search: "" }],
  },
  // Isolate QA builds from a concurrently running development server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Bundle Sharp's matching native Linux libraries in the upload function.
  outputFileTracingIncludes: {
    "/api/admin/uploads": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },
  // Runtime data and manual SQL must never be bundled into a deployment artifact.
  outputFileTracingExcludes: {
    "/api/submissions": ["./data/**/*", "./database/**/*", "./next.config.ts"],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
