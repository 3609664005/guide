"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import siteConfig from "@/site.config";
import entitiesData from "@/data/entities.json";

const typedEntities = entitiesData as unknown as Array<{
  id: string; name: string; category: string; summary: string; lastConfirmedDate: string;
}>;

const PAGE_SIZE = 10;

export default function EntitiesListPage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = typedEntities;
    if (filterCategory) list = list.filter((e) => e.category === filterCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }
    return list;
  }, [search, filterCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📋 实体管理</h1>
        <Link href="/admin/entities/new" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">+ 新增实体</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="搜索名称或 slug..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">全部分类</option>
          {siteConfig.categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr><th className="text-left px-4 py-3 font-medium">名称</th><th className="text-left px-4 py-3 font-medium">分类</th><th className="text-left px-4 py-3 font-medium hidden sm:table-cell">简介</th><th className="text-left px-4 py-3 font-medium">核实日期</th><th className="text-left px-4 py-3 font-medium">操作</th></tr>
          </thead>
          <tbody>
            {paged.map((e) => (
              <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                <td className="px-4 py-3 text-gray-600">{e.category}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell max-w-[200px] truncate">{e.summary}</td>
                <td className="px-4 py-3 text-gray-500">{e.lastConfirmedDate}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/entities/${e.id}/edit`} className="text-blue-600 hover:text-blue-800 text-sm">编辑</Link>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">暂无匹配的实体</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-30">上一页</button>
          <span className="text-sm text-gray-500">第 {page} / {totalPages} 页</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-30">下一页</button>
        </div>
      )}
    </div>
  );
}