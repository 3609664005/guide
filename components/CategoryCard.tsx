import Link from "next/link";

interface CategoryCardProps { category: string; count: number }

const categoryIcons: Record<string, string> = {
  "餐厅": "🍽️", "咖啡馆": "☕", "冲浪店": "🏄", "民宿": "🏡", "景点": "🏖️", "酒店": "🏨",
};

export default function CategoryCard({ category, count }: CategoryCardProps) {
  const icon = categoryIcons[category] ?? "📍";
  return (
    <Link
      href={`/category/${encodeURIComponent(category)}`}
      className="group flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 min-h-[140px]"
    >
      <span className="text-4xl mb-3">{icon}</span>
      <span className="text-lg font-semibold text-gray-900">{category}</span>
      <span className="mt-1 text-sm text-gray-500">{count} 家推荐</span>
    </Link>
  );
}