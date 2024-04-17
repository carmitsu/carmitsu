'use server';
const lang = require('/public/lang/'+ (process.env.SITE_LANGUAGE || 'en') +'.json');
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
  description?: string;
  navbar?: Navbar;
  hero?: Hero;
  about?: About;
  realizations?: Realizations;
  contact?: Contact;
  footer?: Footer;
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
  }
}

interface Hero {
  title: string;
  subtitle: string;
  button: string;
}

interface About {
  about: {
    title: string;
    description: string[];
  }
  whyUs: {
    "title": string;
    "experience": {
      "title": string;
      "description": string;
    },
    "clients": {
      "title": string;
      "description": string;
    },
    "passion": {
      "title": string;
      "description": string;
    }
    "footer": string;
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
}

interface Realizations {
  title: string;
  more: string;
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
  }
  toast: {
    success: string;
    error: string;
  }
}

interface Footer {
  rights: string;
  about: string;
  contact: string;
  privacy: string;
}