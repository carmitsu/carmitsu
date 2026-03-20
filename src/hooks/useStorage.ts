"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface StorageFile {
  name: string;
  url: string;
  size?: number;
  lastModified?: Date;
  type?: "image" | "video" | "other";
}

interface UseStorageOptions {
  autoFetch?: boolean;
}

interface UseStorageReturn {
  files: StorageFile[];
  loading: boolean;
  error: string | null;
  fetchFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<StorageFile | null>;
  uploadFiles: (files: FileList | File[]) => Promise<StorageFile[]>;
  deleteFile: (name: string) => Promise<boolean>;
  deleteFiles: (names: string[]) => Promise<{ deleted: string[]; failed: Array<{ name: string; error: string }> }>;
  renameFile: (oldName: string, newName: string) => Promise<boolean>;
  getFileUrl: (name: string) => Promise<string>;
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem('panel_token') || "";
}

export function useStorage(options: UseStorageOptions = {}): UseStorageReturn {
  const { autoFetch = true } = options;

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/storage/list?refresh=true`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to fetch files");
      }

      const data = await response.json();
      const filesWithType = data.map((f: any) => ({
        name: f.name,
        url: f.url,
        size: f.size,
        type: f.type || 'other',
      }));
      setFiles(filesWithType);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch files";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<StorageFile | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/storage/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Upload failed");
      }

      const data = await response.json();
      const newFile: StorageFile = {
        name: data.name,
        url: data.url,
        size: data.size,
        type: data.type?.startsWith("image/") ? "image" : data.type?.startsWith("video/") ? "video" : "other",
      };

      setFiles((prev) => [...prev, newFile]);
      toast.success(`Załadowano: ${file.name}`);
      return newFile;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(`Błąd uploadu: ${message}`);
      return null;
    }
  }, []);

  const uploadFiles = useCallback(async (filesList: FileList | File[]): Promise<StorageFile[]> => {
    const fileArray = Array.from(filesList);
    const results: StorageFile[] = [];

    for (const file of fileArray) {
      const result = await uploadFile(file);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }, [uploadFile]);

  const deleteFile = useCallback(async (name: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/storage/delete?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Delete failed");
      }

      if (data.success) {
        setFiles((prev) => prev.filter((f) => f.name !== name));
        toast.success(`Usunięto: ${name}`);
        return true;
      } else if (data.failed?.length > 0) {
        throw new Error(data.failed[0].error);
      }

      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(`Błąd usuwania: ${message}`);
      return false;
    }
  }, []);

  const deleteFiles = useCallback(async (names: string[]): Promise<{ deleted: string[]; failed: Array<{ name: string; error: string }> }> => {
    const encodedNames = names.map((n) => encodeURIComponent(n)).join(",");

    try {
      const response = await fetch(`/api/storage/delete?names=${encodedNames}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Delete failed");
      }

      if (data.deleted?.length > 0) {
        setFiles((prev) => prev.filter((f) => !data.deleted.includes(f.name)));
      }

      if (data.deleted?.length === names.length) {
        toast.success(`Usunięto ${data.deleted.length} plików`);
      } else if (data.failed?.length > 0) {
        toast.error(`Nie udało się usunąć ${data.failed.length} plików`);
      }

      return {
        deleted: data.deleted || [],
        failed: data.failed || [],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(`Błąd: ${message}`);
      return { deleted: [], failed: names.map((name) => ({ name, error: message })) };
    }
  }, []);

  const renameFile = useCallback(async (oldName: string, newName: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/storage/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ oldName, newName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Rename failed");
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.name === oldName ? { ...f, name: data.newName || newName } : f
        )
      );

      toast.success(`Zmieniono nazwę: ${oldName} → ${data.newName || newName}`);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rename failed";
      toast.error(`Błąd zmiany nazwy: ${message}`);
      return false;
    }
  }, []);

  const getFileUrl = useCallback(async (name: string): Promise<string> => {
    try {
      const file = files.find((f) => f.name === name);
      if (file?.url) return file.url;

      const response = await fetch(`/api/storage/list?refresh=true`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get file URL");
      }

      const data = await response.json();
      const updatedFile = data.find((f: StorageFile) => f.name === name);

      if (updatedFile) {
        setFiles(data);
        return updatedFile.url;
      }

      throw new Error("File not found");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get file URL";
      toast.error(message);
      return "";
    }
  }, [files]);

  useEffect(() => {
    if (autoFetch) {
      fetchFiles();
    }
  }, [autoFetch, fetchFiles]);

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    uploadFiles,
    deleteFile,
    deleteFiles,
    renameFile,
    getFileUrl,
  };
}
