'use client';
import {Button, Link} from "@nextui-org/react";
import React from "react";
import {Lang} from "@/utils/language";
import {RealizationsData} from "@/utils/realizations";
import Realization from "@/components/realizations/realization";

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