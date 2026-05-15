'use client';
import React from "react";
import Image from "next/image";
import parts from "/public/images/parts.jpg";
import {Skeleton, Button, Link} from "@nextui-org/react";
import {useLanguage} from "@/contexts/LanguageContext";

export default function Parts() {
  const { data } = useLanguage();
  const about = data.about;
  const [isPartsImage, setPartsImage] = React.useState(false);

  return (
    <section className="px-6 md:px-14 pt-24 flex flex-col items-center space-y-16" id="Parts">
      <div className="grid md:grid-cols-2 gap-4 max-md:grid-rows-2 container">
        <div className="space-y-6 md:my-8 lg:my-14">
          <h1
            className="max-md:text-2xl md:text-3xl lg:text-4xl max-w-[34rem] leading-[3.5rem] text-primary/85">{about?.parts.title}</h1>
          <div className="space-y-3">
            <p className="lg:max-w-[40rem]">{about?.parts.description}</p>
          </div>
          <Button size="lg" color="primary" variant="flat" className="w-full md:w-auto" href={`tel:${data.contact?.phone?.[1]?.replace(/\s/g, '') || ''}`} as={Link} target="_blank">{about?.parts.button?.[0]} <span className="font-bold">{about?.parts.button?.[1]}</span></Button>
        </div>
        <Skeleton className="rounded-xl relative" isLoaded={isPartsImage}>
          <Image src={parts} alt="About Image" fill={true}
                 className="object-center object-cover pointer-events-none rounded-xl"
                 onLoad={() => setPartsImage(true)}/>
        </Skeleton>
      </div>
    </section>
  );
}
