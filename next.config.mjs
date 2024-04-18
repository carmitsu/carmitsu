/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
    },
    compilerOptions: {
        "target": "esnext",
    }
};
export default nextConfig;
