'use client';

import { createContext, useContext } from 'react';
import { Lang } from '@/utils/language';

export type SiteLanguage = 'pl' | 'en' | 'de' | 'no' | 'se';

interface LanguageContextType {
  language: SiteLanguage;
  data: Lang;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'pl',
  data: {} as Lang,
});

export function LanguageProvider({ 
  children, 
  language, 
  data 
}: { 
  children: React.ReactNode; 
  language: SiteLanguage; 
  data: Lang;
}) {
  return (
    <LanguageContext.Provider value={{ language, data }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
