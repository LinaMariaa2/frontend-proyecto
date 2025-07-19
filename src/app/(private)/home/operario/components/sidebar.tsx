'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Moon,
  Sun,
  Settings,
  LogOut,
  User,
  Leaf,
  BarChart2,
  BookText,
  Home,
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
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
      {/* Encabezado */}
      <header className="flex justify-between items-center px-4 py-3 bg-gray-100 text-black fixed top-0 left-0 w-full z-40 shadow-md">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-3 focus:outline-none">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold">HortiTech</h1>
        </div>

        {/* Menú de perfil */}
        <div className="relative">
          <div onClick={toggleProfileMenu} className="flex items-center space-x-3 cursor-pointer">
            <img
              src="/img/user.jpg"
              alt="Perfil"
              className="w-10 h-10 rounded-full border border-gray-400"
            />
            {isOpen && (
              <div className="text-right hidden md:block">
                <p className="font-semibold">Julian Samboni</p>
                <p className="text-sm text-gray-500">Administrador</p>
              </div>
            )}
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
                  <Link href="/home/operario/configuraciones/perfil">Ver perfil</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <Settings size={16} />
                  <Link href="/home/operario/configuraciones">Configuración</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-red-600">
                  <LogOut size={16} />
                  <Link href="/login">Cerrar sesión</Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-100 border-r border-gray-200 pt-16 transition-all duration-300 z-30 ${
          isOpen ? 'w-60' : 'w-16'
        }`}
      >
        <nav className="flex flex-col space-y-2 px-2 py-4 text-gray-700">
          {/* Invernaderos sin submenú */}
          <Link
            href="/home/operario/invernaderos"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <Home size={20} />
            {isOpen && <span>Invernaderos</span>}
          </Link>

          {/* Resto de enlaces */}
          <Link
            href="/home/operario/cultivos"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <Leaf size={20} />
            {isOpen && <span>Cultivos</span>}
          </Link>
          <Link
            href="/home/operario/bitacora"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <BookText size={20} />
            {isOpen && <span>Bitácora</span>}
          </Link>
          <Link
            href="/home/operario/estadisticas"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <BarChart2 size={20} />
            {isOpen && <span>Estadísticas</span>}
          </Link>
          <Link
  href="/home/operario/configuraciones"
  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition"
>
  <Settings size={20} />
  {isOpen && <span>Configuración</span>}
</Link>

        </nav>
      </aside>

      {/* Contenido principal desplazado */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isOpen ? 'ml-60' : 'ml-16'
        } p-4`}
      >
        {/* Aquí va tu contenido */}
      </main>
    </>
  );
};

export default Sidebar;
