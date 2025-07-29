"use client";

import React from "react";
import Link from "next/link";
import { 
    Building, 
    Sprout, 
    BarChartBig, 
    ClipboardList, 
    Settings, 
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

// --- Tipos de Datos ---
interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

// --- Componente de Tarjeta del Panel ---
function DashboardCard({ title, description, icon: Icon, href }: DashboardCardProps) {
  return (
    <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
    >
        <Link
          href={href}
          className="bg-white group hover:shadow-xl hover:border-teal-500 border border-slate-200 rounded-xl p-6 flex items-start gap-5 transition-all duration-300 h-full"
        >
          <div className="bg-teal-50 text-teal-600 rounded-lg p-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-grow">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </div>
          <ChevronRight className="w-6 h-6 text-slate-400 self-center group-hover:text-teal-600 transition-colors transform group-hover:translate-x-1" />
        </Link>
    </motion.div>
  );
}

// --- Componente Principal de la Página ---
export default function HomePage() {
  const dashboardItems: DashboardCardProps[] = [
    {
      title: "Invernaderos",
      description: "Gestiona tus invernaderos y zonas.",
      icon: Building,
      href: "/home/admin/invernaderos",
    },
    {
      title: "Cultivos",
      description: "Administra los tipos de cultivos.",
      icon: Sprout,
      href: "/home/admin/cultivos",
    },
    {
      title: "Estadísticas",
      description: "Visualiza datos y rendimientos.",
      icon: BarChartBig,
      href: "/home/admin/estadisticas",
    },
    {
      title: "Bitácora",
      description: "Revisa el historial de acciones.",
      icon: ClipboardList,
      href: "/home/admin/bitacora",
    },
    {
      title: "Configuraciones",
      description: "Ajusta los parámetros del sistema.",
      icon: Settings,
      href: "/home/admin/configuraciones",
    },
  ];

  const userName = "Administrador";

  return (
    // CAMBIO: Se elimina el AppHeader y se ajusta el layout principal
    <div className="bg-slate-50 min-h-screen w-full">
      <main className="p-6 sm:p-8 lg:p-12">
        {/* Sección de Título */}
        <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Panel de Control</h1>
            <p className="text-lg text-slate-500 mt-2">
                Bienvenido de nuevo, <span className="font-semibold text-teal-600">{userName}</span>.
            </p>
        </div>

        {/* Sección de Acciones Rápidas */}
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.05 } }
            }}
        >
          {dashboardItems.map((item) => (
             <motion.div 
                key={item.title} 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <DashboardCard {...item} />
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
