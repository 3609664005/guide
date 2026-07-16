import { Metadata } from "next";
import { notFound } from "next/navigation";
import siteConfig from "@/site.config";
import { getEntitiesByCategory } from "@/lib/entities";
import EntityCard from "@/components/EntityCard";

interface CategoryPageProps { params: { category: string } }

export function generateStaticParams() {
  return siteConfig.categories.map((cat) => ({ category: cat }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = decodeURIComponent(params.category);
  if (!siteConfig.categories.includes(category)) return { title: "分类不存在" };
  return {
    title: `${category}`,
    description: `${siteConfig.city}最值得推荐的${category}，全部经过实地核实 — ${siteConfig.siteName}`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category);
  if (!siteConfig.categories.includes(category)) notFound();
  const entities = getEntitiesByCategory(category);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav className="text-sm text-gray-500 mb-6"><a href="/" className="hover:text-gray-700 transition-colors">首页</a><span className="mx-2">/</span><span className="text-gray-900 font-medium">{category}</span></nav>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{siteConfig.city}{category}</h1>
      <p className="text-gray-600 mb-8">共 {entities.length} 家推荐 · 全部实地核实</p>
      {entities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (<EntityCard key={entity.id} entity={entity} />))}
        </div>
      ) : (<div className="text-center py-16 text-gray-500">该分类下暂无推荐，敬请期待</div>)}
    </div>
  );
}
