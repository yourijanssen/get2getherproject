import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate QA builds from a concurrently running development server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Runtime data and manual SQL must never be bundled into a deployment artifact.
  outputFileTracingExcludes: {
    "/api/submissions": ["./data/**/*", "./database/**/*", "./next.config.ts"],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
