import { notFound } from "next/navigation";
import { getEntityBySlug } from "@/lib/entities";
import EntityForm from "@/components/EntityForm";

interface EditPageProps { params: { slug: string } }

export default function EditEntityPage({ params }: EditPageProps) {
  const entity = getEntityBySlug(params.slug);
  if (!entity) notFound();

  const initialData = {
    id: entity.id,
    name: entity.name,
    category: entity.category,
    summary: entity.summary,
    address: entity.address,
    priceRange: entity.priceRange || "",
    tags: entity.tags.join(", "),
    openingHours: entity.openingHours || "",
    lastConfirmedDate: entity.lastConfirmedDate,
    personalNote: entity.personalNote,
    imageUrl: entity.imageUrl,
    lat: entity.lat?.toString() || "",
    lon: entity.lon?.toString() || "",
    detailFields: Object.entries(entity.detailFields).map(([key, value]) => ({ key, value })),
  };
  if (initialData.detailFields.length === 0) {
    initialData.detailFields = [{ key: "", value: "" }, { key: "", value: "" }];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">✏️ 编辑实体：{entity.name}</h1>
      <EntityForm initialData={initialData} isEditing={true} />
    </div>
  );
}