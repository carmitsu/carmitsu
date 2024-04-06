'use server';
import Navigation from "@/components/navbar";
import Hero from "@/components/hero";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import {getLanguage} from "@/utils/language";

export default async function Home() {
  const data = await getLanguage();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <Hero hero={data.hero}/>
      {/*<div className="h-dvh bg-blue-600"></div>*/}
      {/*<div className="h-dvh bg-red-600"></div>*/}
      <Contact contact={data.contact}/>
      <Footer footer={data.footer}/>
    </main>
  );
}
