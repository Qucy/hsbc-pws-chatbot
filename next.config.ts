import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    USER_ACCOUNTS: process.env.USER_ACCOUNTS,
  },
};

export default nextConfig;
