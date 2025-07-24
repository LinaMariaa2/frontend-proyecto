"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Leaf,
    BarChart2,
    BookText,
    Home,
    Settings,
    User as UserIcon
} from 'lucide-react';
import { useUser } from '@/app/context/UserContext';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const pathname = usePathname();
    const { user, isLoading } = useUser();

    const getNavItems = (userRole: string) => [
        { name: 'Mis Invernaderos', href: `/home/${userRole}/invernaderos`, icon: Home },
        { name: 'Mis Cultivos', href: `/home/${userRole}/cultivos`, icon: Leaf },
        { name: 'Mi Bitácora', href: `/home/${userRole}/bitacora`, icon: BookText },
        { name: 'Mis Estadísticas', href: `/home/${userRole}/estadisticas`, icon: BarChart2 },
        { name: 'Configuración', href: `/home/${userRole}/configuraciones`, icon: Settings },
    ];

    if (isLoading) {
        return (
            <aside className="fixed top-0 left-0 h-full w-64 bg-gray-100 text-black shadow-lg p-4 z-30 dark:bg-gray-900 dark:text-white flex justify-center items-center">
                Cargando información del usuario...
            </aside>
        );
    }

    if (!user) {
        return (
            <aside className="fixed top-0 left-0 h-full w-64 bg-gray-100 text-black shadow-lg p-4 z-30 dark:bg-gray-900 dark:text-white flex flex-col justify-center items-center text-gray-500">
                <p className="text-center">No hay sesión iniciada.</p>
                <Link href="/login" className="mt-4 text-green-600 hover:underline">Ir al Login</Link>
            </aside>
        );
    }

    if (user.rol !== 'operario') {
        return (
            <aside className="fixed top-0 left-0 h-full w-64 bg-gray-100 text-black shadow-lg p-4 z-30 dark:bg-gray-900 dark:text-white flex justify-center items-center">
                <p className="text-red-500">Acceso denegado para este rol.</p>
            </aside>
        );
    }

    const navItems = getNavItems(user.rol);

    return (
        <aside
            className={`fixed top-0 left-0 h-screen bg-gray-100 border-r border-gray-200 pt-16 transition-all duration-300 z-30 dark:bg-gray-900 dark:border-gray-700 ${
                isOpen ? 'w-60' : 'w-16'
            } flex flex-col`}
        >
            <div className={`flex flex-col items-center p-4 border-b border-gray-200 dark:border-gray-700 ${isOpen ? '' : 'hidden'}`}>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-500 shadow-md mb-2">
                    <img
                        src={user.foto_url || "/img/user.jpg"}
                        alt="Foto de perfil"
                        // Añadido key para forzar re-render si la URL de la imagen cambia
                        key={user.foto_url || "default-user-img-sidebar"} 
                        className="object-cover w-full h-full"
                    />
                </div>
                <p className="font-semibold text-gray-800 dark:text-white text-center">{user.nombre_usuario}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center capitalize">{user.rol}</p>
                <Link
                    href={`/home/${user.rol}/configuraciones/perfil`}
                    className="text-xs text-green-600 hover:underline mt-1"
                >
                    Ver perfil
                </Link>
            </div>

            <nav className="flex-grow flex flex-col space-y-2 px-2 py-4 text-gray-700 dark:text-gray-300">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-200 ${
                            pathname === item.href
                                ? 'bg-green-200 text-green-800 font-semibold dark:bg-green-700 dark:text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        // onClick={toggleSidebar} // Descomentar si quieres que el sidebar se cierre al hacer clic en un enlace
                    >
                        <item.icon size={20} />
                        {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
