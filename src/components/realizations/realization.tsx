'use client';

import { useState, useRef, useEffect } from "react";
import { Skeleton, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import Image from "next/image";
import { Realization } from "@/utils/realizations";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play } from "lucide-react";

interface RealizationCardProps {
  realization: Realization;
}

export default function RealizationCard({ realization }: RealizationCardProps) {
  const { language } = useLanguage();
  const [cardFileIndex] = useState(0);
  const [modalFileIndex, setModalFileIndex] = useState(0);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const title = realization.title?.[language] || realization.title?.pl || '';
  const description = realization.description?.[language] || realization.description?.pl || '';
  
  const allFiles = realization.files || [];
  const cardFile = allFiles[cardFileIndex];
  const modalFile = allFiles[modalFileIndex];
  
  const getFileUrl = (fileName: string) => {
    return `https://pnxgazfljyrlmsrzdzgm.storage.supabase.co/storage/v1/object/public/realizations/${encodeURIComponent(fileName)}`;
  };

  const isImage = (type: string) => type === 'image';
  const isVideo = (type: string) => type === 'video';

  useEffect(() => {
    if (isOpen) {
      setModalFileIndex(0);
      setVideoThumbnail(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && cardFile && isVideo(cardFile.type) && !videoThumbnail && !thumbnailLoading) {
      generateVideoThumbnail(cardFile.name);
    }
  }, [cardFile, isOpen, videoThumbnail, thumbnailLoading]);

  const generateVideoThumbnail = async (fileName: string) => {
    setThumbnailLoading(true);
    const video = document.createElement('video');
    video.src = getFileUrl(fileName);
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setVideoThumbnail(canvas.toDataURL('image/jpeg', 0.7));
      }
      setThumbnailLoading(false);
    };
    
    video.onerror = () => {
      setThumbnailLoading(false);
    };
  };

  const goToPrevious = () => {
    setModalFileIndex((prev) => (prev > 0 ? prev - 1 : allFiles.length - 1));
    setVideoThumbnail(null);
  };

  const goToNext = () => {
    setModalFileIndex((prev) => (prev < allFiles.length - 1 ? prev + 1 : 0));
    setVideoThumbnail(null);
  };

  const handleOpen = () => {
    setModalFileIndex(0);
    setVideoThumbnail(null);
    onOpen();
  };

  const cardUrl = cardFile ? getFileUrl(cardFile.name) : '';
  const modalUrl = modalFile ? getFileUrl(modalFile.name) : '';

  return (
    <>
      <div className="flex flex-col cursor-pointer" onClick={handleOpen}>
        <div className="relative h-96 rounded-xl overflow-hidden">
          {cardFile && isImage(cardFile.type) ? (
            <Skeleton className="rounded-xl w-full h-full" isLoaded={true}>
              <Image
                className="object-cover w-full h-full rounded-xl"
                src={cardUrl}
                alt={title || 'realization'}
                fill={true}
                unoptimized
              />
            </Skeleton>
          ) : cardFile && isVideo(cardFile.type) ? (
            <div className="w-full h-full bg-black flex items-center justify-center relative rounded-xl overflow-hidden">
              {videoThumbnail ? (
                <img 
                  src={videoThumbnail} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={cardUrl}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  muted
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-400">Brak pliku</span>
            </div>
          )}
          
          {allFiles.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {allFiles.length} plików
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="max-md:text-lg md:text-xl lg:text-2xl truncate">{title}</h1>
          <p className="text-foreground-500 line-clamp-2">{description}</p>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        size={"5xl"}
        backdrop={"blur"}
        placement={"center"}
        scrollBehavior={"outside"}
        onClose={() => {
          setModalFileIndex(0);
          setVideoThumbnail(null);
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {title}
            <span className="text-sm font-normal text-foreground-500">
              {modalFileIndex + 1} z {allFiles.length}
            </span>
          </ModalHeader>
          <ModalBody className="p-0">
            <div className="relative bg-black min-h-[50vh] rounded-xl overflow-hidden m-4">
              {modalFile && isImage(modalFile.type) && (
                <Image
                  className="object-contain w-full h-full"
                  src={modalUrl}
                  alt={modalFile.name}
                  fill={true}
                  unoptimized
                />
              )}
              
              {modalFile && isVideo(modalFile.type) && (
                <video
                  ref={videoRef}
                  src={modalUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] mx-auto"
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                />
              )}
              
              {allFiles.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-2xl font-bold"
                  >
                    ←
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-2xl font-bold"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {allFiles.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setModalFileIndex(index);
                          setVideoThumbnail(null);
                        }}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === modalFileIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="p-4">
              <p className="text-foreground-500 whitespace-pre-wrap">{description}</p>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
