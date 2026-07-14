import { getContentfulClient } from '@/lib/contentful';
import { Article } from '@/types/article';
import { Document } from '@contentful/rich-text-types';

export type { Article } from '@/types/article';

export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEntry = any;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAsset(asset: any) {
  const url: string = asset.fields.file.url.startsWith('//')
    ? `https:${asset.fields.file.url}`
    : asset.fields.file.url;

  return {
    url,
    title: asset.fields.title as string,
    width: (asset.fields.file.details.image?.width as number) || 0,
    height: (asset.fields.file.details.image?.height as number) || 0,
    contentType: asset.fields.file.contentType as string,
  };
}

function extractPlainText(body: Document): string {
  const texts: string[] = [];
  for (const node of body.content) {
    if (node.nodeType === 'paragraph' && 'content' in node) {
      for (const child of node.content) {
        if (child.nodeType === 'text' && 'value' in child) {
          texts.push(child.value);
        }
      }
    }
  }
  return texts.join(' ').trim();
}

export async function getArticles(): Promise<Article[]> {
  try {
    const client = getContentfulClient();
    const response = await client.getEntries({
      content_type: 'article',
      order: ['-sys.createdAt'],
    });

    const assetMap = new Map<string, AnyEntry>();
    if (response.includes?.Asset) {
      for (const asset of response.includes.Asset) {
        assetMap.set(asset.sys.id, asset);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.items.map((entry: AnyEntry) => {
      const images = (entry.fields.images || [])
        .map((img: AnyEntry) => assetMap.get(img.sys.id))
        .filter((a: AnyEntry) => !!a)
        .map((a: AnyEntry) => normalizeAsset(a));

      return {
        slug: generateSlug(entry.fields.title as string),
        title: entry.fields.title as string,
        body: entry.fields.body as Document,
        images,
        createdAt: entry.sys.createdAt as string,
      };
    });
  } catch (err) {
    console.error('Could not fetch articles:', err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const articles = await getArticles();
    return articles.find((a) => a.slug === slug) || null;
  } catch (err) {
    console.error('Could not fetch article:', err);
    return null;
  }
}

export function getExcerpt(body: Document, maxLength = 200): string {
  const text = extractPlainText(body);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function formatArticleDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
