import { MetadataRoute } from "next";
import siteConfig from "@/site.config";
import { getAllEntities } from "@/lib/entities";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.baseUrl;
  const entities = getAllEntities();
  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
  const categoryUrls: MetadataRoute.Sitemap = siteConfig.categories.map((cat) => ({
    url: `${baseUrl}/category/${encodeURIComponent(cat)}`,
    lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8,
  }));
  const entityUrls: MetadataRoute.Sitemap = entities.map((entity) => ({
    url: `${baseUrl}/entity/${entity.id}`,
    lastModified: new Date(entity.lastConfirmedDate), changeFrequency: "monthly" as const, priority: 0.9,
  }));
  return [...staticUrls, ...categoryUrls, ...entityUrls];
}