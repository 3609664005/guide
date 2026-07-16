import siteConfig from "@/site.config";
import EntityForm from "@/components/EntityForm";

export const metadata = { title: "新增实体 | 管理后台" };

export default function NewEntityPage() {
  const defaultData = {
    id: "", name: "", category: siteConfig.categories[0] || "", summary: "",
    address: "", priceRange: "", tags: "", openingHours: "",
    lastConfirmedDate: new Date().toISOString().slice(0, 10), personalNote: "",
    imageUrl: "/images/placeholder.svg", lat: "", lon: "",
    detailFields: [{ key: "", value: "" }, { key: "", value: "" }],
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">➕ 新增实体</h1>
      <EntityForm initialData={defaultData} isEditing={false} />
    </div>
  );
}