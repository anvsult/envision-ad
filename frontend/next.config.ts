import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/shared/lib/i18n/request.ts');

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
