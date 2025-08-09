// src/app/(private)/home/admin/layout.tsx

"use client";


import React, { useState, useEffect } from 'react';

import Sidebar from "@/app/(private)/home/operario/components/sidebar";

import Header from "@/app/(private)/home/operario/components/Header"; // Importa el componente Header

import { UserProvider } from "@/app/context/UserContext";


export default function OperarioLayout({ children }: { children: React.ReactNode }) {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  useEffect(() => {

    const storedSidebarState = localStorage.getItem('sidebarOpen');

    if (storedSidebarState !== null) {

      setIsSidebarOpen(storedSidebarState === 'true');

    }

  }, []);


  const toggleSidebar = () => {

    const newState = !isSidebarOpen;

    setIsSidebarOpen(newState);

    localStorage.setItem('sidebarOpen', newState.toString());

  };


  return (

    <UserProvider>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">

        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

       

        <Sidebar isOpen={isSidebarOpen} />

       

        <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'ml-60' : 'ml-16'} p-4`}>

          {children}

        </main>

      </div>

    </UserProvider>

  );

}