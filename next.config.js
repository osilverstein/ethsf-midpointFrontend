/** @type {import('next').NextConfig} */
//add react.semantic-ui.com to the list of domains that can be loaded from for images
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  images: {
    domains: ['react.semantic-ui.com', 'twitter.com', 'pbs.twimg.com'],
  },
  ...nextConfig,
}