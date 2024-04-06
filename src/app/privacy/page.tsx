import Navigation from "@/components/navbar";
import Privacy from "@/components/privacy"
import Footer from "@/components/footer";
import {getLanguage} from "@/utils/language";

export default async function Page() {
  const data = await getLanguage();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <Privacy navbar={data.navbar} language={data.language}/>
      <Footer footer={data.footer}/>
    </main>
  );
}