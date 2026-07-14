import { createClient } from 'contentful';

export function getContentfulClient() {
  return createClient({
    space: process.env.CONTENTFUL_SPACE!,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });
}
