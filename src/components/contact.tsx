'use client';
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { Input, Textarea, Button } from "@heroui/react";
import axios from "axios";
import { toast as toaster } from "sonner";
import dynamic from 'next/dynamic';
import {useLanguage} from "@/contexts/LanguageContext";

const Map = dynamic(() => import('@/components/map'), {ssr: false});

export default function Contact() {
  const { data } = useLanguage();
  const contact = data.contact;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim() || 'N/A',
      vin: String(formData.get('vin') || '').trim(),
      registration: String(formData.get('registration') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      website: String(formData.get('website') || ''),
    };

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/sendForm', payload);
      if (response.status === 200) {
        toaster.success(contact?.toast.success || 'Message sent successfully');
        form.reset();
      } else {
        toaster.error(contact?.toast.error || 'Failed to send message');
      }
    } catch {
      toaster.error(contact?.toast.error || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="Contact" className="grid grid-cols-1 md:grid-cols-2 pt-20">
      <div className="grid items-center justify-center p-2 max-md:py-3 max-md:max-h-[600px]">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl">{contact?.title}</h2>
            <div className="space-y-1 flex flex-col items-center">
              <p>{contact?.location}</p>
              <div className="flex max-lg:flex-col lg:space-x-3">
                <p>{contact?.phone[0]} <a href={`tel:` + contact?.phone[1].replace(/\s+/g, '')}
                  className="text-primary">{contact?.phone[1]}</a></p>
                <p>{contact?.email[0]} <a href={`mailto:` + contact?.email[1]}
                  className="text-primary">{contact?.email[1]}</a></p>
              </div>
              <p>{contact?.workingHours[0]} {contact?.workingHours[1]}</p>
            </div>
          </div>
          <form className="space-y-2 lg:w-[480px] xl:w-[600px]" onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <div className="flex space-x-2">
              <Input
                id="name"
                name="name"
                type="text"
                label={contact?.form.name[0]}
                placeholder={contact?.form.name[1]}
                variant="faded"
                isRequired
              />
              <Input
                id="phone"
                name="phone"
                type="tel"
                label={contact?.form.phone[0]}
                placeholder={contact?.form.phone[1]}
                variant="faded"
              />
            </div>
            <div className="flex space-x-2">
              <Input
                id="vin"
                name="vin"
                type="text"
                label={contact?.form.vin[0]}
                placeholder={contact?.form.vin[1]}
                variant="faded"
              />
              <Input
                id="registration"
                name="registration"
                type="text"
                label={contact?.form.registration[0]}
                placeholder={contact?.form.registration[1]}
                variant="faded"
              />
            </div>
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                label={contact?.form.email[0]}
                placeholder={contact?.form.email[1]}
                variant="faded"
                isRequired
              />
            </div>
            <Textarea
              id="message"
              name="message"
              label={contact?.form.message[0]}
              placeholder={contact?.form.message[1]}
              className="w-full h-max"
              variant="faded"
              isRequired
            />
            <Button type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {contact?.form.submit}
            </Button>
          </form>
        </div>
      </div>
      <Map />
    </section>
  );
}
