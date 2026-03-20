"use client";

import { useCallback, useState } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@nextui-org/react";

interface UploadedFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface FileUploadProps {
  bucketName?: string;
  onUploadComplete?: (fileName: string, url: string) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export default function FileUpload({
  bucketName,
  onUploadComplete,
  maxSizeMB = 50,
  acceptedTypes = ["image/*", "video/*", ".pdf", ".doc", ".docx"],
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (uploadedFile: UploadedFile) => {
    const { file } = uploadedFile;
    
    setFiles((prev) =>
      prev.map((f) =>
        f.file === file ? { ...f, status: "uploading", progress: 0 } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();

      setFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, status: "done", progress: 100 } : f
        )
      );

      onUploadComplete?.(result.name, result.url);
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status: "error", error: (err as Error).message }
            : f
        )
      );
    }
  };

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach(uploadFile);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "done"));
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary-500 bg-primary-500/10"
            : "border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500"
        )}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="file-upload-input"
        />
        <label
          htmlFor="file-upload-input"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center">
            <Upload className="w-7 h-7 text-primary-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
              Przeciągnij pliki tutaj
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              lub{" "}
              <span className="text-primary-500 hover:underline">
                kliknij aby wybrać
              </span>
            </p>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Maksymalny rozmiar: {maxSizeMB}MB
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Pliki do uploadu
            </h4>
            {files.some((f) => f.status === "done") && (
              <button
                onClick={clearCompleted}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Wyczyść ukończone
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {files.map((uploadedFile, index) => (
              <div
                key={`${uploadedFile.file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm"
              >
                <div className="flex-shrink-0">
                  {uploadedFile.status === "done" ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : uploadedFile.status === "error" ? (
                    <AlertCircle className="w-5 h-5 text-danger" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    {uploadedFile.error && (
                      <span className="text-danger ml-2">
                        - {uploadedFile.error}
                      </span>
                    )}
                  </p>
                </div>

                {(uploadedFile.status === "pending" ||
                  uploadedFile.status === "uploading" ||
                  uploadedFile.status === "error") && (
                  <button
                    onClick={() => removeFile(uploadedFile.file)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
