'use server';

import fs from 'node:fs';
import path from 'node:path';
import de from '../../public/lang/de.json';
import en from '../../public/lang/en.json';
import no from '../../public/lang/no.json';
import pl from '../../public/lang/pl.json';
import se from '../../public/lang/se.json';

const LANGUAGES: Record<string, Lang> = {
  de: de as unknown as Lang,
  en: en as unknown as Lang,
  no: no as unknown as Lang,
  pl: pl as unknown as Lang,
  se: se as unknown as Lang,
};

function loadLang(): Lang {
  const code = process.env.SITE_LANGUAGE || 'en';
  if (LANGUAGES[code]) {
    return LANGUAGES[code];
  }
  const filePath = path.join(process.cwd(), 'public', 'lang', `${code}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Lang;
}

const lang = loadLang();
// console.log(`Server is starting with language: ${process.env.SITE_LANGUAGE}`);

function validateLang(lang: Lang) {
  const requiredFields = Object.keys(lang) as (keyof Lang)[];

  for (const field of requiredFields) {
    if (!lang[field]) {
      throw new Error(`${field} is missing`);
    }
  }
}

export async function getLanguage(): Promise<Lang> {
  validateLang(lang);
  return lang;
}

export interface Lang{
  language?: string;
  seo?: Seo;
  navbar?: Navbar;
  hero?: Hero;
  about?: About;
  realizations?: Realizations;
  articles?: Articles;
  contact?: Contact;
  footer?: Footer;
  404?: string;
  baner?: Baner;
}

interface Seo {
  description: string;
  privacy: {
    title: string;
    description: string;
  }
  realizations: {
    title: string;
    description: string;
  }
  articles: {
    title: string;
    description: string;
  }
}

interface Navbar {
  home: string;
  about: string;
  contact: string;
  languageList: {
    [key: string]: string[];
  }
  more: {
    title: string;
    parts: string;
    realizations: string;
    articles: string;
  }
}

interface Hero {
  title: string;
  subtitle: string;
  description: string[];
  phone: string;
  button: string;
}

interface About {
  about: {
    title: string;
    description: string[];
  }
  whyUs: {
    title: string;
    description: string[]
    button: string,
    footer: string;
  }
  services: {
    title: string;
    servicesList: {
      carOverview: {
        title: string;
        description: string;
      },
      guaranteeOverview: {
        title: string;
        description: string;
      },
      computerDiagnostics: {
        title: string;
        description: string;
      },
      carElectric: {
        title: string;
        description: string;
      },
      oilChange: {
        title: string;
        description: string;
      },
      airConditioning: {
        title: string;
        description: string;
      }
    }
  }
  parts: {
    title: string;
    description: string;
    button: string[];
  }
}

interface Realizations {
  title: string;
  more: string;
}

interface Articles {
    title: string;
    none: string;
    noPhoto: string;
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
    vin: string[];
    registration: string[];
    message: string[];
    submit: string;
  }
  toast: {
    success: string;
    error: string;
  }
  howGet: string;
}

interface Footer {
  rights: string;
  about: string;
  contact: string;
  privacy: string;
}

interface Baner {
  title: string;
  body: string;
  yes: string;
  no: string;
}