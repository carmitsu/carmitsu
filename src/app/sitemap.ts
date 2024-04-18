import {MetadataRoute} from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.BASE_URL}/privacy`,
    },
    {
      url: `${process.env.BASE_URL}/realizations`,
    }
  ];
}