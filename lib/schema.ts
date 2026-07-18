import type { Entity } from "./entities";

function mapCategoryToSchemaType(category: string): string {
  const lower = category.toLowerCase();
  if (lower === "餐厅" || lower === "咖啡馆" || lower === "restaurant" || lower === "cafe") {
    return "Restaurant";
  }
  if (lower === "民宿" || lower === "酒店" || lower === "hotel") {
    return "LodgingBusiness";
  }
  if (lower === "景点" || lower === "attraction") {
    return "TouristAttraction";
  }
  return "LocalBusiness";
}

export function generateJsonLd(entity: Entity): Record<string, unknown> {
  const schemaType = mapCategoryToSchemaType(entity.category);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: entity.name,
    description: entity.summary,
    address: {
      "@type": "PostalAddress",
      streetAddress: entity.address,
      addressLocality: "万宁",
      addressCountry: "CN",
    },
    dateModified: entity.lastConfirmedDate,
  };
  if (entity.priceRange) base.priceRange = entity.priceRange;
  if (entity.lat !== undefined && entity.lon !== undefined) {
    base.geo = { "@type": "GeoCoordinates", latitude: entity.lat, longitude: entity.lon };
  }
  if (entity.openingHours) base.openingHours = entity.openingHours;
  if (schemaType === "Restaurant") base.servesCuisine = "本地特色";
  if (entity.faq && entity.faq.length > 0) {
    base.mainEntity = entity.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }));
  }

  return base;
}