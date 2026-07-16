"use client";
import { useState, FormEvent, useEffect } from "react";

interface SettingsData {
  siteName: string; siteDescription: string; city: string; baseUrl: string;
  categoriesText: string;
  aboutTitle: string; aboutSectionsText: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<SettingsData>({
    siteName: "", siteDescription: "", city: "", baseUrl: "",
    categoriesText: "", aboutTitle: "", aboutSectionsText: "",
  });

  useEffect(() => {
    fetch("/data/site.config.json")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          siteName: data.siteName || "",
          siteDescription: data.siteDescription || "",
          city: data.city || "",
          baseUrl: data.baseUrl || "",
          categoriesText: Array.isArray(data.categories) ? data.categories.join("\n") : "",
          aboutTitle: data.about?.title || "",
          aboutSectionsText: Array.isArray(data.about?.sections)
            ? data.about.sections.map((s: { heading: string; body: string }) => `## ${s.heading}\n${s.body}`).join("\n\n")
            : "",
        });
      })
      .catch(() => setError("加载配置失败"))
      .finally(() => setFetchLoading(false));
  }, []);

  const updateField = <K extends keyof SettingsData>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/admin/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
      } else {
        setSuccess("已提交，1-2 分钟后生效。需重新构建以生成新页面。");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="text-center py-16 text-gray-500">加载中...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">⚙️ 网站设置</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsInput label="网站名称" value={form.siteName} onChange={(v) => updateField("siteName", v)} required />
          <SettingsInput label="城市" value={form.city} onChange={(v) => updateField("city", v)} required />
          <div className="sm:col-span-2">
            <SettingsInput label="网站描述" value={form.siteDescription} onChange={(v) => updateField("siteDescription", v)} required />
          </div>
          <div className="sm:col-span-2">
            <SettingsInput label="Base URL" value={form.baseUrl} onChange={(v) => updateField("baseUrl", v)} required placeholder="https://example.com" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类列表（每行一个）*</label>
          <textarea value={form.categoriesText} onChange={(e) => updateField("categoriesText", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y" required />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4">关于页内容</h3>
          <SettingsInput label="关于页标题" value={form.aboutTitle} onChange={(v) => updateField("aboutTitle", v)} />
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            关于页段落（格式：## 标题 换行 正文，段落之间空一行）
          </label>
          <textarea value={form.aboutSectionsText} onChange={(e) => updateField("aboutSectionsText", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y"
            placeholder={"## 我们是谁\n正文内容...\n\n## 信息采集标准\n正文内容..."}
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm">
            {loading ? "保存中..." : "保存设置"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SettingsInput({ label, value, onChange, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && " *"}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} required={required}
        placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}