import type { Metadata } from "next";
import "./main.css";
import lang from "@/utils/lang/en.json";
import {Providers} from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "CarMitsu",
  description: lang.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='light scroll-smooth'>
    <body>
      <Providers>
        {children}
      </Providers>
    </body>
    <Toaster expand={false} position="top-center" richColors/>
    </html>
  );
}
