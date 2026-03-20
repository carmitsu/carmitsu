"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Button,
  Progress,
  Card,
  CardBody,
  Badge,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  cn,
} from "@nextui-org/react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { getPublicUrl } from "@/utils/s3";

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface UniversalFileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onFilesChange?: (files: UploadedFile[]) => void;
  maxFileSizeMB?: number;
  allowedTypes?: ("image" | "video")[];
  selectionMode?: "single" | "multiple";
  className?: string;
}

const ALLOWED_EXTENSIONS = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"],
  video: ["mp4", "webm", "mov"],
};

const MAX_FILE_SIZE = {
  image: 20 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};

const ACCEPTED_MIMES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

export default function UniversalFileUpload({
  onUploadComplete,
  onFilesChange,
  maxFileSizeMB,
  allowedTypes = ["image", "video"],
  selectionMode = "multiple",
  className,
}: UniversalFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon;
    if (type.startsWith("video/")) return Video;
    return FileText;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMaxSize = (fileType: string): number => {
    if (maxFileSizeMB) return maxFileSizeMB * 1024 * 1024;
    if (fileType.startsWith("video/")) return MAX_FILE_SIZE.video;
    return MAX_FILE_SIZE.image;
  };

  const validateFile = (file: File): string | null => {
    const fileType = file.type.toLowerCase();
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    const isImageType = fileType.startsWith("image/");
    const isVideoType = fileType.startsWith("video/");

    if (!isImageType && !isVideoType) {
      return `Plik "${file.name}" ma nieobsługiwany typ: ${fileType}`;
    }

    if (isImageType && !allowedTypes.includes("image")) {
      return `Typ obrazu nie jest dozwolony dla "${file.name}"`;
    }

    if (isVideoType && !allowedTypes.includes("video")) {
      return `Typ wideo nie jest dozwolony dla "${file.name}"`;
    }

    const allowedExts = [
      ...(allowedTypes.includes("image") ? ALLOWED_EXTENSIONS.image : []),
      ...(allowedTypes.includes("video") ? ALLOWED_EXTENSIONS.video : []),
    ];

    if (!allowedExts.includes(ext)) {
      return `Niedozwolone rozszerzenie ".${ext}" dla "${file.name}". Dozwolone: ${allowedExts.join(", ")}`;
    }

    const maxSize = getMaxSize(file.type);
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `Plik "${file.name}" jest zbyt duży (${formatFileSize(file.size)}). Maksimum: ${maxSizeMB}MB`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const uuid = crypto.randomUUID();
    formData.append("customName", uuid);

    try {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      const response = await fetch("/api/storage/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Upload failed");
      }

      const data = await response.json();
      return {
        name: data.name,
        url: data.url,
        size: data.size,
        type: data.type,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(`Błąd uploadu "${file.name}": ${message}`);
      return null;
    }
  };

  const handleFiles = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newErrors: string[] = [];
    const validFiles: File[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      onOpen();
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    for (const file of validFiles) {
      const result = await uploadFile(file);
      if (result) {
        uploadedFiles.push(result);
      }
    }

    setUploading(false);

    const allFiles = selectionMode === "single" ? uploadedFiles : [...files, ...uploadedFiles];
    setFiles(allFiles);

    if (uploadedFiles.length > 0) {
      toast.success(`Załadowano ${uploadedFiles.length} plików`);
      onUploadComplete?.(uploadedFiles);
      onFilesChange?.(allFiles);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [files, selectionMode]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeFile = (fileName: string) => {
    const newFiles = files.filter((f) => f.name !== fileName);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const clearFiles = async () => {
    const filesToDelete = files.filter((f) => !f.name.includes("_temp"));

    for (const file of filesToDelete) {
      try {
        await fetch(`/api/storage/delete?name=${encodeURIComponent(file.name)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
      } catch {
        console.error(`Failed to delete ${file.name}`);
      }
    }

    setFiles([]);
    onFilesChange?.([]);
    toast.success("Usunięto wszystkie pliki");
  };

  const getAcceptedTypes = (): string => {
    const types: string[] = [];
    if (allowedTypes.includes("image")) {
      types.push(...ACCEPTED_MIMES.image);
    }
    if (allowedTypes.includes("video")) {
      types.push(...ACCEPTED_MIMES.video);
    }
    return types.join(",");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={selectionMode === "multiple"}
        accept={getAcceptedTypes()}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          dragOver
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
              dragOver ? "bg-primary-100 dark:bg-primary-800" : "bg-slate-100 dark:bg-slate-800"
            )}
          >
            {dragOver ? (
              <CloudUpload className="w-8 h-8 text-primary-500" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
              {dragOver ? "Upuść pliki tutaj" : "Przeciągnij i upuść pliki"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              lub kliknij aby wybrać z dysku
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {allowedTypes.includes("image") && (
              <Chip size="sm" variant="flat" startContent={<ImageIcon className="w-3 h-3" />}>
                Obrazy
              </Chip>
            )}
            {allowedTypes.includes("video") && (
              <Chip size="sm" variant="flat" startContent={<Video className="w-3 h-3" />}>
                Wideo
              </Chip>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Maksymalny rozmiar: {allowedTypes.includes("video") ? "100MB" : "20MB"} na plik
          </p>
        </div>
      </div>

      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <Progress
              key={fileName}
              size="sm"
              value={progress}
              label={fileName}
              className="max-w-md"
            />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Załadowane pliki ({files.length})
            </h4>
            <Button size="sm" variant="light" color="danger" onPress={clearFiles}>
              Usuń wszystkie
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <Card key={file.name} className="relative overflow-hidden">
                  <CardBody className="p-0">
                    {file.type.startsWith("image/") ? (
                      <div className="aspect-square relative bg-slate-100 dark:bg-slate-800">
                        <img
                          src={getPublicUrl(file.name)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image load error:', file.name);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                        <Icon className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </CardBody>
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-success text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.name);
                    }}
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center hover:bg-danger-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            Błędy walidacji
          </ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg text-sm"
                >
                  {error}
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Zamknij
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem('panel_token') || "";
}
