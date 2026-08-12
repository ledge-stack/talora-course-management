/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@talora/domain',
    '@talora/database',
    '@talora/contracts',
    '@talora/auth',
    '@talora/observability',
  ],
};

export default nextConfig;
