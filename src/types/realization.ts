export interface RealizationFile {
  name: string;
  type: 'image' | 'video' | 'other';
}

export interface Realization {
  id: string;
  created_at: string;
  title: {
    pl: string;
    en: string;
  };
  description: {
    pl: string;
    en: string;
  };
  files: RealizationFile[];
}

export function getLocalizedTitle(realization: Realization, lang: 'pl' | 'en'): string {
  return realization.title[lang] || realization.title.pl || '';
}

export function getLocalizedDescription(realization: Realization, lang: 'pl' | 'en'): string {
  return realization.description[lang] || realization.description.pl || '';
}

export function getMainImageFile(realization: Realization): RealizationFile | null {
  return realization.files.find(f => f.type === 'image') || null;
}
