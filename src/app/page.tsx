import Navigation from "@/components/navbar";
import Hero from "@/components/hero";
import About from "@/components/about";
import Realizations from "@/components/realizations/realizations";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import Parts from "@/components/parts";

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <About />
      <Parts />
      <Realizations />
      <Contact />
      <Footer />
    </main>
  );
}
