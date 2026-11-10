import type { NextConfig } from 'next';
const config: NextConfig = {
  devIndicators: process.env.DANBIKKO_TEST_CATALOG ? false : undefined,
  distDir: process.env.NODE_ENV === 'development' && process.env.DANBIKKO_TEST_CATALOG ? (process.env.DANBIKKO_TEST_DIST ?? '.next-e2e') : '.next',
};
export default config;