'use client';
import Image from "next/image";
import {Button} from "@nextui-org/button";
import {Link} from "@nextui-org/link";
import {useLanguage} from "@/contexts/LanguageContext";
import HeroBackground from "/public/images/hero.jpg";

export default function Hero() {
  const {data} = useLanguage();
  const hero = data.hero;

  return (
    <section className="h-dvh relative grid items-center">
      <Image src={HeroBackground} alt="Hero background" fill={true} placeholder={"blur"}
             className="object-center object-cover pointer-events-none blur-sm brightness-50"/>
      <div className="text-center z-1 relative flex items-center flex-col">
        <div className="relative bottom-5 grid  gap-6 md:gap-12 justify-items-center">
          <div className="">
            <h1 className="text-7xl md:text-9xl font-medium tracking-tight">{hero?.title}</h1>
            <p className="text-lg md:text-xl">{hero?.subtitle}</p>
          </div>
          <p className="text-4xl font-semibold">{hero?.phone}</p>
          <div className="text-xl flex flex-col items-center space-y-4 w-[90%]">
            <p>{hero?.description[0]}</p>
            <div className="grid md:grid-cols-3 gap-6 w-full space-y-2 md:space-y-0 max-w-64 md:max-w-none">
              <p className="bg-default-100 rounded-lg p-2 text-nowrap">{hero?.description[1][0]}</p>
              {/*<span className="hidden md:block w-2">|</span>*/}
              <p className="bg-default-100 rounded-lg p-2 text-nowrap">{hero?.description[1][1]}</p>
              {/*<span className="hidden md:block w-2">|</span>*/}
              <p className="bg-default-100 rounded-lg p-2 text-nowrap">{hero?.description[1][2]}</p>
            </div>
          </div>
        </div>
        <Button size="lg" color="primary" variant="flat" className="relative sm:top-40" href="#About"
                as={Link}>{hero?.button}</Button>
      </div>
    </section>
  );
}
