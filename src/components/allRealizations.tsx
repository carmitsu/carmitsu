'use client';
import {Skeleton} from "@nextui-org/react";
import React from "react";
import Image from "next/image";
import {Lang} from "@/utils/language";
import {RealizationsData} from "@/utils/realizations";

export default function AllRealizations({realizations, realizationsData}: Lang & {
  realizationsData: RealizationsData[]
}) {
  return (
    <section className="px-6 md:px-14 pb-3">
      <div className="space-y-4">
        <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl">{realizations?.title}</h1>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {realizationsData.map((realization: any, index: number) => {
            return (
              <Realization key={index} image={realization.image} title={realization.title}
                           description={realization.description}/>
            );
          })}
        </div>
      </div>
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
        <h1 className="max-md:text-lg md:text-xl lg:text-2xl">{title}</h1>
        <p className="text-foreground-500">{description}</p>
      </div>
    </div>
  )
}