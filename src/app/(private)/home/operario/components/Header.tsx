"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Moon, Sun, Settings, LogOut, User as UserIcon, ChevronDown, Bell } from 'lucide-react';
import { useUser } from '@/app/context/UserContext'; 

// --- Interfaces y Tipos ---
interface HeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void; 
}

// --- Componente Principal del Header ---
const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
    const { user, logout, isLoading } = useUser();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Efecto para manejar el tema claro/oscuro
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDark(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
    }, []);

    // Efecto para cerrar el menú de perfil al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDark = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

    // Renderizado mientras carga el usuario
    if (isLoading) {
        return (
            <header className="flex justify-between items-center px-6 py-3 bg-white fixed top-0 left-0 w-full z-40 shadow-sm border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <button className="text-slate-500" disabled><Menu size={24} /></button>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">HortiTech</h1>
                </div>
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            </header>
        );
    }

    return (
        <header className="flex justify-between items-center px-6 py-3 bg-white fixed top-0 left-0 w-full z-40 shadow-sm border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="text-slate-600 dark:text-slate-400 focus:outline-none">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className={`text-xl font-bold text-slate-800 dark:text-white hidden sm:block ${isSidebarOpen && 'lg:hidden'}`}>HortiTech</h1>
            </div>

            {user ? (
                <div className="flex items-center gap-4">
                    {/* CAMBIO: Se añade el icono de notificaciones */}
                    <Link href={`/home/${user.rol}/notificaciones`} className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <Bell className="w-6 h-6"/>
                        {/* Indicador de notificaciones nuevas (lógica de ejemplo) */}
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
                    </Link>

                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 cursor-pointer group">
                            {user.foto_url && user.foto_url !== "/images/default-avatar.png" ? (
                                <Image
                                    src={user.foto_url}
                                    alt="Foto de perfil"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full border-2 border-slate-200 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                                </div>
                            )}
                            <div className="text-right hidden md:block">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{user.nombre_usuario || 'Usuario'}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user.rol || 'Rol Desconocido'}</p>
                            </div>
                             <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50 overflow-hidden border border-slate-200 dark:border-slate-700">
                                <div className="p-4 border-b dark:border-slate-700">
                                    <p className="font-semibold text-slate-800 dark:text-white">{user.nombre_usuario}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.correo}</p>
                                </div>
                                <ul className="flex flex-col text-slate-600 dark:text-slate-300">
                                    <li>
                                        <Link href={`/home/${user.rol}/configuraciones/perfil`} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-3">
                                            <UserIcon size={16} /> Ver Perfil
                                        </Link>
                                    </li>
                                    <li>
                                         <Link href={`/home/${user.rol}/configuraciones`} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-3">
                                            <Settings size={16} /> Configuraciones
                                        </Link>
                                    </li>
                                    <li onClick={toggleDark} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer flex items-center gap-3">
                                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                                        {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                                    </li>
                                    <li>
                                        <button onClick={logout} className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 text-red-600 dark:text-red-400">
                                            <LogOut size={16} /> Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <Link href="/login" className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">
                    Iniciar Sesión
                </Link>
            )}
        </header>
    );
};

export default Header;
