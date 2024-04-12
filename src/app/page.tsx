'use server';
import Navigation from "@/components/navbar";
import Hero from "@/components/hero";
import About from "@/components/about";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import {getLanguage} from "@/utils/language";

export default async function Home() {
  const data = await getLanguage();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <Hero hero={data.hero}/>
      <About about={data.about}/>
      <Contact contact={data.contact}/>
      <Footer footer={data.footer}/>
    </main>
  );
}
