import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import siteConfig from "@/site.config";
import { getEntityBySlug, getAllSlugs } from "@/lib/entities";
import { generateJsonLd } from "@/lib/schema";

interface DetailPageProps { params: { slug: string } }

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: DetailPageProps): Metadata {
  const entity = getEntityBySlug(params.slug);
  if (!entity) return { title: "未找到" };
  return {
    title: entity.name,
    description: entity.summary,
    openGraph: { title: entity.name, description: entity.summary, images: [entity.imageUrl], type: "website" },
  };
}

export default function DetailPage({ params }: DetailPageProps) {
  const entity = getEntityBySlug(params.slug);
  if (!entity) notFound();
  const jsonLd = generateJsonLd(entity);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-gray-700 transition-colors">首页</a>
          <span className="mx-2">/</span>
          <a href={`/category/${encodeURIComponent(entity.category)}`} className="hover:text-gray-700 transition-colors">{entity.category}</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{entity.name}</span>
        </nav>
        <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-gray-100 mb-8">
          <Image src={entity.imageUrl} alt={entity.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{entity.name}</h1>
        <p className="text-lg text-gray-600 mb-4">{entity.summary}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {entity.tags.map((tag) => (<span key={tag} className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-100">{tag}</span>))}
        </div>
        <div className="flex items-center gap-2 mb-8 p-4 rounded-lg bg-green-50 border border-green-200">
          <span className="text-green-700 font-semibold text-sm">✅ 最后核实日期：{entity.lastConfirmedDate}</span>
          <span className="text-green-600 text-xs">（{siteConfig.siteName}承诺：所有信息均经实地核实并带有时间戳）</span>
        </div>
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">📋 基本信息</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <InfoItem label="地址" value={entity.address} />
            {entity.openingHours && <InfoItem label="营业时间" value={entity.openingHours} />}
            {entity.priceRange && <InfoItem label="价格区间" value={entity.priceRange} />}
            {entity.lat !== undefined && entity.lon !== undefined && <InfoItem label="坐标" value={`${entity.lat}, ${entity.lon}`} />}
            <InfoItem label="分类" value={entity.category} />
          </dl>
        </section>
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">📝 实测笔记</h2>
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{entity.personalNote}</div>
        </section>
        {entity.faq && entity.faq.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">常见问题 (FAQ)</h2>
            <div className="space-y-4">
              {entity.faq.map((item, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.question}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {Object.keys(entity.detailFields).length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">📊 详细信息</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(entity.detailFields).map(([key, value]) => (<InfoItem key={key} label={key} value={value} />))}
            </dl>
          </section>
        )}
      </div>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (<div><dt className="text-sm font-medium text-gray-500">{label}</dt><dd className="mt-1 text-gray-900">{value}</dd></div>);
}