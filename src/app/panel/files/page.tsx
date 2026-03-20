"use client";

import { useEffect, useState, useMemo } from "react";
import { StorageFile, useStorage } from "@/hooks/useStorage";
import FileGrid from "../components/FileGrid";
import UniversalFileUpload from "@/components/panel/UniversalFileUpload";
import {
  Button,
  Input,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@nextui-org/react";
import { Search, Trash2, Upload, FolderOpen } from "lucide-react";

export default function FilesPage() {
  const { files, loading, fetchFiles, deleteFiles, renameFile } = useStorage({ autoFetch: false });
  const [search, setSearch] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filteredFiles = useMemo(() => {
    if (!search) return files;
    const searchLower = search.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(searchLower));
  }, [files, search]);

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    
    await deleteFiles(selectedFiles);
    setSelectedFiles([]);
    onDeleteClose();
    fetchFiles();
  };

  const handleUploadComplete = () => {
    fetchFiles();
  };

  if (loading && files.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Menedżer plików
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj plikami w buckecie "realizations"
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedFiles.length > 0 && (
            <Chip color="primary" variant="flat">
              {selectedFiles.length} wybranych
            </Chip>
          )}
          <Button
            color="danger"
            variant="flat"
            startContent={<Trash2 className="w-4 h-4" />}
            onPress={onDeleteOpen}
            isDisabled={selectedFiles.length === 0}
          >
            Usuń wybrane
          </Button>
          <Button
            color="primary"
            startContent={<Upload className="w-4 h-4" />}
            onPress={onOpen}
          >
            Dodaj pliki
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Szukaj plików..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startContent={<Search className="w-4 h-4 text-slate-400" />}
          className="max-w-md"
          isClearable
          onClear={() => setSearch("")}
        />
        <Button
          variant="flat"
          size="sm"
          onPress={() => fetchFiles()}
          isLoading={loading}
        >
          Odśwież
        </Button>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FolderOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">
            {search ? "Nie znaleziono plików" : "Brak plików"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {search
              ? "Spróbuj zmienić frazę wyszukiwania"
              : "Przeciągnij pliki lub kliknij 'Dodaj pliki'"}
          </p>
        </div>
      ) : (
        <FileGrid
          files={filteredFiles}
          onRefresh={fetchFiles}
          onDelete={deleteFiles.length > 0 ? undefined : async (name: string) => {
            const result = await deleteFiles([name]);
            return result.deleted.length > 0;
          }}
          onRename={async (oldName: string, newName: string) => {
            const token = sessionStorage.getItem('panel_token') || '';
            const result = await fetch("/api/storage/rename", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ oldName, newName }),
            });
            return result.ok;
          }}
          selectionMode={true}
          selectedFiles={selectedFiles}
          onSelectionChange={setSelectedFiles}
        />
      )}

      <Modal isOpen={isOpen} onOpenChange={onClose} size="xl">
        <ModalContent>
          <ModalHeader>Dodaj pliki</ModalHeader>
          <ModalBody className="py-6">
            <UniversalFileUpload
              onUploadComplete={handleUploadComplete}
              allowedTypes={["image", "video"]}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Zamknij
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Potwierdzenie usunięcia</ModalHeader>
          <ModalBody>
            <p>
              Czy na pewno chcesz usunąć{" "}
              <strong>{selectedFiles.length}</strong>{" "}
              {selectedFiles.length === 1 ? "plik" : "plików"}? Ta operacja jest
              nieodwracalna.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onDeleteClose}>
              Anuluj
            </Button>
            <Button color="danger" onPress={handleDeleteSelected}>
              Usuń {selectedFiles.length} plików
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
