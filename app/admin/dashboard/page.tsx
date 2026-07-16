import siteConfig from "@/site.config";
import { getAllEntities, getEntitiesByCategory } from "@/lib/entities";

export default function DashboardPage() {
  const entities = getAllEntities();
  const recentEntities = [...entities]
    .sort((a, b) => new Date(b.lastConfirmedDate).getTime() - new Date(a.lastConfirmedDate).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📊 仪表盘</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="实体总数" value={entities.length.toString()} />
        <StatCard label="分类数" value={siteConfig.categories.length.toString()} />
        <StatCard label="城市" value={siteConfig.city} />
        <StatCard label="站点名称" value={siteConfig.siteName} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">分类统计</h2>
          <div className="space-y-3">
            {siteConfig.categories.map((cat) => {
              const count = getEntitiesByCategory(cat).length;
              return (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((count / Math.max(entities.length, 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">最近更新</h2>
          <div className="space-y-3">
            {recentEntities.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900">{e.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{e.category}</span>
                </div>
                <span className="text-xs text-gray-400">{e.lastConfirmedDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}