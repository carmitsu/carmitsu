import type {Metadata} from "next";
import "./main.css";
import {Providers} from "./providers";
import {Toaster} from "sonner";
import React from "react";
import {getLanguage} from "@/utils/language";
import {LanguageProvider} from "@/contexts/LanguageContext";
import Script from "next/script";
const metaLang = await getLanguage();

export const metadata: Metadata = {
  title: {
    default: "CarMitsu",
    template: "%s | CarMitsu",
  },
  description: metaLang.seo?.description,
  twitter: {
    card: "summary_large_image",
    description: metaLang.seo?.description,
  },
  openGraph: {
    title: "CarMitsu",
    description: metaLang.seo?.description,
    url: process.env.BASE_URL,
    type: "website",
    locale: metaLang?.language,
    images: [
      {
        url: `${process.env.BASE_URL}/images/og-image.png`,
        width: 1280,
        height: 720,
        alt: "CarMitsu",
      }
    ]
  },
};

export default async function RootLayout({children,}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getLanguage();

  return (
    <html lang="en" className='dark scroll-smooth'>
      <head>
        <Script
          id="cloudflare-analytics"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({token: process.env.ANALYTICS || ""})}
        />
      </head>
      <body>
        <Providers>
          <LanguageProvider language={data.language as 'pl' | 'en'} data={data}>
            {children}
          </LanguageProvider>
        </Providers>
        <Toaster
          expand={false}
          position="top-center"
          toastOptions={{
            classNames: {
              success: 'bg-success-400 text-gray-900 border border-0',
              error: 'bg-danger-400 text-gray-900 border border-0',
              warning: 'bg-warning-400 text-gray-900 border border-0',
            },
          }}
        />
      </body>
    </html>
  );
}
