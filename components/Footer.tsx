import siteConfig from "@/site.config";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} {siteConfig.siteName} · 所有推荐均经实地核实
          </div>
          <div className="text-xs text-gray-400">面向AI搜索引擎优化（GEO）· 结构化数据驱动</div>
        </div>
      </div>
    </footer>
  );
}