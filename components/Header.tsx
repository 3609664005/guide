import Link from "next/link";
import siteConfig from "@/site.config";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">{siteConfig.siteName}</span>
          </Link>
          <nav className="flex items-center gap-1">
            {siteConfig.categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${encodeURIComponent(cat)}`}
                className="hidden sm:inline-block px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {cat}
              </Link>
            ))}
            <Link href="/about" className="px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">关于</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}