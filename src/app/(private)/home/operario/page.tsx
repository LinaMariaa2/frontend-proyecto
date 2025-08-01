"use client";

import React from "react";
import Link from "next/link";
import { 
    CalendarClock, 
    Sprout, 
    Package, 
    BarChart2, 
    BookText, 
    Settings, 
    ChevronRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/app/context/UserContext"; // Asumiendo que tienes un UserContext

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
export default function OperarioHomePage() {
  const { user } = useUser(); // Obtener el usuario del contexto

  // --- Se define un array para las tarjetas para un código más limpio ---
  const dashboardItems: DashboardCardProps[] = [
    {
      title: "Invernaderos",
      description: "Consulta el estado de los invernaderos.",
      icon: Sprout,
      href: "/home/operario/invernaderos",
    },
    {
      title: "Cultivos",
      description: "Revisa la información de los cultivos.",
      icon: Package,
      href: "/home/operario/cultivos",
    },
    {
      title: "Estadísticas",
      description: "Visualiza datos de rendimiento.",
      icon: BarChart2,
      href: "/home/operario/estadisticas",
    },
    {
      title: "Bitácora",
      description: "Añade y revisa eventos importantes.",
      icon: BookText,
      href: "/home/operario/bitacora",
    },
    {
      title: "Configuraciones",
      description: "Ajusta tus preferencias y perfil.",
      icon: Settings,
      href: "/home/operario/configuraciones",
    },
  ];

  const userName = user?.nombre_usuario || "Operario";

  return (
    <div className="bg-slate-50 min-h-screen w-full">
      <main className="p-6 sm:p-8 lg:p-12">
        {/* Sección de Título */}
        <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Panel del Operario</h1>
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
