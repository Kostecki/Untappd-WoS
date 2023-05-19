/** @type {import('next').NextConfig} */

// starts a command line process to get the git hash
const commitHash = require("child_process")
  .execSync('git log --pretty=format:"%h" -n1')
  .toString()
  .trim();

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
  env: {
    COMMIT_HASH: commitHash,
  },
};

module.exports = nextConfig;
