import {MetadataRoute} from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "") || "https://carmitsu.pl";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/panel/"],
      },
    ],
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}