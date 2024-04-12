'use client';
import {Lang} from "@/utils/language";
import "leaflet/dist/leaflet.css";
import {Input, Textarea, Button} from "@nextui-org/react";
import axios from "axios";
import {toast as toaster} from "sonner";
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/components/map'), {ssr: false});

export default function Contact({contact}: Lang) {
  return (
    <section id="Contact" className="grid grid-cols-1 md:grid-cols-2 max-md:min-h-[600px] md:h-[500px] mt-20">
      <div className="grid items-center justify-center p-2 max-md:py-3 max-md:max-h-[600px]">
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
          <form className="space-y-2 lg:w-[480px] xl:w-[600px]" onSubmit={(event) => handleFormSubmit(event, contact?.toast)}>
            <div className="flex space-x-2">
              <Input
                id="name"
                type="text"
                label={contact?.form.name[0]}
                placeholder={contact?.form.name[1]}
                variant="faded"
                isRequired
              />
              <Input
                id="phone"
                type="tel"
                label={contact?.form.phone[0]}
                placeholder={contact?.form.phone[1]}
                variant="faded"
              />

            </div>
            <div>
              <Input
                id="email"
                type="email"
                label={contact?.form.email[0]}
                placeholder={contact?.form.email[1]}
                variant="faded"
                isRequired
              />
            </div>
            <Textarea
              id="message"
              label={contact?.form.message[0]}
              placeholder={contact?.form.message[1]}
              className="w-full h-max"
              variant="faded"
              isRequired
            />
            <Button type="submit">{contact?.form.submit}</Button>
          </form>
        </div>
      </div>
      <Map/>
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