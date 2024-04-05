'use server';
import lang from './lang/en.json';

function validateLang(lang: Lang) {
  if (!lang.navbar) {
    throw new Error('Navbar is missing');
  }
}

export async function getLanguage(): Promise<Lang> {
  validateLang(lang);
  return lang;
}

export interface Lang{
  language?: string;
  description?: string;
  navbar?: Navbar;
}

interface Navbar {
  home: string;
  about: string;
  contact: string;
  language: {
    [key: string]: string[];
  };
}