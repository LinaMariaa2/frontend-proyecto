// src/app/(private)/home/operario/configuraciones/page.tsx

"use client";

import React from "react";
import Link from "next/link";


interface ConfigurationCardProps {
  title: string;
  icon: React.ComponentType<any>; // Usamos 'any' aquí por simplicidad, pero idealmente sería SvgIconProps
  href: string;
}

function ConfigurationCard({ title, icon: Icon, href }: ConfigurationCardProps) {
  return (
    <Link
      href={href}
      className="bg-white hover:shadow-lg border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition duration-200 ease-in-out transform hover:scale-105"
    >
      <div className="text-green-600">
        <Icon className="w-10 h-10" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </Link>
  );
}

// Íconos reutilizados (copiados de tu OperarioHomePage para este ejemplo)
// Idealmente, estos íconos deberían estar en un archivo de componentes compartidos.
const IconConfiguraciones = (props: any) => ( // Usamos any aquí para evitar errores si no tienes SvgIconProps definida globalmente
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM17.25 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
    />
  </svg>
);

const IconAyuda = (props: any) => ( // Un ícono de ejemplo para "Ayuda"
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712L12 15l-2.121-2.121c-1.172-1.025-1.172-2.687 0-3.712z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.756 3 12s4.03 8.25 9 8.25z" />
  </svg>
);


export default function ConfiguracionesMenuPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-green-600 py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-white text-4xl font-bold text-center">
            Configuraciones del Operario
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Tarjeta para "Mi Perfil" */}
        <ConfigurationCard
          title="Mi Perfil"
          icon={IconConfiguraciones} // Puedes usar un ícono de perfil si tienes uno
          href="/home/operario/configuraciones/perfil"
        />

        {/* Tarjeta para "Ayuda" */}
        <ConfigurationCard
          title="Ayuda"
          icon={IconAyuda} // Usa el ícono que tengas para Ayuda
          href="/home/operario/configuraciones/ayuda"
        />
        {/* Aquí puedes añadir más tarjetas para otras opciones de configuración */}
      </main>
    </div>
  );
}
