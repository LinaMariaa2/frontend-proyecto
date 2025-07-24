"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Package, BarChart2, BookText, X, User as UserIcon } from 'lucide-react';
import { useUser } from '@/app/context/UserContext';

// Interfaz de las propiedades que el componente Sidebar espera recibir
interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void; // AHORA SÍ ESPERA UNA FUNCIÓN SIN ARGUMENTOS
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const pathname = usePathname();
    const { user, isLoading } = useUser();

    // Muestra un estado de carga si el usuario aún no ha cargado
    if (isLoading) {
        return (
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-100 text-black shadow-lg p-4 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:text-white flex justify-center items-center`}>
                Cargando información del usuario...
            </aside>
        );
    }

    // Si no hay usuario logeado después de la carga, muestra un mensaje
    if (!user) {
        return (
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-100 text-black shadow-lg p-4 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:text-white flex flex-col justify-center items-center text-gray-500`}>
                <p className="text-center">No hay sesión iniciada.</p>
                <Link href="/login" className="mt-4 text-green-600 hover:underline">Ir al Login</Link>
            </aside>
        );
    }

    // Si el usuario no es un admin, no renderizamos este sidebar
    if (user.rol !== 'admin') {
        return (
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-100 text-black shadow-lg p-4 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:text-white flex justify-center items-center`}>
                <p className="text-red-500">Acceso denegado para este rol.</p>
            </aside>
        );
    }

    const basePath = `/home/${user.rol}`;

    const navItems = [
        { name: 'Inicio', href: `${basePath}`, icon: Home },
        { name: 'Gestión de Usuarios', href: `${basePath}/usuarios`, icon: UserIcon }, // Ejemplo de ruta específica de admin
        { name: 'Cultivos', href: `${basePath}/cultivos`, icon: Package },
        { name: 'Estadísticas', href: `${basePath}/estadisticas`, icon: BarChart2 },
        { name: 'Invernaderos', href: `${basePath}/invernaderos`, icon: BookText },
        { name: 'Configuraciones', href: `${basePath}/configuraciones`, icon: Settings },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 h-screen bg-gray-100 border-r border-gray-200 pt-16 transition-all duration-300 z-30 dark:bg-gray-900 dark:border-gray-700 ${
                isOpen ? 'w-60' : 'w-16'
            } flex flex-col`}
        >
            {/* Sección de perfil en el sidebar de Admin (opcional, si lo quieres igual al de Operario) */}
            {/* Si quieres que el admin sidebar también muestre la foto y el nombre, descomenta y adapta esto: */}
            {/*
            <div className={`flex flex-col items-center p-4 border-b border-gray-200 dark:border-gray-700 ${isOpen ? '' : 'hidden'}`}>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-500 shadow-md mb-2">
                    <img
                        src={user.foto_url || "/img/user.jpg"}
                        alt="Foto de perfil"
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
            */}

            <nav className="flex-grow flex flex-col space-y-2 px-2 py-4 text-gray-700 dark:text-gray-300">
                <div className="flex justify-between items-center mb-6 px-2">
                    {isOpen && <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">Admin Nav</h2>}
                    <button onClick={toggleSidebar} className="focus:outline-none text-gray-600 dark:text-gray-400">
                        <X size={24} />
                    </button>
                </div>
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-200 ${
                            pathname === item.href
                                ? 'bg-green-200 text-green-800 font-semibold dark:bg-green-700 dark:text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        // Puedes usar toggleSidebar aquí si quieres que el sidebar se cierre al hacer clic en un enlace
                        // onClick={toggleSidebar}
                    >
                        <item.icon size={20} />
                        {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                    </Link>
                ))}
            </nav>

            {user && isOpen && (
                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 px-2">
                    <p className="font-semibold">Usuario: {user.nombre_usuario}</p>
                    <p>Rol: {user.rol}</p>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
