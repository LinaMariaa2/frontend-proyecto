import Sidebar from "@/app/(private)/home/admin/components/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <div className="min-h-screen bg-gray-100">
      
      <Sidebar />
      <main className="p-4">{children}</main>
    </div>
  );
}
