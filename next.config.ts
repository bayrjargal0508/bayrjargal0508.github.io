import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // user site: served at https://bayrjargal0508.github.io/ — domain root, no basePath.
  // raw <video>/poster attributes read the prefix from here (next/link and
  // next/image would add it themselves if a basePath ever came back)
  env: { NEXT_PUBLIC_BASE_PATH: "" },
};

export default nextConfig;
