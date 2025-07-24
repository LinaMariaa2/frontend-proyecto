"use client"; // Este layout debe ser un componente cliente para usar hooks como useState y useUser

import React, { useState } from 'react';
import { useUser } from '@/app/context/UserContext'; // Importa el contexto de usuario
import Header from '@/app/(private)/home/admin/components/Header';
import AdminSidebar from '@/app/(private)/home/admin/components/sidebar'; // Importa el Sidebar de Admin
import OperarioSidebar from '@/app/(private)/home/operario/components/sidebar'; // Importa el Sidebar de Operario

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser(); // Obtiene el usuario y el estado de carga del contexto
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado para controlar la visibilidad del sidebar

  // Función para alternar el estado del sidebar
  // Esta función no toma argumentos, simplemente invierte el estado actual
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Muestra un mensaje de carga mientras se obtiene la información del usuario
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
        Cargando aplicación...
      </div>
    );
  }

  // Si no hay usuario logeado después de la carga, muestra un mensaje de acceso denegado.
  // La lógica de redirección al login ya debería estar en UserContext.
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-red-500">
        Acceso denegado. Por favor, inicie sesión.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      {/* Sidebar: se renderiza condicionalmente según el rol del usuario */}
      {user.rol === 'admin' && (
        // Se pasa la prop toggleSidebar que es una función sin argumentos
        <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}
      {user.rol === 'operario' && (
        // Se pasa la prop toggleSidebar que es una función sin argumentos
        <OperarioSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* Área principal de contenido */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          // Ajusta el margen izquierdo del contenido principal según el estado del sidebar
          isSidebarOpen ? 'ml-60' : 'ml-16' 
      }`}>
        {/* Header: siempre presente en la parte superior */}
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Contenido de la página actual (children) */}
        {/* Se añade un padding superior para que el contenido no quede debajo del header fijo */}
        <main className="flex-1 p-4 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}