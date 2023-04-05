/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.untappd.com",
        port: "",
        pathname: "/site/beer_logos/**",
      },
    ],
  },
};

module.exports = nextConfig;
