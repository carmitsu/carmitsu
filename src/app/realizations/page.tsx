import Navigation from "@/components/navbar";
import Footer from "@/components/footer";
import AllRealizations from "@/components/realizations/allRealizations";
import {Metadata} from "next";
import {getLanguage} from "@/utils/language";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLanguage();
  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "") || "https://carmitsu.pl";
  const title = data.seo?.realizations?.title || "Realizations";
  const description = data.seo?.realizations?.description;

  return {
    title,
    description,
    alternates: {
      canonical: "/realizations",
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/realizations`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function Page() {
  return (
    <main>
      <Navigation />
      <AllRealizations />
      <Footer />
    </main>
  );
}
