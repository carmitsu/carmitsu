import type {Metadata} from "next";
import "./main.css";
import {Providers} from "./providers";
import {Toaster} from "sonner";
import React from "react";
import {getLanguage} from "@/utils/language";
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

export default function RootLayout({children,}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='dark scroll-smooth'>
    <body>
    <Providers>
      {children}
    </Providers>
    </body>
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
    </html>
  );
}
