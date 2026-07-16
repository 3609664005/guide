import entities from "@/data/entities.json";

export interface Entity {
  id: string;
  name: string;
  category: string;
  summary: string;
  address: string;
  lat?: number;
  lon?: number;
  priceRange?: string;
  tags: string[];
  openingHours?: string;
  lastConfirmedDate: string;
  personalNote: string;
  imageUrl: string;
  detailFields: Record<string, string>;
}

const typedEntities = entities as unknown as Entity[];

export function getAllEntities(): Entity[] {
  return typedEntities;
}

export function getEntityBySlug(slug: string): Entity | undefined {
  return typedEntities.find((e) => e.id === slug);
}

export function getEntitiesByCategory(category: string): Entity[] {
  return typedEntities.filter((e) => e.category === category);
}

export function getAllCategories(): string[] {
  const cats = new Set(typedEntities.map((e) => e.category));
  return Array.from(cats);
}

export function getAllSlugs(): string[] {
  return typedEntities.map((e) => e.id);
}