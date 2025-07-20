import React from 'react';
import Link from "next/link"; 
import { Droplet, Sun } from 'lucide-react'; // Import specific icons

interface DashboardCardProps {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; 
  href: string;
}

function DashboardCard({ title, icon: Icon, href }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="bg-white hover:shadow-lg border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition w-full max-w-xs mx-auto"
    >
      <div className="text-green-600">
        <Icon className="w-16 h-16 sm:w-20 sm:h-20" /> 
      </div>
      <h2 className="text-xl font-semibold text-gray-800 text-center mt-2">{title}</h2>
    </Link>
  );
}

export default function Estadisticas() {
  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-green-700 text-center mb-10">Estadísticas del Invernadero</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"> {/* Changed to md:grid-cols-2 */}
        <DashboardCard
          title="Estadísticas de Riego"
          icon={Droplet} // Using Droplet icon for Riego
          href="/home/operario/estadisticas/riego"
        />
        <DashboardCard
          title="Estadísticas de Iluminación"
          icon={Sun} // Using Sun icon for Iluminación
          href="/home/operario/estadisticas/iluminacion"
        />
        {/* The "Consumos" card has been removed as requested */}
      </div>
    </main>
  );
}