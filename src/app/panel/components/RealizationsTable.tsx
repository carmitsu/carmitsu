"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Realization, useRealizations } from "@/hooks/useRealizations";
import { getPublicUrl } from "@/utils/s3";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Avatar,
  Chip,
  Spinner,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Edit, Trash2, Plus, ImageIcon, Calendar, Files } from "lucide-react";

interface RealizationsTableProps {
  currentLang?: "pl" | "en";
}

export default function RealizationsTable({
  currentLang = "pl",
}: RealizationsTableProps) {
  const { realizations, loading, fetchRealizations, deleteRealization } = useRealizations(false);
  
  useEffect(() => {
    fetchRealizations();
  }, [fetchRealizations]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<Realization | null>(null);

  const handleDeleteInit = (item: Realization) => {
    setItemToDelete(item);
    onOpen();
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeletingId(itemToDelete.id);

    await deleteRealization(itemToDelete.id);

    setItemToDelete(null);
    onClose();
    fetchRealizations();
    setDeletingId(null);
  };

  const getThumbnail = (files: Realization["files"]) => {
    if (!files || files.length === 0) return null;
    const imageFile = files.find((f) => f.type === "image");
    if (imageFile) {
      return getPublicUrl(imageFile.name);
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (realizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <ImageIcon className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">
          Brak realizacji
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Dodaj pierwszą realizację klikając przycisk poniżej
        </p>
        <Link href="/panel/realizations/new">
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            className="mt-4"
          >
            Dodaj realizację
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Table aria-label="Realizacje">
        <TableHeader>
          <TableColumn>Realizacja</TableColumn>
          <TableColumn>Tytuł</TableColumn>
          <TableColumn>Pliki</TableColumn>
          <TableColumn>Data</TableColumn>
          <TableColumn className="text-right">Akcje</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Brak realizacji">
          {realizations.map((item) => {
            const thumbnail = getThumbnail(item.files);
            const title = item.title?.[currentLang] || item.title?.pl;

            return (
              <TableRow key={item.id}>
                <TableCell>
                  {thumbnail ? (
                    <Avatar
                      src={thumbnail}
                      size="lg"
                      className="w-16 h-16"
                    />
                  ) : (
                    <Avatar
                      icon={<ImageIcon className="w-8 h-8" />}
                      size="lg"
                      className="bg-slate-100 dark:bg-slate-800 w-16 h-16"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="font-medium text-slate-800 dark:text-white truncate">
                      {title || "Bez tytułu"}
                    </p>
                    {item.description?.[currentLang] && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                        {item.description[currentLang]}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    variant="flat"
                    startContent={<Files className="w-3 h-3" />}
                    size="sm"
                  >
                    {item.files?.length || 0}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.created_at)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/panel/realizations/${item.id}`}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDeleteInit(item)}
                      isLoading={deletingId === item.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onClose}>
        <ModalContent>
          <ModalHeader>Potwierdzenie usunięcia</ModalHeader>
          <ModalBody>
            <p>
              Czy na pewno chcesz usunąć realizację{" "}
              <strong>
                {itemToDelete?.title?.[currentLang] || itemToDelete?.title?.pl}
              </strong>
              ? Ta operacja jest nieodwracalna i usunie również wszystkie powiązane pliki z storage.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Anuluj
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={!!deletingId}>
              Usuń
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
