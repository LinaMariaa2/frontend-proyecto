"use client";

import React from "react";
import Link from "next/link";

function DashboardCard({ title, icon: Icon, href }) {
  return (
    <Link
      href={href}
      className="bg-white hover:shadow-lg border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition"
    >
      <div className="text-green-600">
        <Icon className="w-10 h-10" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </Link>
  );
}

const IconProgramacion = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15m0 0l-3.249 2.871m3.249-2.871V3m0 0l-3.249 2.871m0 0A9.006 9.006 0 013 12.75V15"
    />
  </svg>
);

const IconInvernaderos = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8.25 21v-4.717c0-1.745-.968-3.413-2.614-4.296L4 10.707V15m11.25 6v-4.717
       c0-1.745.968-3.413 2.614-4.296L20 10.707V15m-11.25 6h6m-12 0H3c-.621 0-1.125-.504-1.125-1.125
       V18.75c0-.621.504-1.125 1.125-1.125H3.75m0 2.25H21A2.25 2.25 0 0023.25 18v-5.625h-.525C22.376
       12.352 22 11.66 22 10.875c0-.784.376-1.476.975-1.993V7.5C22.285 6.47 21.328 5.625 20.25 
       5.625h-3.75V4.72c0-.546-.388-1.005-.907-1.005-.443 0-.81-.237-.99-.619L14.757 2.25H9.243L8.697 
       3.106C8.517 3.488 8.15 3.725 7.707 3.725c-.519 0-.907.459-.907 1.005V5.625H3.75c-1.078 
       0-1.95.845-1.95 1.905V18.75A2.25 2.25 0 003 21h6.75Z"
    />
  </svg>
);

const IconEstadisticas = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 13.125l6-6 9 9V17.25m0 0a3.75 3.75 0 11.25 3.75a3.75 3.75 0 01-.25-3.75M12 
      21.75V17.25" />
  </svg>
);

const IconAgenda = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 
      2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 
      0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 
      11.25v7.5" />
  </svg>
);

const IconConfiguraciones = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 
      0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM17.25 
      6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 
      1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
    />
  </svg>
);

export default function HomePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-green-600 py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-white text-4xl font-bold text-center">HortiTech</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        
        <DashboardCard
          title="Invernaderos"
          icon={IconProgramacion}
          href="/home/admin/invernaderos"
        />
        <DashboardCard
          title="Cultivos"
          icon={IconInvernaderos}
          href="/home/admin/cultivos"
        />
        <DashboardCard
          title="Estadísticas"
          icon={IconEstadisticas}
          href="/home/admin/estadisticas"
        />
        <DashboardCard
          title="Bitácora"
          icon={IconAgenda}
          href="/home/admin/bitacora"
        />
        <DashboardCard
          title="Configuraciones"
          icon={IconConfiguraciones}
          href="/home/admin/configuraciones"
        />
      </main>
      

    </div>
    
  );
}
