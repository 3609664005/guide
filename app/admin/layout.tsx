import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}