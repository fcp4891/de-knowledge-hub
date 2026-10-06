import type { NextConfig } from "next";

const isStatic = process.env.API_MODE === "static";
const basePath = process.env.BASE_PATH ?? "";

if (isStatic && !basePath.startsWith("/")) {
  throw new Error("BASE_PATH es obligatorio cuando API_MODE=static y debe empezar por /.");
}

const nextConfig: NextConfig = {
  ...(isStatic
    ? {
        output: "export" as const,
        trailingSlash: true,
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  env: {
    NEXT_PUBLIC_API_MODE: process.env.API_MODE ?? "hybrid",
    NEXT_PUBLIC_BASE_PATH: isStatic ? basePath : "",
    NEXT_PUBLIC_API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:8000/api/v1",
  },
};

export default nextConfig;
