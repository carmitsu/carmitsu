import Navigation from "@/components/navbar";
import Privacy from "@/components/privacy"
import Footer from "@/components/footer";
import {getLanguage, Lang} from "@/utils/language";
import {Metadata} from "next";
const metaLang: Lang = await getLanguage();

export const metadata: Metadata = {
  title: metaLang.seo?.privacy.title,
  description: metaLang.seo?.privacy.description
};

export default async function Page() {
  const data = await getLanguage();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <Privacy/>
      <Footer footer={data.footer}/>
    </main>
  );
}