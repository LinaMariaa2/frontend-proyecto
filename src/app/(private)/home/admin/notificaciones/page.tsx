"use client";

import React, { useState } from 'react';
import { Bell, Check, AlertTriangle, Droplets, Sun, Sprout } from 'lucide-react';

// --- Interfaces y Tipos ---
interface Notificacion {
  id: number;
  tipo: 'alerta' | 'riego' | 'iluminacion' | 'cultivo' | 'sistema';
  titulo: string;
  mensaje: string;
  timestamp: string; // Formato ISO 8601: "YYYY-MM-DDTHH:mm:ssZ"
  leida: boolean;
}

// --- Datos Quemados ---
const notificacionesIniciales: Notificacion[] = [
  {
    id: 1,
    tipo: 'alerta',
    titulo: 'Humedad Baja en Zona A-1',
    mensaje: 'El sensor de humedad ha detectado niveles por debajo del 30%. Se recomienda iniciar un ciclo de riego.',
    timestamp: '2025-08-03T09:20:00-05:00',
    leida: false,
  },
  {
    id: 2,
    tipo: 'riego',
    titulo: 'Riego Completado en Zona B-3',
    mensaje: 'El ciclo de riego programado para las 08:00 AM ha finalizado exitosamente.',
    timestamp: '2025-08-03T08:30:00-05:00',
    leida: false,
  },
  {
    id: 3,
    tipo: 'iluminacion',
    titulo: 'Luces Encendidas en Invernadero Norte',
    mensaje: 'Se ha activado el sistema de iluminación de soporte según la programación.',
    timestamp: '2025-08-03T06:00:00-05:00',
    leida: true,
  },
  {
    id: 4,
    tipo: 'cultivo',
    titulo: 'Nuevo Cultivo Asignado',
    mensaje: 'Se ha asignado el cultivo "Tomates Cherry" a la Zona C-2.',
    timestamp: '2025-08-02T15:45:00-05:00',
    leida: true,
  },
   {
    id: 5,
    tipo: 'sistema',
    titulo: 'Actualización de Software Completada',
    mensaje: 'El sistema ha sido actualizado a la versión 2.1.0. No se requiere ninguna acción.',
    timestamp: '2025-08-01T22:00:00-05:00',
    leida: true,
  },
];

// --- Componentes Reutilizables ---

// Función para formatear el tiempo relativo
const formatTiempoRelativo = (timestamp: string) => {
    const ahora = new Date();
    const fechaNotificacion = new Date(timestamp);
    const diferenciaSegundos = Math.floor((ahora.getTime() - fechaNotificacion.getTime()) / 1000);

    const minutos = Math.floor(diferenciaSegundos / 60);
    if (minutos < 1) return 'hace un momento';
    if (minutos < 60) return `hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    return `hace ${dias} día(s)`;
};

const NotificacionCard = ({ notificacion }: { notificacion: Notificacion }) => {
    const config = {
        alerta: { color: "red", icon: <AlertTriangle /> },
        riego: { color: "blue", icon: <Droplets /> },
        iluminacion: { color: "amber", icon: <Sun /> },
        cultivo: { color: "green", icon: <Sprout /> },
        sistema: { color: "slate", icon: <Check /> },
    };

    const { color, icon } = config[notificacion.tipo] || config.sistema;
    
    const colorClasses = {
        red: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-600' },
        green: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600' },
        slate: { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-600' },
    };

    const currentStyle = colorClasses[color];

    return (
        <div className={`p-4 flex items-start gap-4 rounded-lg border-l-4 ${currentStyle.border} ${notificacion.leida ? 'bg-white' : `${currentStyle.bg}`}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${currentStyle.bg} ${currentStyle.text}`}>
                {React.cloneElement(icon, { className: 'w-5 h-5' })}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-slate-800">{notificacion.titulo}</h3>
                <p className="text-sm text-slate-600 mt-1">{notificacion.mensaje}</p>
                <p className="text-xs text-slate-400 mt-2">{formatTiempoRelativo(notificacion.timestamp)}</p>
            </div>
            {!notificacion.leida && (
                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full self-center flex-shrink-0" title="No leída"></div>
            )}
        </div>
    );
};


// --- Componente Principal ---
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState(notificacionesIniciales);

  const marcarTodasComoLeidas = () => {
      setNotificaciones(notificaciones.map(n => ({...n, leida: true})));
  };

  const noLeidasCount = notificaciones.filter(n => !n.leida).length;

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Bell className="w-10 h-10 text-slate-500"/>
            <span>Notificaciones</span>
          </h1>
          <p className="text-lg text-slate-500 mt-1">Aquí encontrarás las últimas alertas y actualizaciones del sistema.</p>
        </div>
        {noLeidasCount > 0 && (
            <button 
                onClick={marcarTodasComoLeidas}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
                <Check className="w-5 h-5"/>
                <span>Marcar todas como leídas ({noLeidasCount})</span>
            </button>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="space-y-4">
                {notificaciones.map((item) => (
                    <NotificacionCard key={item.id} notificacion={item} />
                ))}
            </div>
        </div>
      </div>
    </main>
  );
}
