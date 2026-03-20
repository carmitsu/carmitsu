'use client';

import { useState, useEffect } from "react";
import { Spinner } from "@nextui-org/react";
import { Realization } from "@/utils/realizations";
import RealizationCard from "@/components/realizations/realization";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AllRealizations() {
  const { data } = useLanguage();
  const realizations = data.realizations;
  const [realizationsData, setRealizationsData] = useState<Realization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRealizations() {
      try {
        const response = await fetch('/api/realizations');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setRealizationsData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchRealizations();
  }, []);

  return (
    <section className="px-6 md:px-14 pb-3">
      <div className="space-y-4">
        <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl">{realizations?.title}</h1>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-danger">
            <p>Błąd: {error}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {realizationsData.map((realization, index: number) => (
              <RealizationCard 
                key={realization.id || index} 
                realization={realization}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
