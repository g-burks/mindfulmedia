//next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
    async rewrites() {
        const backend = process.env.BACKEND_URL;
        return backend
        ? [
            {
                source: '/api/:path*',
                destination: `${process.env.BACKEND_URL}/api/:path*`
            },
          ]
        : [];
    },
}