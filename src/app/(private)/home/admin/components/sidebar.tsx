"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Package, BarChart2, BookText, LogOut, Sprout, Leaf } from 'lucide-react';
import { useUser } from '@/app/context/UserContext';

// --- Interfaces y Tipos ---
interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

interface NavItemProps {
    item: {
        name: string;
        href: string;
        icon: React.ElementType;
    };
    isOpen: boolean;
    isActive: boolean;
}

// --- Componentes Reutilizables ---
const NavLink = ({ item, isOpen, isActive }: NavItemProps) => (
    <Link
      href={item.href}
      className={`flex items-center gap-4 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-teal-100 text-teal-800 font-semibold dark:bg-teal-700/30 dark:text-teal-200'
          : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/50'
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {isOpen && <span className="whitespace-nowrap font-medium">{item.name}</span>}
    </Link>
);

// --- Componente Principal del Sidebar ---
const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const pathname = usePathname();
    const { user, isLoading, logout } = useUser();

    if (isLoading) {
        return (
            <aside className={`fixed top-0 left-0 h-full bg-slate-100 dark:bg-slate-900 shadow-lg z-30 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex justify-center items-center`}>
                <p>Cargando...</p>
            </aside>
        );
    }

    if (!user || user.rol !== 'admin') {
         return (
            <aside className={`fixed top-0 left-0 h-full bg-slate-100 dark:bg-slate-900 shadow-lg z-30 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex justify-center items-center p-4`}>
                <p className="text-center text-slate-500">{!user ? "No hay sesión iniciada." : "Acceso denegado."}</p>
            </aside>
        );
    }

    const basePath = `/home/admin`;
    const navItems = [
        { name: 'Inicio', href: `${basePath}`, icon: Home },
        { name: 'Invernaderos', href: `${basePath}/invernaderos`, icon: Sprout },
        { name: 'Cultivos', href: `${basePath}/cultivos`, icon: Package },
        { name: 'Estadísticas', href: `${basePath}/estadisticas`, icon: BarChart2 },
        { name: 'Bitácora', href: `${basePath}/bitacora`, icon: BookText },
        { name: 'Configuraciones', href: `${basePath}/configuraciones`, icon: Settings },
    ];

    return (
        <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-30 dark:bg-slate-900 dark:border-slate-800 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
            {/* CAMBIO: Se elimina el perfil y se añade un logo/título */}
            <div className={`flex items-center gap-3 h-16 border-b border-slate-200 dark:border-slate-800 px-6 ${!isOpen && 'justify-center px-0'}`}>
                <Leaf className="w-7 h-7 text-teal-600 flex-shrink-0"/>
                {isOpen && <h1 className="text-xl font-bold text-slate-800 dark:text-white">HortiTech</h1>}
            </div>

            {/* CAMBIO: Aumentado el espaciado vertical con space-y-3 */}
            <nav className="flex-grow flex flex-col space-y-3 p-4 text-slate-700 dark:text-slate-300">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        item={item}
                        isOpen={isOpen}
                        isActive={pathname === item.href}
                    />
                ))}
            </nav>

            <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href="/login"
                  onClick={logout}
                  className={`flex items-center gap-4 px-4 py-2.5 rounded-lg transition-colors duration-200 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/10 ${!isOpen && 'justify-center'}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span className="whitespace-nowrap font-medium">Cerrar Sesión</span>}
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
