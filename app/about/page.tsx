import { Metadata } from "next";
import siteConfig from "@/site.config";

export const metadata: Metadata = {
  title: "关于我们",
  description: `${siteConfig.siteName}的信息采集与更新标准 — 所有信息均经过实地核实并带有时间戳`,
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav className="text-sm text-gray-500 mb-6"><a href="/" className="hover:text-gray-700 transition-colors">首页</a><span className="mx-2">/</span><span className="text-gray-900 font-medium">关于</span></nav>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">{siteConfig.about.title}</h1>
      <div className="space-y-8">
        {siteConfig.about.sections.map((section, idx) => (
          <section key={idx}><h2 className="text-lg font-bold text-gray-900 mb-3">{section.heading}</h2><p className="text-gray-700 leading-relaxed">{section.body}</p></section>
        ))}
      </div>
    </div>
  );
}