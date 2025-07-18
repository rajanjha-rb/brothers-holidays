import type { NextConfig } from "next";
// Add bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = withBundleAnalyzer(nextConfig);
