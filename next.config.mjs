/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n: {
        locales: ['en', 'pl', 'se', 'no'],
        defaultLocale: 'en',
        localeDetection: false,
        domains: [
            {
                domain: 'carmitsu.com',
                defaultLocale: 'en',
            },
            {
                domain: 'carmitsu.pl',
                defaultLocale: 'pl',
            },
            {
                domain: 'carmitsu.se',
                defaultLocale: 'se',
            },
            {
                domain: 'carmitsu.no',
                defaultLocale: 'no',
            },
        ],
    },
    images: {
        formats: ['image/avif', 'image/webp'],
    },
};
export default nextConfig;
