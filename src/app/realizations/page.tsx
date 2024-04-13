'use server';
import Navigation from "@/components/navbar";
import Footer from "@/components/footer";
import {getLanguage} from "@/utils/language";
import {getRealizations} from "@/utils/realizations";
import AllRealizations from "@/components/allRealizations";
import Realizations from "@/components/realizations";

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
