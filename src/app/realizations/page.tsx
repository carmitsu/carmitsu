'use server';
import Navigation from "@/components/navbar";
import Footer from "@/components/footer";
import {getLanguage} from "@/utils/language";
import {getRealizations} from "@/utils/realizations";
import AllRealizations from "@/components/allRealizations";

export default async function Page() {
  const data = await getLanguage();
  const images = await getRealizations();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <AllRealizations realizationImages={images}/>
      <Footer footer={data.footer}/>
    </main>
  );
}
