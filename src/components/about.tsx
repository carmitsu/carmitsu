'use client';
import Services from "@/components/services";
import Parts from "@/components/parts";
import Image from "next/image";
import aboutImage from "/public/images/about.jpg";
import whyUsImage from "/public/images/whyUs.jpg";
import {Skeleton} from "@nextui-org/react";
import {useState} from "react";
import {Lang} from "@/utils/language";

export default function About({about}: Lang) {
  const [isAboutImage, setAboutImage] = useState(false);
  const [isWhyUsImage, setWhyUsImage] = useState(false);

  return (
    <section className="px-6 md:px-14 pt-24 flex flex-col items-center space-y-16" id="About">
      <div className="grid md:grid-cols-2 gap-4 max-md:grid-rows-2 container">
        <div className="space-y-6 md:my-8 lg:my-14">
          <h1
            className="max-md:text-2xl md:text-3xl lg:text-4xl max-w-[34rem] leading-[3.5rem]">{about?.about.title}</h1>
          <div className="space-y-2">
            <p className="lg:max-w-[40rem]">{about?.about.description[0]}</p>
            <p className="lg:max-w-[40rem]">{about?.about.description[1]}</p>
          </div>
        </div>
        <Skeleton className="rounded-xl relative" isLoaded={isAboutImage}>
          <Image src={aboutImage} alt="About Image" fill={true} className="object-center object-cover pointer-events-none"
                 onLoad={() => setAboutImage(true)}/>
        </Skeleton>
      </div>
      <Services about={about}/>
      <div className="grid md:grid-cols-2 gap-4 max-md:grid-rows-2 container">
        <div className="space-y-6 md:my-8 lg:my-14 max-md:mb-3">
          <h1
            className="max-md:text-2xl md:text-3xl lg:text-4xl max-w-[34rem] leading-[3.5rem]">{about?.whyUs.title}</h1>
          <div className="space-y-2 grid lg:max-w-[40rem]">
            <div className="bg-default-100 p-3 py-2 rounded-lg space-y-1">
              <h3 className="text-xl md:text-2xl ml-1">{about?.whyUs.experience.title}</h3>
              <p>{about?.whyUs.experience.description}</p>
            </div>
            <div className="bg-default-100 p-3 py-2 rounded-lg space-y-1">
              <h3 className="text-xl md:text-2xl ml-1">{about?.whyUs.clients.title}</h3>
              <p>{about?.whyUs.clients.description}</p>
            </div>
            <div className="bg-default-100 p-3 py-2 rounded-lg space-y-1">
              <h3 className="text-xl md:text-2xl ml-1">{about?.whyUs.passion.title}</h3>
              <p>{about?.whyUs.passion.description}</p>
            </div>
          </div>
          <p className="text-foreground-500 px-1 leading-5">{about?.whyUs.footer}</p>
        </div>
        <Skeleton className="rounded-xl relative" isLoaded={isWhyUsImage}>
          <Image src={whyUsImage} alt="ChooseUs Image" fill={true} className="object-center object-cover pointer-events-none"
                 onLoad={() => setWhyUsImage(true)}/>
        </Skeleton>
      </div>
    </section>
  );
}