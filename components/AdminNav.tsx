import Link from "next/link";

export default function AdminNav() {
  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <Link href="/admin/dashboard" className="px-3 py-2 text-sm rounded hover:bg-gray-700 transition-colors">📊 仪表盘</Link>
            <Link href="/admin/entities" className="px-3 py-2 text-sm rounded hover:bg-gray-700 transition-colors">📋 实体管理</Link>
            <Link href="/admin/settings" className="px-3 py-2 text-sm rounded hover:bg-gray-700 transition-colors">⚙️ 网站设置</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← 返回前台</Link>
          </div>
        </div>
      </div>
    </header>
  );
}