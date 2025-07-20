"use client";

import React from "react";
import Link from "next/link";
import { Droplet, Sun } from "lucide-react";

interface DashboardCardProps {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

function DashboardCard({ title, icon: Icon, href }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="bg-white border border-gray-200 rounded-2xl p-9 flex flex-col items-center justify-center gap-4 shadow-md hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-1 w-full max-w-xs mx-auto"
    >
      <div className="w-25 h-24 rounded-full flex items-center justify-center bg-gray-100 shadow-inner">
        <Icon className="w-10 h-10 text-gray-700" />
      </div>
      <h2 className="text-xl font-semibold text-green-800 text-center">{title}</h2>
    </Link>
  );
}

export default function Estadisticas() {
  return (
    <main className="bg-gray-50 min-h-screen py-14 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-green-700 text-center mb-12">
        Estadísticas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        <DashboardCard
          title="Estadísticas de Riego"
          icon={Droplet}
          href="/home/admin/estadisticas/riego"
        />
        <DashboardCard
          title="Estadísticas de Iluminación"
          icon={Sun}
          href="/home/admin/estadisticas/iluminacion"
        />
      </div>
    </main>
  );
}
