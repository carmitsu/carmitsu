'use client';
import Services from "@/components/services";
import Image from "next/image";
import aboutImage from "/public/images/about.jpg";
import whyUsImage from "/public/images/whyUs.jpg";
import {Link, Skeleton} from "@nextui-org/react";
import {useState} from "react";
import {useLanguage} from "@/contexts/LanguageContext";
import {Button} from "@nextui-org/button";

export default function About() {
  const { data } = useLanguage();
  const about = data.about;
  const [isAboutImage, setAboutImage] = useState(false);
  const [isWhyUsImage, setWhyUsImage] = useState(false);

  return (
    <section className="px-6 md:px-14 pt-24 flex flex-col items-center space-y-16" id="About">
      <div className="grid md:grid-cols-2 gap-4 max-md:grid-rows-2 container">
        <div className="space-y-6 md:my-8 lg:my-14">
          <h2
            className="max-md:text-2xl md:text-3xl lg:text-4xl max-w-[34rem] leading-[3.5rem] text-primary/85">{about?.about.title}</h2>
          <div className="space-y-2">
            <p className="lg:max-w-[40rem]">{about?.about.description[0]}</p>
            <p className="lg:max-w-[40rem]">{about?.about.description[1]}</p>
            <p className="lg:max-w-[40rem]">{about?.about.description[2]}</p>
          </div>
        </div>
        <Skeleton className="rounded-xl relative" isLoaded={isAboutImage}>
          <Image src={aboutImage} alt="About Image" fill={true} className="object-center object-cover pointer-events-none rounded-xl"
                 onLoad={() => setAboutImage(true)}/>
        </Skeleton>
      </div>
      <Services />
      <div className="grid md:grid-cols-2 gap-4 max-md:grid-rows-2 container">
        <div className="space-y-6 md:my-8 lg:my-14 max-md:mb-3">
          <h2
            className="max-md:text-2xl md:text-3xl lg:text-4xl max-w-[34rem] leading-[3.5rem] text-primary/85">{about?.whyUs.title}</h2>
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
            <Button size="lg" color="primary" variant="flat" className="w-full" href="https://www.google.com/maps/place/CarMitsu+warsztat+samochodowy/@54.4522303,18.4037406,527m/data=!3m1!1e3!4m17!1m8!3m7!1s0x46fda3260f34267d:0x6fbda2c4a6fc105!2sCarMitsu+warsztat+samochodowy!8m2!3d54.4526712!4d18.4016195!10e2!16s%2Fg%2F11tmn249f1!3m7!1s0x46fda3260f34267d:0x6fbda2c4a6fc105!8m2!3d54.4526712!4d18.4016195!9m1!1b1!16s%2Fg%2F11tmn249f1?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D" as={Link} target="_blank">{about?.whyUs.button}</Button>
          </div>
          <p className="text-foreground-500 px-1 leading-5">{about?.whyUs.footer}</p>
        </div>
        <Skeleton className="rounded-xl relative" isLoaded={isWhyUsImage}>
          <Image src={whyUsImage} alt="ChooseUs Image" fill={true} className="object-center object-cover pointer-events-none rounded-xl"
                 onLoad={() => setWhyUsImage(true)}/>
        </Skeleton>
      </div>
    </section>
  );
}
