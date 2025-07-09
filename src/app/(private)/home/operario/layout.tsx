"use client";
import Link from "next/link";
import {
  HomeIcon,
  SunIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Invernaderos", href: "/home/operario/invernaderos", icon: HomeIcon },
    { name: "Cultivos", href: "/home/operario/cultivos", icon: SunIcon },
    { name: "Estadísticas", href: "/home/operario/estadisticas", icon: ChartBarIcon },
    { name: "Bitácora", href: "/home/operario/bitacora", icon: CalendarDaysIcon },
    { name: "Configuraciones", href: "/home/operario/configuraciones", icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fijo */}
      <aside className="w-64 bg-white shadow-md p-6">
        <nav className="flex flex-col gap-4">
          <h2 className="text-green-600 text-2xl font-bold">HortiTech</h2>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 text-gray-700 px-3 py-2 rounded-md hover:bg-green-100"
            >
              <item.icon className="w-5 h-5 text-green-600" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
