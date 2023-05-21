/** @type {import('next').NextConfig} */

// starts a command line process to get the latest git hash
const commitHash = require("child_process")
  .execSync('git log --pretty=format:"%h" -n1')
  .toString()
  .trim();

// starts a command line process to get the latest git commit message
const commitMessage = require("child_process")
  .execSync("git log -1 --pretty=%B")
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
    COMMIT_MESSAGE: commitMessage,
  },
};

module.exports = nextConfig;
