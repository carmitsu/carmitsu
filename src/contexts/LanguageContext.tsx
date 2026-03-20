'use client';

import { createContext, useContext } from 'react';
import { Lang } from '@/utils/language';

interface LanguageContextType {
  language: 'pl' | 'en';
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
  language: 'pl' | 'en'; 
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
