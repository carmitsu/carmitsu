/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n: {
        locales: ['en', 'pl', 'se', 'no'],
        defaultLocale: 'en',
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
};
export default nextConfig;
