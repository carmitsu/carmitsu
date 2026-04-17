import Navigation from "@/components/navbar";
import Privacy from "@/components/privacy"
import Footer from "@/components/footer";
import {Metadata} from "next";
import {getLanguage} from "@/utils/language";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLanguage();
  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "") || "https://carmitsu.pl";
  const title = data.seo?.privacy?.title || "Polityka prywatności";
  const description = data.seo?.privacy?.description;

  return {
    title,
    description,
    alternates: {
      canonical: "/privacy",
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/privacy`,
      type: "website",
    },
  };
}

export default async function Page() {
  return (
    <main>
      <Navigation />
      <Privacy/>
      <Footer />
    </main>
  );
}
