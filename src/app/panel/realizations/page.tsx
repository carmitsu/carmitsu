"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRealizations } from "@/hooks/useRealizations";
import RealizationsTable from "../components/RealizationsTable";
import { Button, Spinner } from "@nextui-org/react";
import { Plus } from "lucide-react";

export default function RealizationsPage() {
  const { realizations, loading, error, fetchRealizations } = useRealizations(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchRealizations();
  }, [fetchRealizations]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Błąd ładowania danych</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          <Button
            color="primary"
            variant="flat"
            size="sm"
            className="mt-2"
            onPress={fetchRealizations}
          >
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Realizacje
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj realizacjami na stronie
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            size="sm"
            onPress={fetchRealizations}
            isLoading={loading}
          >
            Odśwież
          </Button>
          <Link href="/panel/realizations/new">
            <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
              Dodaj realizację
            </Button>
          </Link>
        </div>
      </div>

      <RealizationsTable />
    </div>
  );
}
