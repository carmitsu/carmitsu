'use client';
import {Lang} from "@/utils/language";
import React from "react";
import Image from "next/image";
import otomotoLogo from "/public/images/otomoto.svg";
import parts from "/public/images/parts.jpg";
import {Skeleton, Button, Link} from "@nextui-org/react";

export default function Parts({about}: Lang) {
  const [isOtomotoImage, setOtomotoImage] = React.useState(false);
  const [isPartsImage, setPartsImage] = React.useState(false);

  return (
    <section className="px-6 md:px-14 pt-24 flex flex-col items-center space-y-16" id="Parts">
      <div className="grid md:grid-cols-2 gap-4 max-md:grid-rows-2 container">
        <div className="space-y-6 md:my-8 lg:my-14">
          <h1
            className="max-md:text-2xl md:text-3xl lg:text-4xl max-w-[34rem] leading-[3.5rem]">{about?.parts.title}</h1>
          <div className="space-y-3">
            <p className="lg:max-w-[40rem]">{about?.parts.description}</p>
          </div>
          <Skeleton className="rounded-xl md:w-fit" isLoaded={isOtomotoImage}>
            <Button size="lg" href="https://carmitsu.otomoto.pl/" target="_blank" as={Link}
                    className="max-md:w-full h-full px-[10%] sm:px-[20%] md:px-3 py-2"><Image
              src={otomotoLogo} alt="About Image"
              className="object-center object-cover pointer-events-none w-full"
              onLoad={() => setOtomotoImage(true)}/></Button>
          </Skeleton>
        </div>
        <Skeleton className="rounded-xl relative" isLoaded={isPartsImage}>
          <Image src={parts} alt="About Image" fill={true}
                 className="object-center object-cover pointer-events-none"
                 onLoad={() => setPartsImage(true)}/>
        </Skeleton>
      </div>
    </section>
  );
}