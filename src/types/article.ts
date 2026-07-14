import { Document } from '@contentful/rich-text-types';

export interface NormalizedAsset {
  url: string;
  title: string;
  width: number;
  height: number;
  contentType: string;
}

export interface Article {
  slug: string;
  title: string;
  body: Document;
  images: NormalizedAsset[];
  createdAt: string;
  tags: string[];
}

export interface ContentfulAsset {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
  fields: {
    title: string;
    description?: string;
    file: {
      url: string;
      details: {
        size: number;
        image?: {
          width: number;
          height: number;
        };
      };
      fileName: string;
      contentType: string;
    };
  };
}

export interface ContentfulArticleEntry {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string;
    body: Document;
    images?: Array<{
      sys: {
        id: string;
        type: string;
        linkType: string;
      };
    }>;
  };
}

export interface ContentfulArticleResponse {
  items: ContentfulArticleEntry[];
  includes?: {
    Asset?: ContentfulAsset[];
  };
}
