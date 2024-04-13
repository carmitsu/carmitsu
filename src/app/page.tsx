'use server';
import Navigation from "@/components/navbar";
import Hero from "@/components/hero";
import About from "@/components/about";
import Realizations from "@/components/realizations";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import {getLanguage} from "@/utils/language";
import {getRealizations} from "@/utils/realizations";

export default async function Home() {
  const data = await getLanguage();
  const images =  await getRealizations();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <Hero hero={data.hero}/>
      <About about={data.about}/>
      <Realizations realizations={data.realizations} realizationImages={images}/>
      <Contact contact={data.contact}/>
      <Footer footer={data.footer}/>
    </main>
  );
}
