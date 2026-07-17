"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import siteConfig from "@/site.config";
import { deleteEntity } from "@/lib/delete-entity";

interface EntityRow {
  id: string; name: string; category: string; summary: string; lastConfirmedDate: string;
}

const PAGE_SIZE = 10;

export default function EntitiesListPage() {
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/admin/api/entities")
      .then((r) => r.json())
      .then((data) => setEntities(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (slug: string, entityName: string) => {
    if (!window.confirm(`确定要删除「${entityName}」吗？此操作不可撤销。`)) return;
    setDeleting((prev) => new Set(prev).add(slug));
    try {
      await deleteEntity(slug, entityName);
      setEntities((prev) => prev.filter((e) => e.id !== slug));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "删除失败，请稍后重试";
      alert(msg);
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  };

  const filtered = useMemo(() => {
    let list = entities;
    if (filterCategory) list = list.filter((e) => e.category === filterCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }
    return list;
  }, [entities, search, filterCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <div className="text-center py-16 text-gray-500">加载中...</div>;
  }

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
            {paged.map((e) => {
              const isDeleting = deleting.has(e.id);
              return (
                <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3 text-gray-600">{e.category}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell max-w-[200px] truncate">{e.summary}</td>
                  <td className="px-4 py-3 text-gray-500">{e.lastConfirmedDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/admin/entities/${e.id}/edit`} className="text-blue-600 hover:text-blue-800 text-sm">编辑</Link>
                    <button
                      onClick={() => handleDelete(e.id, e.name)}
                      disabled={isDeleting}
                      className="ml-3 text-red-600 hover:text-red-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? "删除中..." : "删除"}
                    </button>
                  </td>
                </tr>
              );
            })}
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
