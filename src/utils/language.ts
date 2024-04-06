'use server';
import lang from './lang/pl.json';

function validateLang(lang: Lang) {
  if (!lang.navbar) {
    throw new Error('Navbar is missing');
  }
  if (!lang.contact) {
    throw new Error('Contact is missing');
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
  contact?: Contact;
}

interface Navbar {
  home: string;
  about: string;
  contact: string;
  languageList: {
    [key: string]: string[];
  };
}

interface Contact {
  title: string;
  location: string;
  phone: string[];
  email: string[];
  workingHours: string[];
  form: {
    name: string[];
    email: string[];
    phone: string[];
    message: string[];
    submit: string;
  };
  toast: {
    success: string;
    error: string;
  }
}