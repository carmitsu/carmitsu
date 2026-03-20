import { supabaseAdmin } from './supabase';
import { Realization } from '@/types/realization';
import { getPublicUrl } from './s3';

export type { Realization } from '@/types/realization';

export async function getRealizations(): Promise<Realization[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('realizations')
      .select('id, created_at, title, description, files')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching realizations:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Could not fetch realizations:', err);
    return [];
  }
}

export function getLocalizedTitle(realization: Realization, lang: 'pl' | 'en' = 'pl'): string {
  return realization.title?.[lang] || realization.title?.pl || '';
}

export function getLocalizedDescription(realization: Realization, lang: 'pl' | 'en' = 'pl'): string {
  return realization.description?.[lang] || realization.description?.pl || '';
}

export function getMainImageUrl(realization: Realization): string | null {
  const imageFile = realization.files?.find(f => f.type === 'image');
  if (!imageFile) return null;
  return getPublicUrl(imageFile.name);
}

export function formatRealizationDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
