'use client';
import {Lang} from "@/utils/language";
import {MapContainer} from 'react-leaflet/MapContainer'
import {TileLayer} from 'react-leaflet/TileLayer'
import {Marker} from "react-leaflet";
import {Icon} from 'leaflet';
import "leaflet/dist/leaflet.css";
import {Input, Textarea, Button} from "@nextui-org/react";
import axios from "axios";
import {toast as toaster} from "sonner";

export default function Contact({contact}: Lang) {
  const position: any = [54.452847, 18.402047];
  const marker: string = "/icons/marker.svg";
  return (
    <section id="Contact" className="grid grid-cols-1 md:grid-cols-2 h-[700px]">
      <div className="grid items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl">{contact?.title}</h1>
            <div className="space-y-1">
              <p>{contact?.location}</p>
              <p>{contact?.phone[0]} <a href={`tel:` + contact?.phone[1].replace(/\s+/g, '')} className="text-primary">{contact?.phone[1]}</a></p>
              <p>{contact?.email[0]} <a href={`mailto:` + contact?.email[1]} className="text-primary">{contact?.email[1]}</a></p>
              <p>{contact?.workingHours[0]} {contact?.workingHours[1]}</p>
            </div>
          </div>
          <form className="space-y-2" onSubmit={(event) => handleFormSubmit(event, contact?.toast)}>
            <div className="flex space-x-2">
              <Input
                id="name"
                type="text"
                label={contact?.form.name}
                placeholder={contact?.form.name}
                variant="faded"
                isRequired
              />
              <Input
                id="email"
                type="email"
                label={contact?.form.email}
                placeholder={contact?.form.email}
                variant="faded"
                isRequired
              />
              <Input
                id="phone"
                type="tel"
                label={contact?.form.phone}
                placeholder={contact?.form.phone}
                variant="faded"
              />
            </div>
            <Textarea
              id="message"
              label={contact?.form.message[0]}
              placeholder={contact?.form.message[1]}
              className="w-full"
              variant="faded"
              isRequired
            />
            <Button type="submit">{contact?.form.submit}</Button>
          </form>
        </div>
      </div>
      <MapContainer center={position} zoom={12}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        <Marker position={position} icon={new Icon({iconUrl: marker, iconSize: [32, 32], iconAnchor: [12, 41]})}>
        </Marker>
      </MapContainer>
    </section>
  );
}

function handleFormSubmit(event: React.FormEvent<HTMLFormElement>, toast: any): void {
  event.preventDefault();
  let Message = {
    name: (document.getElementById('name') as HTMLInputElement).value,
    email: (document.getElementById('email') as HTMLInputElement).value,
    phone: (document.getElementById('phone') as HTMLInputElement).value,
    message: (document.getElementById('message') as HTMLInputElement).value,
  }
  if (Message.phone === '') {
    Message.phone = 'N/A';
  }
  axios.post('/api/sendForm', Message)
    .then(response => {
      if (response.status === 200) {
        toaster.success(toast.success);
      }
      else {
        toaster.error(toast.error);
      }
    })
    .catch(error => console.error(error));
}