"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Moon, Sun, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useUser } from '@/app/context/UserContext'; 

interface HeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void; 
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
    const { user, logout, isLoading } = useUser();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark =
            storedTheme === 'dark' ||
            (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDark(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
    }, []);

    const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
    const toggleDark = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

   
    if (isLoading) {
        return (
            <header className="flex justify-between items-center px-4 py-3 bg-gray-100 text-black fixed top-0 left-0 w-full z-40 shadow-md dark:bg-gray-900 dark:text-white">
                <div className="flex items-center">
                    <button className="mr-3 focus:outline-none" disabled>
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-bold">HortiTech</h1>
                </div>
                <div>Loading...</div>
            </header>
        );
    }

  
    if (!user) {
        return (
            <header className="flex justify-between items-center px-4 py-3 bg-gray-100 text-black fixed top-0 left-0 w-full z-40 shadow-md dark:bg-gray-900 dark:text-white">
                <div className="flex items-center">
                    
                    <button className="mr-3 focus:outline-none" onClick={toggleSidebar}>
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <h1 className="text-xl font-bold">HortiTech</h1>
                </div>
                <Link href="/login" className="text-green-600 hover:underline">Login</Link>
            </header>
        );
    }


    return (
        <header className="flex justify-between items-center px-4 py-3 bg-gray-100 text-black fixed top-0 left-0 w-full z-40 shadow-md dark:bg-gray-900 dark:text-white">
            <div className="flex items-center">
              
                <button onClick={toggleSidebar} className="mr-3 focus:outline-none">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="text-xl font-bold">HortiTech</h1>
            </div>

        
            <div className="relative">
                <div onClick={toggleProfileMenu} className="flex items-center space-x-3 cursor-pointer">
                   
                    <img
                        src={user.foto_url || "/img/user.jpg"}
                        alt="Profile"
                      
                        key={user.foto_url || "default-user-img"} 
                        className="w-10 h-10 rounded-full border border-gray-400 object-cover"
                    />
                    <div className="text-right hidden md:block">
                        <p className="font-semibold">{user.nombre_usuario || 'User'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.rol || 'Unknown Role'}</p>
                    </div>
                </div>

                {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white text-black dark:bg-gray-800 dark:text-white rounded-lg shadow-lg z-50 overflow-hidden">
                     
                        <div className="p-4 border-b dark:border-gray-700">
                            <p className="font-semibold">{user.nombre_usuario}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{user.rol}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.correo}</p>
                        </div>
                        <ul className="flex flex-col">
                            <li
                                onClick={toggleDark}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                            >
                                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                                {isDark ? 'Light mode' : 'Dark mode'}
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                                <UserIcon size={16} />
                                <Link href={`/home/${user.rol}/configuraciones/perfil`}>View profile</Link>
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                                <Settings size={16} />
                                <Link href={`/home/${user.rol}/configuraciones`}>Settings</Link>
                            </li>
                            <li>
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
