'use client';
import {Skeleton, useDisclosure} from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";
import Image from "next/image";
import React from "react";

export default function Realization({image, title, description}: {
  image: string,
  title: string,
  description: string
}) {
  const [isRealizationImage, setRealizationImage] = React.useState(false);
  const [isRealizationImageModal, setRealizationImageModal] = React.useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <>
      <div className="flex flex-col" onClick={onOpen}>
        <div className="relative h-96">
          <Skeleton className="rounded-lg w-full h-full" isLoaded={isRealizationImage}>
            <Image className="object-cover w-full h-full" src={image} alt="realization" fill={true}
                   onLoad={() => setRealizationImage(true)}/>
          </Skeleton>
        </div>
        <div className="space-y-1">
          <h1 className="max-md:text-lg md:text-xl lg:text-2xl truncate">{title}</h1>
          <p className="text-foreground-500 line-clamp-2">{description}</p>
        </div>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={"5xl"} backdrop={"blur"} placement={"center"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                <div className="relative h-[50dvh]">
                  <Skeleton className="rounded-lg w-full h-full" isLoaded={isRealizationImageModal}>
                    <Image className="object-cover w-full h-full" src={image} alt="realization" fill={true}
                           onLoad={() => setRealizationImageModal(true)}/>
                  </Skeleton>
                </div>
                <p className="text-foreground-500">{description}</p>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}