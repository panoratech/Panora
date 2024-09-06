/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async redirects() {
        return [
            {
                source: '/',
                destination: '/connections',
                permanent: true
            }
        ]
    }
};

export default nextConfig;
