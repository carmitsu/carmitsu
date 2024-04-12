'use client';
import Services from "@/components/services";
import Image from "next/image";
import aboutImage from "@/components/images/about.jpeg";
import {Skeleton} from "@nextui-org/react";
import {useState} from "react";
import {Lang} from "@/utils/language";

export default function About({about}: Lang) {
  const [isAboutImage, setAboutImage] = useState(false);

  return (
    <section className="px-6 md:px-14 mt-20 flex flex-col items-center space-y-16" id="About">
      <div className="grid row-end-12 md:grid-cols-2 gap-4 max-md:grid-rows-2 container">
        <div className="space-y-6 md:my-8 lg:my-14">
          <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl max-w-[34rem] leading-[3.5rem]">{about?.about.title}</h1>
          <div className="space-y-2">
            <p className="lg:max-w-[40rem]">{about?.about.description[0]}</p>
            <p className="lg:max-w-[40rem]">{about?.about.description[1]}</p>
          </div>
        </div>
        <Skeleton className="rounded-xl relative" isLoaded={isAboutImage}>
          <Image src={aboutImage} alt="l22" fill={true} className="object-center object-cover pointer-events-none"
                 onLoad={() => setAboutImage(true)}/>
        </Skeleton>
      </div>
      <Services about={about}/>
    </section>
  );
}