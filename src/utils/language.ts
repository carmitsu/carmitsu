'use server';
const lang = require('./lang/'+ (process.env.SITE_LANGUAGE || 'en') +'.json');
console.log(`Server is starting with language: ${process.env.SITE_LANGUAGE}`);

function validateLang(lang: Lang) {
  if (!lang.navbar) {
    throw new Error('Navbar is missing');
  }
  if (!lang.contact) {
    throw new Error('Contact is missing');
  }
  if (!lang.footer) {
    throw new Error('Footer is missing');
  }
  if (!lang.hero) {
    throw new Error('Hero is missing');
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
  hero?: Hero;
  contact?: Contact;
  footer?: Footer;
}

interface Navbar {
  home: string;
  about: string;
  contact: string;
  languageList: {
    [key: string]: string[];
  };
}

interface Hero {

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

interface Footer {
  rights: string;
  about: string;
  privacy: string;
}