"use client";

import React from "react";
import Link from "next/link";
import { Droplet, Sun, ArrowRight } from "lucide-react";

// --- Interfaz para las propiedades de la tarjeta ---
interface EstadisticaCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  colorClass: string; // Para el gradiente del ícono
}

// --- Componente de Tarjeta Rediseñado ---
function EstadisticaCard({ title, description, icon: Icon, href, colorClass }: EstadisticaCardProps) {
  return (
    <Link
      href={href}
      className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col group hover:border-teal-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-slate-500 mt-1 mb-6 flex-grow">{description}</p>
      <div className="mt-auto font-semibold text-teal-600 flex items-center gap-2">
        <span>Ver reporte</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

// --- Componente Principal de la Página de Estadísticas ---
export default function Estadisticas() {
  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      {/* Cabecera */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Estadísticas</h1>
        <p className="text-lg text-slate-500 mt-1">
          Analiza el rendimiento y consumo de tus invernaderos.
        </p>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <EstadisticaCard
          title="Consumo de Agua"
          description="Visualiza datos históricos y en tiempo real sobre los ciclos de riego."
          icon={Droplet}
          href="/home/operario/estadisticas/riego"
          colorClass="bg-gradient-to-br from-sky-500 to-blue-600"
        />
        <EstadisticaCard
          title="Uso de Energía"
          description="Monitorea los sistemas de iluminación en tiempo real."
          icon={Sun}
          href="/home/operario/estadisticas/iluminacion"
          colorClass="bg-gradient-to-br from-amber-400 to-orange-500"
        />
      </div>
    </main>
  );
}
