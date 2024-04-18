import Navigation from "@/components/navbar";
import Footer from "@/components/footer";
import {getLanguage, Lang} from "@/utils/language";
import {getRealizations} from "@/utils/realizations";
import AllRealizations from "@/components/realizations/allRealizations";
import {Metadata} from "next";
const metaLang: Lang = await getLanguage();

export const metadata: Metadata = {
  title: metaLang.seo?.realizations.title,
  description: metaLang.seo?.realizations.description,
};

export default async function Page() {
  const data = await getLanguage();
  const realizationsData =  await getRealizations();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <AllRealizations realizations={data.realizations} realizationsData={realizationsData}/>
      <Footer footer={data.footer}/>
    </main>
  );
}
