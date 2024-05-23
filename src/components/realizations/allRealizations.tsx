'use client';
import React from "react";
import {Lang} from "@/utils/language";
import {RealizationsData} from "@/utils/realizations";
import Realization from "@/components/realizations/realization";

export default function AllRealizations({realizations, realizationsData}: Lang & {
  realizationsData: RealizationsData[]
}) {
  return (
    <section className="px-6 md:px-14 pb-3">
      <div className="space-y-4">
        <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl">{realizations?.title}</h1>
        <div className="flex flex-col lg:grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
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