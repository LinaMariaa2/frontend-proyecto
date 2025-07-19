'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Moon, Sun, Settings, LogOut, User } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  // Cargar preferencia de tema al montar
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark =
      storedTheme === 'dark' ||
      (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  return (
    <>
      {/* Encabezado superior */}
      <header className="flex justify-between items-center px-4 py-3 bg-[#191c32] text-white fixed top-0 left-0 w-full z-50 shadow-md">
        {/* Botón + Título */}
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-3 focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <h1 className="text-xl font-bold">HortiTech</h1>
        </div>

        {/* Perfil con dropdown */}
        <div className="relative">
          <div onClick={toggleProfileMenu} className="flex items-center space-x-3 cursor-pointer">
            <img
              src="/img/user.jpg"
              alt="Perfil"
              className="w-10 h-10 rounded-full border border-aqua"
            />
            <div className="text-right hidden md:block">
              <p className="font-semibold">Julian Samboni</p>
              <p className="text-sm text-gray-400">Administrador</p>
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-black dark:bg-gray-800 dark:text-white rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700">
                <p className="font-semibold">Julian Samboni</p>
                <p className="text-sm text-gray-300">Administrador</p>
                <p className="text-sm text-gray-400">julian.samboni@hortitech.com</p>
              </div>
              <ul className="flex flex-col">
                <li
                  onClick={toggleDark}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? 'Modo claro' : 'Modo oscuro'}
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <User size={16} /> 
                    <Link href="/home/operario/configuraciones/perfil" className="hover:text-aqua"> Ver perfil</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <Settings size={16} />
                   <Link href="/home/operario/configuraciones" className="hover:text-aqua"> Configuracion</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-red-600">
                  <LogOut size={16} /> 
                  <Link href="/login" className="hover:text-aqua">  Cerrar sesión</Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar lateral */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#191c32] text-white w-60 pt-16 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <nav className="flex flex-col p-4 space-y-4">
          <Link href="/home/operario/invernaderos" className="hover:text-aqua">Invernaderos</Link>
          <Link href="/home/operario/cultivos" className="hover:text-aqua">Cultivos</Link>
          <Link href="/home/operario/bitacora" className="hover:text-aqua">Bitácora</Link>
          <Link href="/home/operario/configuraciones" className="hover:text-aqua">Configuración</Link>
          <Link href="/home/operario/configuraciones/ayuda" className="hover:text-aqua">Ayuda</Link>
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className={`transition-all duration-300 pt-16 ${isOpen ? 'ml-60' : 'ml-0'}`}>
        {/* Aquí va el contenido de la página */}
      </div>
    </>
  );
};

export default Sidebar;
