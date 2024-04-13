'use client';
import Image from "next/image";
import {Button, Link, Skeleton} from "@nextui-org/react";
import React from "react";
import {Lang} from "@/utils/language";
import {RealizationsData} from "@/utils/realizations";

export default function Realizations({realizations, realizationsData}: Lang & {
  realizationsData: RealizationsData[]
}) {
  return (
    <section id="Realizations" className="px-6 md:px-14 pt-24 flex flex-col items-center space-y-5">
      <div className="container space-y-4">
        <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl">{realizations?.title}</h1>
        <div className="grid gap-4 lg:grid-cols-2">
          {realizationsData.slice(0, 4).map((realization: any, index: number) => {
            return (
              <Realization key={index} image={realization.image} title={realization.title}
                           description={realization.description}/>
            );
          })}
        </div>
      </div>
      <Button className="w-full lg:w-auto" href="/realizations" as={Link}>
        {realizations?.more}
      </Button>
    </section>
  );
}

function Realization({image, title, description}: { image: string, title: string, description: string }) {
  const [isRealizationImage, setRealizationImage] = React.useState(false);
  return (
    <div className="grid gap-2">
      <div className="relative h-96">
        <Skeleton className="rounded-lg w-full h-full" isLoaded={isRealizationImage}>
          <Image className="object-cover w-full h-full" src={image} alt="realization" fill={true}
                 onLoad={() => setRealizationImage(true)}/>
        </Skeleton>
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl">{title}</h1>
        <p className="text-foreground-500">{description}</p>
      </div>
    </div>
  )
}