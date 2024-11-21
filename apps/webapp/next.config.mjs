/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    output: 'standalone',
    outputFileTracingRoot: path.join(__dirname, '../../'),
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