import type {Metadata} from "next";
import "./main.css";
import {Providers} from "./providers";
import {Toaster} from "sonner";
import React from "react";
import {getLanguage} from "@/utils/language";
import {LanguageProvider} from "@/contexts/LanguageContext";
import Script from "next/script";

const SITE_ALTERNATES: Record<string, string> = {
  en: "https://carmitsu.com",
  pl: "https://carmitsu.pl",
  sv: "https://carmitsu.se",
  no: "https://carmitsu.no",
};

function normalizeBaseUrl(url: string | undefined): string {
  return url?.replace(/\/$/, "") || "https://carmitsu.pl";
}

function mapLanguageToOgLocale(language: string | undefined): string {
  if (language === "pl") return "pl_PL";
  if (language === "no") return "nb_NO";
  if (language === "sv" || language === "se") return "sv_SE";
  return "en_US";
}

function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  return phone.replace(/\s+/g, "");
}

function normalizeOpeningHours(workingHours: string | undefined): string {
  if (!workingHours) return "Mo-Fr 08:00-16:00";
  const normalized = workingHours.replace(/\s+/g, "");
  if (/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(normalized)) {
    const [open, close] = normalized.split("-");
    return `Mo-Fr ${open.padStart(5, "0")}-${close.padStart(5, "0")}`;
  }
  return "Mo-Fr 08:00-16:00";
}

export async function generateMetadata(): Promise<Metadata> {
  const metaLang = await getLanguage();
  const baseUrl = normalizeBaseUrl(process.env.BASE_URL);

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "CarMitsu",
      template: "%s | CarMitsu",
    },
    description: metaLang.seo?.description,
    alternates: {
      canonical: "/",
      languages: {
        "x-default": SITE_ALTERNATES.pl,
        en: SITE_ALTERNATES.en,
        pl: SITE_ALTERNATES.pl,
        sv: SITE_ALTERNATES.sv,
        no: SITE_ALTERNATES.no,
      },
    },
    twitter: {
      card: "summary_large_image",
      title: "CarMitsu",
      description: metaLang.seo?.description,
      images: ["/images/og-image.png"],
    },
    openGraph: {
      title: "CarMitsu",
      description: metaLang.seo?.description,
      url: baseUrl,
      siteName: "CarMitsu",
      type: "website",
      locale: mapLanguageToOgLocale(metaLang.language),
      images: [
        {
          url: "/images/og-image.png",
          width: 1280,
          height: 720,
          alt: "CarMitsu",
        }
      ]
    },
  };
}

export default async function RootLayout({children,}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getLanguage();
  const baseUrl = normalizeBaseUrl(process.env.BASE_URL);
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoRepair"],
    name: "CarMitsu",
    url: baseUrl,
    image: `${baseUrl}/images/og-image.png`,
    telephone: normalizePhone(data.contact?.phone?.[1]),
    email: data.contact?.email?.[1],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kowalska 12",
      postalCode: "84-208",
      addressLocality: "Dobrzewino",
      addressCountry: "PL",
    },
    openingHours: normalizeOpeningHours(data.contact?.workingHours?.[1]),
  };

  return (
    <html lang={data.language || "en"} className='dark scroll-smooth'>
      <head>
        <Script
          id="cloudflare-analytics"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({token: process.env.ANALYTICS || ""})}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
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
