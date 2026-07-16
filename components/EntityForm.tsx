"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import siteConfig from "@/site.config";

interface DetailField { key: string; value: string }

interface EntityFormData {
  id: string; name: string; category: string; summary: string; address: string;
  priceRange: string; tags: string; openingHours: string; lastConfirmedDate: string;
  personalNote: string; imageUrl: string; lat: string; lon: string;
  detailFields: DetailField[];
}

interface EntityFormProps {
  initialData?: EntityFormData;
  isEditing?: boolean;
}

export default function EntityForm({ initialData, isEditing }: EntityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<EntityFormData>(
    initialData || {
      id: "", name: "", category: siteConfig.categories[0] || "", summary: "",
      address: "", priceRange: "", tags: "", openingHours: "",
      lastConfirmedDate: new Date().toISOString().slice(0, 10), personalNote: "",
      imageUrl: "/images/placeholder.svg", lat: "", lon: "",
      detailFields: [{ key: "", value: "" }, { key: "", value: "" }],
    }
  );

  const updateField = <K extends keyof EntityFormData>(key: K, value: EntityFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateDetailField = (index: number, key: keyof DetailField, value: string) => {
    setForm((prev) => {
      const fields = [...prev.detailFields];
      fields[index] = { ...fields[index], [key]: value };
      return { ...prev, detailFields: fields };
    });
  };

  const addDetailField = () => {
    setForm((prev) => ({ ...prev, detailFields: [...prev.detailFields, { key: "", value: "" }] }));
  };

  const removeDetailField = (index: number) => {
    if (form.detailFields.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      detailFields: prev.detailFields.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const detailFieldsObj: Record<string, string> = {};
      form.detailFields.forEach((f) => {
        if (f.key.trim()) detailFieldsObj[f.key.trim()] = f.value;
      });

      const payload = {
        id: form.id,
        name: form.name,
        category: form.category,
        summary: form.summary,
        address: form.address,
        priceRange: form.priceRange || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        openingHours: form.openingHours || undefined,
        lastConfirmedDate: form.lastConfirmedDate,
        personalNote: form.personalNote,
        imageUrl: form.imageUrl || "/images/placeholder.svg",
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lon: form.lon ? parseFloat(form.lon) : undefined,
        detailFields: detailFieldsObj,
      };

      const res = await fetch("/admin/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
      } else {
        setSuccess("已提交，1-2 分钟后生效");
        if (!isEditing) {
          setForm({
            id: "", name: "", category: siteConfig.categories[0] || "", summary: "",
            address: "", priceRange: "", tags: "", openingHours: "",
            lastConfirmedDate: new Date().toISOString().slice(0, 10), personalNote: "",
            imageUrl: "/images/placeholder.svg", lat: "", lon: "",
            detailFields: [{ key: "", value: "" }, { key: "", value: "" }],
          });
        }
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="Slug（英文标识）" value={form.id} onChange={(v) => updateField("id", v)} required disabled={isEditing} placeholder="例如：my-new-shop" />
        <FormInput label="名称" value={form.name} onChange={(v) => updateField("name", v)} required placeholder="实体名称" />
        <FormSelect label="分类" value={form.category} onChange={(v) => updateField("category", v)} options={siteConfig.categories} />
        <FormInput label="价格区间" value={form.priceRange} onChange={(v) => updateField("priceRange", v)} placeholder="¥50-100/人" />
        <div className="sm:col-span-2">
          <FormInput label="一句话推荐语" value={form.summary} onChange={(v) => updateField("summary", v)} required placeholder="简短的推荐语" />
        </div>
        <div className="sm:col-span-2">
          <FormInput label="地址" value={form.address} onChange={(v) => updateField("address", v)} required placeholder="详细地址" />
        </div>
        <FormInput label="营业时间" value={form.openingHours} onChange={(v) => updateField("openingHours", v)} placeholder="09:00-22:00" />
        <FormInput label="最后核实日期" type="date" value={form.lastConfirmedDate} onChange={(v) => updateField("lastConfirmedDate", v)} required />
        <FormInput label="纬度 (lat)" value={form.lat} onChange={(v) => updateField("lat", v)} placeholder="18.2528" />
        <FormInput label="经度 (lon)" value={form.lon} onChange={(v) => updateField("lon", v)} placeholder="109.512" />
        <FormInput label="图片路径" value={form.imageUrl} onChange={(v) => updateField("imageUrl", v)} placeholder="/images/xxx.jpg" />
        <FormInput label="标签（逗号分隔）" value={form.tags} onChange={(v) => updateField("tags", v)} placeholder="标签1, 标签2" />
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">实测笔记</label>
          <textarea
            value={form.personalNote} onChange={(e) => updateField("personalNote", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-y"
            placeholder="个人实测笔记..."
          />
        </div>
      </div>

      {/* detailFields 动态键值对 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">自定义字段</h3>
          <button type="button" onClick={addDetailField} className="text-xs text-blue-600 hover:text-blue-800">+ 添加字段</button>
        </div>
        <div className="space-y-2">
          {form.detailFields.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text" value={f.key} onChange={(e) => updateDetailField(i, "key", e.target.value)}
                placeholder="字段名" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="text" value={f.value} onChange={(e) => updateDetailField(i, "value", e.target.value)}
                placeholder="字段值" className="flex-[2] px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button type="button" onClick={() => removeDetailField(i)} disabled={form.detailFields.length <= 1}
                className="px-2 py-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded hover:bg-red-50 disabled:opacity-30 transition-colors"
              >删除</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? "保存中..." : isEditing ? "更新实体" : "创建实体"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">取消</button>
      </div>
    </form>
  );
}

function FormInput({ label, value, onChange, required, disabled, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; disabled?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && " *"}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled}
        placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </div>
  );
}