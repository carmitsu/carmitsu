export interface Realization {
  id: string;
  created_at: string;
  title: { pl: string; en: string };
  description: { pl: string; en: string };
  files: Array<{
    name: string;
    type: 'image' | 'video' | 'other';
  }>;
}

export interface RealizationFile {
  name: string;
  type: 'image' | 'video' | 'other';
  isMain?: boolean;
}

export interface StorageFile {
  id: string;
  name: string;
  created_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

export interface FileItem {
  name: string;
  url: string;
  size?: number;
  type?: 'image' | 'video' | 'other';
  isImage?: boolean;
}

export type EditMode = 'create' | 'edit';
