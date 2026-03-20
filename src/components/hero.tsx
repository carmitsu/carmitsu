'use client';
import Image from "next/image";
import {Button} from "@nextui-org/button";
import {Link} from "@nextui-org/link";
import {useLanguage} from "@/contexts/LanguageContext";
import HeroBackground from "/public/images/hero.jpg";

export default function Hero() {
  const { data } = useLanguage();
  const hero = data.hero;
  
  return (
    <section className="h-dvh relative grid items-center">
      <Image src={HeroBackground} alt="Hero background" fill={true} placeholder={"blur"}
             className="object-center object-cover pointer-events-none blur-sm brightness-50"/>
      <div className="text-center z-1 relative">
        <div className="relative bottom-5">
          <h1 className="text-7xl md:text-9xl font-medium tracking-tight">{hero?.title}</h1>
          <p className="text-lg md:text-xl">{hero?.subtitle}</p>
        </div>
        <Button size="lg" color="primary" variant="flat" className="relative top-48" href="#About" as={Link}>{hero?.button}</Button>
      </div>
    </section>
  );
}
