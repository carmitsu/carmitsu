import Image from "next/image";
import {Skeleton} from "@nextui-org/react";
import React from "react";
import {Lang} from "@/utils/language";

export default function Services({about}: Lang) {
  return (
    <div className="container space-y-4">
      <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl">{about?.services.title}</h1>
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
        <Service src="/icons/engine.svg" alt="engine" title={about?.services.servicesList.carOverview.title} description={about?.services.servicesList.carOverview.description}/>
        <Service src="/icons/snow.svg" alt="snow" title={about?.services.servicesList.airConditioning.title} description={about?.services.servicesList.airConditioning.description}/>
        <Service src="/icons/oil.svg" alt="oil" title={about?.services.servicesList.oilChange.title} description={about?.services.servicesList.oilChange.description}/>
        <Service src="/icons/magnifier.svg" alt="magnifier" title={about?.services.servicesList.guaranteeOverview.title} description={about?.services.servicesList.guaranteeOverview.description}/>
        <Service src="/icons/bolt.svg" alt="bolt" title={about?.services.servicesList.carElectric.title} description={about?.services.servicesList.carElectric.description}/>
        <Service src="/icons/laptop.svg" alt="laptop" title={about?.services.servicesList.computerDiagnostics.title} description={about?.services.servicesList.computerDiagnostics.description}/>
      </div>
    </div>
  );
}

function Service({src, alt, title, description}: { src: string, alt: string, title?: string, description?: string }) {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <div className="bg-default-100 rounded-xl flex items-center justify-center p-2">
      <Skeleton className="rounded-full" isLoaded={isLoaded}>
        <div className="p-4 rounded-full bg-primary/70">
          <Image src={src} alt={alt} width={64} height={64} onLoad={() => setIsLoaded(true)}/>
        </div>
      </Skeleton>
      <div className="space-y-2 w-4/5">
        <h1 className="px-2 text-lg leading-5 text-center">{title}</h1>
        <p className="px-2 text-center text-foreground-500">{description}</p>
      </div>
    </div>
  );
}