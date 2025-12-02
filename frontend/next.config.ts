import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
