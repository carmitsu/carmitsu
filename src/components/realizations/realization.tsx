import React from "react";
import {Skeleton} from "@nextui-org/react";
import Image from "next/image";

export default function Realization({image, title, description}: { image: string, title: string, description: string }) {
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