"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPublicUrl } from "@/utils/s3";
import { Realization, FileItem } from "../types";
import UniversalFileUpload from "@/components/panel/UniversalFileUpload";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Spinner,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
} from "@nextui-org/react";
import {
  Save,
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Upload,
  Eye,
  Trash2,
  Star,
} from "lucide-react";
import { toast } from "sonner";

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem('panel_token') || "";
}

interface RealizationFormProps {
  realization?: Realization;
  mode: "create" | "edit";
  onSave?: () => void;
}

interface FileEntry {
  name: string;
  type: "image" | "video" | "other";
  url?: string;
  isMain?: boolean;
}

export default function RealizationForm({
  realization,
  mode,
  onSave,
}: RealizationFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title_pl: realization?.title?.pl || "",
    title_en: realization?.title?.en || "",
    description_pl: realization?.description?.pl || "",
    description_en: realization?.description?.en || "",
  });

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (realization?.files && realization.files.length > 0) {
      loadExistingFiles();
    }
  }, [realization]);

  async function loadExistingFiles() {
    if (!realization?.files) return;

    setLoadingFiles(true);
    const loadedFiles = realization.files.map((f, index) => ({
      name: f.name,
      type: f.type,
      url: getPublicUrl(f.name),
      isMain: index === 0,
    }));
    setFiles(loadedFiles);
    setLoadingFiles(false);
  }

  const { isOpen: isFileSelectorOpen, onOpen: onFileSelectorOpen, onClose: onFileSelectorClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);

  const [bucketFiles, setBucketFiles] = useState<FileItem[]>([]);
  const [loadingBucketFiles, setLoadingBucketFiles] = useState(false);
  const [selectedBucketFiles, setSelectedBucketFiles] = useState<string[]>([]);

  useEffect(() => {
    if (isFileSelectorOpen) {
      fetchBucketFiles();
    }
  }, [isFileSelectorOpen]);

  async function fetchBucketFiles() {
    setLoadingBucketFiles(true);
    try {
      const response = await fetch('/api/storage/list', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        const items: FileItem[] = data.map((f: any) => {
          const name = f.name;
          const isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(name);
          const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(name);

          return {
            name,
            url: f.url,
            isImage,
            type: isImage ? "image" as const : isVideo ? "video" as const : "other" as const,
          };
        });
        setBucketFiles(items);
      }
    } catch (err) {
      console.error("Error fetching bucket files:", err);
    }
    setLoadingBucketFiles(false);
  }

  const handleFileSelect = () => {
    const newFiles: FileEntry[] = selectedBucketFiles.map((name, index) => {
      const existing = bucketFiles.find((f) => f.name === name);
      return {
        name,
        type: existing?.type || "other",
        url: existing?.url,
        isMain: index === 0,
      };
    });

    setFiles((prev) => {
      const existingNames = prev.map((f) => f.name);
      const toAdd = newFiles.filter((f) => !existingNames.includes(f.name));
      if (prev.length === 0 && toAdd.length > 0) {
        toAdd[0].isMain = true;
      }
      return [...prev, ...toAdd];
    });

    setSelectedBucketFiles([]);
    onFileSelectorClose();
  };

  const handleRemoveFile = (name: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.name !== name);
      if (prev.find((f) => f.name === name)?.isMain && filtered.length > 0) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const handlePreview = (file: FileEntry) => {
    setPreviewFile(file);
    onPreviewOpen();
  };

  const setMainImage = (fileName: string) => {
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        isMain: f.name === fileName,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const sortedFiles = [...files].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });

    const payload = {
      title: { pl: form.title_pl, en: form.title_en },
      description: { pl: form.description_pl, en: form.description_en },
      files: sortedFiles.map((f) => ({ name: f.name, type: f.type })),
    };

    try {
      const url = mode === "create"
        ? '/api/realizations'
        : `/api/realizations/${realization!.id}`;
      
      const method = mode === "create" ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      toast.success(mode === "create" ? "Realizacja dodana!" : "Zmiany zapisane!");
      onSave?.();
      router.push("/panel/realizations");
    } catch (err) {
      console.error("Error saving realization:", err);
      toast.error(`Błąd: ${(err as Error).message}`);
    }

    setSaving(false);
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(name);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="flat"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={() => router.back()}
          >
            Wróć
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              {mode === "create" ? "Nowa realizacja" : "Edycja realizacji"}
            </h1>
          </div>
        </div>
        <Button
          type="submit"
          color="primary"
          startContent={<Save className="w-4 h-4" />}
          isLoading={saving}
        >
          Zapisz
        </Button>
      </div>

      <Card>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm flex items-center justify-center">PL</span>
                Wersja polska
              </h3>
              <Input
                label="Tytuł"
                placeholder="Wpisz tytuł po polsku"
                value={form.title_pl}
                onChange={(e) => setForm((prev) => ({ ...prev, title_pl: e.target.value }))}
                isRequired
              />
              <Textarea
                label="Opis"
                placeholder="Wpisz opis po polsku"
                value={form.description_pl}
                onChange={(e) => setForm((prev) => ({ ...prev, description_pl: e.target.value }))}
                minRows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 text-sm flex items-center justify-center">EN</span>
                Wersja angielska
              </h3>
              <Input
                label="Tytuł"
                placeholder="Enter title in English"
                value={form.title_en}
                onChange={(e) => setForm((prev) => ({ ...prev, title_en: e.target.value }))}
                isRequired
              />
              <Textarea
                label="Opis"
                placeholder="Enter description in English"
                value={form.description_en}
                onChange={(e) => setForm((prev) => ({ ...prev, description_en: e.target.value }))}
                minRows={4}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Załączone pliki
            </h3>
            <div className="flex gap-2">
              <Button
                variant="flat"
                size="sm"
                startContent={<Upload className="w-4 h-4" />}
                onPress={onUploadOpen}
              >
                Upload
              </Button>
              <Button
                color="primary"
                size="sm"
                startContent={<Plus className="w-4 h-4" />}
                onPress={onFileSelectorOpen}
              >
                Z bucketa
              </Button>
            </div>
          </div>

          {loadingFiles ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Brak załączonych plików</p>
              <p className="text-sm">Dodaj pliki z bucketa lub wgraj nowe</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file) => (
                <div
                  key={file.name}
                  className={`relative group rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 ${
                    file.isMain ? 'ring-4 ring-primary-500' : ''
                  }`}
                >
                  {isImage(file.name) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-400" />
                    </div>
                  )}

                  {file.isMain && (
                    <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Główne
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {file.type === 'image' && !file.isMain && (
                      <Tooltip content="Ustaw jako główne">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          className="bg-black/70 hover:bg-warning-500"
                          onPress={() => setMainImage(file.name)}
                        >
                          <Star className="w-4 h-4 text-white" />
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip content="Podgląd">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="bg-black/70 hover:bg-black"
                        onPress={() => handlePreview(file)}
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Usuń">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="bg-black/70 hover:bg-danger"
                        onPress={() => handleRemoveFile(file.name)}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </Button>
                    </Tooltip>
                  </div>

                  <p className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <span className="text-xs text-white truncate block">
                      {file.name}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isFileSelectorOpen}
        onOpenChange={onFileSelectorClose}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader>Wybierz pliki z bucketa</ModalHeader>
          <ModalBody className="max-h-[60vh] overflow-y-auto">
            {loadingBucketFiles ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : bucketFiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Brak plików w buckecie</p>
                <Button
                  color="primary"
                  variant="flat"
                  className="mt-4"
                  onPress={onUploadOpen}
                >
                  Wgraj pliki
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {bucketFiles.map((file) => {
                  const isSelected = selectedBucketFiles.includes(file.name);
                  return (
                    <div
                      key={file.name}
                      onClick={() => {
                        setSelectedBucketFiles((prev) =>
                          isSelected
                            ? prev.filter((f) => f !== file.name)
                            : [...prev, file.name]
                        );
                      }}
                      className={`
                        relative rounded-lg overflow-hidden cursor-pointer
                        border-2 transition-all
                        ${
                          isSelected
                            ? "border-primary-500 ring-2 ring-primary-200"
                            : "border-transparent hover:border-slate-300"
                        }
                      `}
                    >
                      {file.isImage ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary-500/30 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onFileSelectorClose}>
              Anuluj
            </Button>
            <Button
              color="primary"
              onPress={handleFileSelect}
              isDisabled={selectedBucketFiles.length === 0}
            >
              Dodaj {selectedBucketFiles.length > 0 && `(${selectedBucketFiles.length})`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isUploadOpen} onOpenChange={onUploadClose} size="xl">
        <ModalContent>
          <ModalHeader>Dodaj pliki</ModalHeader>
          <ModalBody className="py-6">
            <UniversalFileUpload
              onUploadComplete={(uploadedFiles) => {
                setFiles((prev) => {
                  const existingCount = prev.length;
                  return [
                    ...prev,
                    ...uploadedFiles.map((f, i) => ({
                      name: f.name,
                      type: f.type.startsWith("image/") ? "image" as const : f.type.startsWith("video/") ? "video" as const : "other" as const,
                      url: f.url,
                      isMain: existingCount === 0 && i === 0,
                    })),
                  ];
                });
                onUploadClose();
              }}
              allowedTypes={["image", "video"]}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onUploadClose}>
              Zamknij
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPreviewOpen} onOpenChange={onPreviewClose} size="4xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center justify-between w-full pr-8">
              <span>{previewFile?.name}</span>
              <span className="text-sm font-normal text-slate-500">
                {files.findIndex(f => f.name === previewFile?.name) + 1} / {files.filter(f => f.type === 'image').length}
              </span>
            </div>
          </ModalHeader>
          <ModalBody className="p-0">
            {previewFile && (
              isImage(previewFile.name) ? (
                <div className="relative bg-black">
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="w-full max-h-[70vh] object-contain"
                  />
                  {files.filter(f => f.type === 'image').length > 1 && (
                    <>
                      <button
                        onClick={() => {
                          const images = files.filter(f => f.type === 'image');
                          const currentIndex = images.findIndex(f => f.name === previewFile.name);
                          const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                          setPreviewFile(images[prevIndex]);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => {
                          const images = files.filter(f => f.type === 'image');
                          const currentIndex = images.findIndex(f => f.name === previewFile.name);
                          const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                          setPreviewFile(images[nextIndex]);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <video
                  src={previewFile.url}
                  controls
                  className="w-full max-h-[70vh]"
                />
              )
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </form>
  );
}
