'use client'
import {useState, useEffect} from "react";
import {Button} from "@nextui-org/button";
import {useLanguage} from "@/contexts/LanguageContext";

export default function Baner() {
  const {data} = useLanguage();
  const baner = data.baner;

  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const consent = localStorage.getItem('user-consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (error) {
      console.warn('localStorage is not available:', error);
      setIsVisible(true);
    }
  }, [isMounted]);

  const handleConsent = (granted: boolean) => {
    try {
      localStorage.setItem('user-consent', granted ? 'granted' : 'denied');
    } catch (error) {
      console.warn('Could not save consent to localStorage:', error);
    }

    window.dataLayer = window.dataLayer || [];

    if (typeof window.gtag !== 'function') {
      // @ts-ignore
      window.gtag = function(...args: any[]) {
        // @ts-ignore
        window.dataLayer.push(args);
      };
    }

    // @ts-ignore
    window.gtag('consent', 'update', {
      'ad_storage': granted ? 'granted' : 'denied',
      'analytics_storage': granted ? 'granted' : 'denied',
      'ad_user_data': granted ? 'granted' : 'denied',
      'ad_personalization': granted ? 'granted' : 'denied',
    });

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed w-[80dvw] justify-self-center p-4 flex flex-col space-y-2 items-center content-center bg-background/95 bottom-10 z-50 rounded-xl max-w-[60rem] border border-divider shadow-lg">
      <div className="flex flex-col justify-center w-full space-y-2">
        <h1 className="text-xl font-bold">{baner?.title}</h1>
        <p className="text-sm">{baner?.body}</p>
      </div>
      <div className="grid h-full gap-2 grid-cols-2 w-full">
        <Button
          variant="ghost"
          color="default"
          onPress={() => handleConsent(false)}
        >
          {baner?.no}
        </Button>
        <Button
          className="text-white"
          color="primary"
          onPress={() => handleConsent(true)}
        >
          {baner?.yes}
        </Button>
      </div>
    </div>
  );
}