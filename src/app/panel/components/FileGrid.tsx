"use client";

import { useState, useMemo } from "react";
import { StorageFile } from "@/hooks/useStorage";
import { getPublicUrl } from "@/utils/s3";
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  MoreVertical,
  Pencil,
  Trash2,
  Eye
} from "lucide-react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
  cn,
} from "@nextui-org/react";
import { toast } from "sonner";

interface FileGridProps {
  files: StorageFile[];
  onRefresh: () => void;
  onSelect?: (file: StorageFile) => void;
  selectionMode?: boolean;
  selectedFiles?: string[];
  onSelectionChange?: (files: string[]) => void;
  onDelete?: (name: string) => Promise<boolean>;
  onRename?: (oldName: string, newName: string) => Promise<boolean>;
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem('panel_token') || "";
}

export default function FileGrid({
  files,
  onRefresh,
  onSelect,
  selectionMode = false,
  selectedFiles = [],
  onSelectionChange,
  onDelete,
  onRename,
}: FileGridProps) {
  const [renameFileName, setRenameFileName] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [fileUsage, setFileUsage] = useState<{ id: string; title: any }[]>([]);
  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const handleSelect = (file: StorageFile) => {
    if (selectionMode && onSelectionChange) {
      const newSelection = selectedFiles.includes(file.name)
        ? selectedFiles.filter((f) => f !== file.name)
        : [...selectedFiles, file.name];
      onSelectionChange(newSelection);
    } else if (onSelect) {
      onSelect(file);
    }
  };

  const handlePreview = (file: StorageFile) => {
    setPreviewFile(file);
    onPreviewOpen();
  };

  const handleRenameInit = (fileName: string) => {
    setRenameFileName(fileName);
    setNewName(fileName);
    onRenameOpen();
  };

  const handleRename = async () => {
    if (!renameFileName || !newName || renameFileName === newName) {
      onRenameClose();
      return;
    }

    setLoading(true);
    try {
      if (onRename) {
        const success = await onRename(renameFileName, newName);
        if (success) {
          onRenameClose();
          onRefresh();
        }
      } else {
        const response = await fetch('/api/storage/rename', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ oldName: renameFileName, newName }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Rename failed');
        }

        onRenameClose();
        onRefresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Błąd zmiany nazwy";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInit = async (fileName: string) => {
    setFileToDelete(fileName);
    setFileUsage([]);
    
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/storage/file-usage?fileName=${encodeURIComponent(fileName)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFileUsage(data.usedIn || []);
      }
    } catch (err) {
      console.error('Error checking file usage:', err);
    }
    
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    
    setDeletingFile(fileToDelete);
    try {
      if (onDelete) {
        await onDelete(fileToDelete);
      } else {
        const encodedName = encodeURIComponent(fileToDelete);
        const response = await fetch(`/api/storage/delete?name=${encodedName}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Delete failed');
        }
        
        toast.success("Plik usunięty");
      }
      
      setFileToDelete(null);
      onDeleteClose();
      onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Błąd usuwania";
      toast.error(message);
    } finally {
      setDeletingFile(null);
    }
  };

  const getFileIcon = (file: StorageFile) => {
    if (file.type === "image") return ImageIcon;
    if (file.type === "video") return Video;
    return FileText;
  };

  const isSelected = (fileName: string) => selectedFiles.includes(fileName);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {files.map((file) => {
          const Icon = getFileIcon(file);
          const selected = isSelected(file.name);
          const isDeleting = deletingFile === file.name;

          return (
            <Card
              key={file.name}
              isPressable
              onPress={() => handleSelect(file)}
              className={cn(
                "relative overflow-hidden transition-all duration-200",
                selected && "ring-2 ring-primary-500",
                selectionMode && "cursor-pointer"
              )}
            >
              {selectionMode && (
                <Checkbox
                  isSelected={selected}
                  onValueChange={() => handleSelect(file)}
                  className="absolute top-2 left-2 z-10"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              
              <CardBody className="p-0">
                {file.type === "image" ? (
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
                  <div className="aspect-square flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 p-4">
                    <Icon className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                
                <div className="p-2">
                  <p className="text-xs font-medium truncate text-slate-700 dark:text-slate-200" title={file.name}>
                    {file.name}
                  </p>
                  {file.size && (
                    <p className="text-xs text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
              </CardBody>

              {!selectionMode && !isDeleting && (
                <div className="absolute top-2 right-2">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="File actions">
                      <DropdownItem
                        key="preview"
                        startContent={<Eye className="w-4 h-4" />}
                        onPress={() => handlePreview(file)}
                      >
                        Podgląd
                      </DropdownItem>
                      <DropdownItem
                        key="rename"
                        startContent={<Pencil className="w-4 h-4" />}
                        onPress={() => handleRenameInit(file.name)}
                      >
                        Zmień nazwę
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 className="w-4 h-4" />}
                        onPress={() => handleDeleteInit(file.name)}
                      >
                        Usuń
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              )}

              {isDeleting && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isRenameOpen} onOpenChange={onRenameClose}>
        <ModalContent>
          <ModalHeader>Zmiana nazwy pliku</ModalHeader>
          <ModalBody>
            <Input
              label="Nowa nazwa"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              description="Rozszerzenie pliku pozostanie bez zmian"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onRenameClose}>
              Anuluj
            </Button>
            <Button 
              color="primary" 
              onPress={handleRename} 
              isLoading={loading}
              isDisabled={!newName || newName === renameFileName}
            >
              Zmień
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPreviewOpen} onOpenChange={onPreviewClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {previewFile?.name}
          </ModalHeader>
          <ModalBody className="p-0">
            {previewFile?.type === "image" ? (
              <img
                src={getPublicUrl(previewFile.name)}
                alt={previewFile.name}
                className="w-full h-auto max-h-[70vh] object-contain bg-black"
              />
            ) : previewFile?.type === "video" ? (
              <video
                src={previewFile.url}
                controls
                className="w-full max-h-[70vh]"
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <FileText className="w-16 h-16 text-slate-400" />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                if (previewFile) {
                  navigator.clipboard.writeText(previewFile.url);
                  toast.success("URL skopiowany do schowka");
                }
              }}
            >
              Kopiuj URL
            </Button>
            <Button color="primary" onPress={onPreviewClose}>
              Zamknij
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Potwierdzenie usunięcia</ModalHeader>
          <ModalBody>
            {fileUsage.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-warning-600 dark:text-warning-400 text-lg">!</span>
                    </div>
                    <div>
                      <p className="font-medium text-warning-800 dark:text-warning-200">
                        Uwaga! Ten plik jest używany w realizacjach
                      </p>
                      <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                        Usunięcie tego pliku spowoduje, że nie będzie on wyświetlany w:
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {fileUsage.map((r) => (
                    <li key={r.id}>
                      {r.title?.pl || r.title?.en || `Realizacja #${r.id}`}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Czy na pewno chcesz usunąć plik <strong>{fileToDelete}</strong>?
                </p>
              </div>
            ) : (
              <p>
                Czy na pewno chcesz usunąć plik{" "}
                <strong>{fileToDelete}</strong>? Ta operacja jest nieodwracalna.
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onDeleteClose}>
              Anuluj
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={!!deletingFile}>
              Usuń
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
