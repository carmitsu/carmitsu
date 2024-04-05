import type { Metadata } from "next";
import "./main.css";
import lang from "@/utils/lang/en.json";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
