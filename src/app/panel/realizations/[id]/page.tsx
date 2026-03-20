"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RealizationForm from "@/app/panel/components/RealizationForm";
import { Realization } from "@/app/panel/types";
import { Spinner } from "@nextui-org/react";

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem('panel_token') || "";
}

export default function EditRealizationPage() {
  const params = useParams();
  const router = useRouter();
  const [realization, setRealization] = useState<Realization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRealization() {
      try {
        const response = await fetch(`/api/realizations/${params.id}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch');
        }

        setRealization(data);
      } catch (err) {
        setError((err as Error).message);
      }
      setLoading(false);
    }

    fetchRealization();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !realization) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Błąd ładowania</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {error || 'Realizacja nie znaleziona'}
          </p>
          <button
            onClick={() => router.push('/panel/realizations')}
            className="mt-2 text-sm text-primary-500 hover:underline"
          >
            Wróć do listy
          </button>
        </div>
      </div>
    );
  }

  return <RealizationForm mode="edit" realization={realization} />;
}
