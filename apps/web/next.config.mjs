import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
});

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
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withSerwist(nextConfig);
