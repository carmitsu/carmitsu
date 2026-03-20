"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface RealizationFile {
  name: string;
  type: "image" | "video" | "other";
}

export interface Realization {
  id: string;
  created_at: string;
  title: { pl: string; en: string };
  description: { pl: string; en: string };
  files: RealizationFile[];
}

interface UseRealizationsReturn {
  realizations: Realization[];
  loading: boolean;
  error: string | null;
  fetchRealizations: () => Promise<void>;
  getRealization: (id: string) => Promise<Realization | null>;
  createRealization: (data: Omit<Realization, "id" | "created_at">) => Promise<Realization | null>;
  updateRealization: (id: string, data: Partial<Omit<Realization, "id" | "created_at">>) => Promise<Realization | null>;
  deleteRealization: (id: string) => Promise<boolean>;
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem('panel_token') || "";
}

export function useRealizations(autoFetch = true): UseRealizationsReturn {
  const [realizations, setRealizations] = useState<Realization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRealizations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/realizations", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to fetch realizations");
      }

      const data = await response.json();
      setRealizations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch realizations";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRealization = useCallback(async (id: string): Promise<Realization | null> => {
    try {
      const response = await fetch(`/api/realizations/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to fetch realization");
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch realization";
      toast.error(message);
      return null;
    }
  }, []);

  const createRealization = useCallback(
    async (data: Omit<Realization, "id" | "created_at">): Promise<Realization | null> => {
      try {
        const response = await fetch("/api/realizations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to create realization");
        }

        const newRealization = await response.json();
        setRealizations((prev) => [newRealization, ...prev]);
        toast.success("Utworzono realizację");
        return newRealization;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create realization";
        toast.error(message);
        return null;
      }
    },
    []
  );

  const updateRealization = useCallback(
    async (id: string, data: Partial<Omit<Realization, "id" | "created_at">>): Promise<Realization | null> => {
      try {
        const response = await fetch(`/api/realizations/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to update realization");
        }

        const updatedRealization = await response.json();
        setRealizations((prev) =>
          prev.map((r) => (r.id === id ? updatedRealization : r))
        );
        toast.success("Zaktualizowano realizację");
        return updatedRealization;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update realization";
        toast.error(message);
        return null;
      }
    },
    []
  );

  const deleteRealization = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/realizations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to delete realization");
      }

      setRealizations((prev) => prev.filter((r) => r.id !== id));
      toast.success("Usunięto realizację");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete realization";
      toast.error(message);
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchRealizations();
    }
  }, [autoFetch, fetchRealizations]);

  return {
    realizations,
    loading,
    error,
    fetchRealizations,
    getRealization,
    createRealization,
    updateRealization,
    deleteRealization,
  };
}
