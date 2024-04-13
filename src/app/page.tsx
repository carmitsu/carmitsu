'use server';
import Navigation from "@/components/navbar";
import Hero from "@/components/hero";
import About from "@/components/about";
import Realizations from "@/components/realizations/realizations";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import {getLanguage} from "@/utils/language";
import {getRealizations} from "@/utils/realizations";

export default async function Home() {
  const data = await getLanguage();
  const realizationsData =  await getRealizations();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <Hero hero={data.hero}/>
      <About about={data.about}/>
      <Realizations realizations={data.realizations} realizationsData={realizationsData}/>
      <Contact contact={data.contact}/>
      <Footer footer={data.footer}/>
    </main>
  );
}
