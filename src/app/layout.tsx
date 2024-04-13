import type {Metadata} from "next";
import "./main.css";
import lang from "../../public/lang/en.json";
import {Providers} from "./providers";
import {Toaster} from "sonner";

export const metadata: Metadata = {
  title: "CarMitsu",
  description: lang.description,
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
