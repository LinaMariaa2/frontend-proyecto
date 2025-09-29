"use client";
import React from "react";
import Link from "next/link";
import { User, Users, LogOut, UserPlus, Settings } from "lucide-react";

// --- Tipos de Datos ---
interface ConfiguracionItem {
  nombre: string;
  descripcion: string;
  icono: React.ElementType;
  href: string;
  isDestructive?: boolean;
}

// --- Datos de Configuración ---
const configuraciones: ConfiguracionItem[] = [
  {
    nombre: "Mi Perfil",
    descripcion: "Administra tu información personal y contraseña.",
    icono: User,
    href: "/home/admin/configuraciones/perfil",
  },
  {
    nombre: "Gestión de Usuarios",
    descripcion: "Crea, edita, activa o desactiva usuarios.",
    icono: Users,
    href: "/home/admin/configuraciones/usuarios",
  },
   {
    nombre: "Registrar Nuevo Usuario",
    descripcion: "Añade un nuevo administrador u operario al sistema.",
    icono: UserPlus,
    href: "/home/admin/configuraciones/registro",
  },
  {
    nombre: "Cerrar Sesión",
    descripcion: "Finaliza tu sesión actual de forma segura.",
    icono: LogOut,
    href: "/login", 
    isDestructive: true,
  },
];


// --- Componente de Tarjeta de Configuración ---
const ConfiguracionCard = ({ item }: { item: ConfiguracionItem }) => {
  const Icono = item.icono;
  const baseClasses = "bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-start gap-5 transition-all duration-300 group";
  const hoverClasses = item.isDestructive 
    ? "hover:border-red-300 hover:bg-red-50" 
    : "hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-md hover:-translate-y-1";

  return (
    <Link href={item.href} className={`${baseClasses} ${hoverClasses}`}>
      <div className={`p-3 rounded-lg ${item.isDestructive ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-700'}`}>
        <Icono className="h-6 w-6" />
      </div>
      <div>
        <h2 className={`text-lg font-bold ${item.isDestructive ? 'text-red-800' : 'text-slate-800'}`}>{item.nombre}</h2>
        <p className="text-slate-500 text-sm mt-1">{item.descripcion}</p>
      </div>
    </Link>
  );
};


// --- Componente Principal ---
export default function ConfiguracionesPage() {
  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
       <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Settings className="w-10 h-10 text-slate-500"/>
            <span>Configuración</span>
          </h1>
          <p className="text-lg text-slate-500 mt-1">Gestiona tu cuenta y los ajustes del sistema.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configuraciones.map((item) => (
          <ConfiguracionCard key={item.nombre} item={item} />
        ))}
      </div>
    </main>
  );
}
