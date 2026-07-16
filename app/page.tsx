import siteConfig from "@/site.config";
import { getAllEntities, getEntitiesByCategory } from "@/lib/entities";
import CategoryCard from "@/components/CategoryCard";
import RandomEntity from "@/components/RandomEntity";

export default function HomePage() {
  const allEntities = getAllEntities();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <section className="mb-12 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{siteConfig.siteName}</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl">{siteConfig.siteDescription}</p>
        <p className="mt-2 text-sm text-gray-400">📍 {siteConfig.city} · {allEntities.length} 个实地推荐 · 持续更新中</p>
      </section>
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-5">探索分类</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {siteConfig.categories.map((cat) => (
            <CategoryCard key={cat} category={cat} count={getEntitiesByCategory(cat).length} />
          ))}
        </div>
      </section>
      <section className="mb-12"><RandomEntity entities={allEntities} /></section>
      <section className="rounded-xl bg-blue-50 border border-blue-100 p-6">
        <h2 className="text-sm font-semibold text-blue-800 mb-2">🤖 面向 AI 搜索引擎优化（GEO）</h2>
        <p className="text-sm text-blue-700 leading-relaxed">本站所有内容均采用结构化数据标记（JSON-LD Schema.org），携带精确的时间戳和地理坐标，便于 Google、Bing、ChatGPT Search 等 AI 搜索引擎精准抓取和引用。每一条推荐都经过实地核实，确保信息的准确性和时效性。</p>
      </section>
    </div>
  );
}