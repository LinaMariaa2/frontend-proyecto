"use client";

import React, { JSX, useState, useEffect } from "react";
import { Bell, Check, AlertTriangle, Droplets, Sun, Sprout, Info } from "lucide-react";

// --- Interfaces y Tipos ---
interface Notificacion {
  id: number;
  tipo: "alerta" | "riego" | "iluminacion" | "cultivo" | "sistema";
  titulo: string;
  mensaje: string;
  timestamp: string; // Formato ISO 8601: "YYYY-MM-DDTHH:mm:ssZ"
  leida: boolean;
}

// --- Función para formatear el tiempo relativo ---
const formatTiempoRelativo = (timestamp: string) => {
  const ahora = new Date();
  const fechaNotificacion = new Date(timestamp);
  const diferenciaSegundos = Math.floor(
    (ahora.getTime() - fechaNotificacion.getTime()) / 1000
  );

  const minutos = Math.floor(diferenciaSegundos / 60);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `hace ${dias} día(s)`;
};

// --- Componente Card ---
const NotificacionCard = ({ notificacion, onMarcarComoLeida }: { notificacion: Notificacion, onMarcarComoLeida: (id: number) => void }) => {
  const config: Record<
    Notificacion["tipo"],
    {
      color: "red" | "blue" | "amber" | "green" | "slate";
      icon: JSX.Element;
    }
  > = {
    alerta: { color: "red", icon: <AlertTriangle /> },
    riego: { color: "blue", icon: <Droplets /> },
    iluminacion: { color: "amber", icon: <Sun /> },
    cultivo: { color: "green", icon: <Sprout /> },
    sistema: { color: "slate", icon: <Check /> },
  };

  const { color, icon } = config[notificacion.tipo] || {
    color: "slate",
    icon: <Info />,
  };

  const colorClasses = {
    red: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-500",
      text: "text-amber-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-600",
    },
    slate: {
      bg: "bg-slate-100",
      border: "border-slate-400",
      text: "text-slate-600",
    },
  };

  const style = colorClasses[color];

  return (
    <div
      onClick={() => onMarcarComoLeida(notificacion.id)}
      className={`p-4 flex items-start gap-4 rounded-lg border-l-4 cursor-pointer transition-colors ${style.border} ${
        notificacion.leida ? "bg-white" : `${style.bg} hover:bg-opacity-80`
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}
      >
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800">{notificacion.titulo}</h3>
        <p className="text-sm text-slate-600 mt-1">{notificacion.mensaje}</p>
        <p className="text-xs text-slate-400 mt-2">
          {formatTiempoRelativo(notificacion.timestamp)}
        </p>
      </div>
      {!notificacion.leida && (
        <div
          className="w-2.5 h-2.5 bg-teal-500 rounded-full self-center flex-shrink-0"
          title="No leída"
        ></div>
      )}
    </div>
  );
};

// --- Componente Principal ---
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/visita");
      if (!res.ok) {
        throw new Error("No se pudo cargar las notificaciones desde la API.");
      }
      const data = await res.json();
      const formattedData = data
        .map((visita: any) => ({
          id: visita.id_visita,
          tipo: "alerta",
          titulo: `Nueva visita: ${visita.nombre_visitante}`,
          mensaje: visita.motivo || "Motivo no especificado",
          timestamp: visita.createdAt,
          leida: visita.leida, // Ahora usamos el estado 'leida' de la base de datos
        }))
        .sort((a: Notificacion, b: Notificacion) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotificaciones(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const marcarComoLeida = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:4000/api/visita/marcar-leida/${id}`, {
        method: 'PUT',
      });
      if (!res.ok) {
        throw new Error("No se pudo marcar la notificación como leída.");
      }
      fetchNotificaciones(); // Vuelve a cargar los datos para reflejar el cambio en la base de datos
    } catch (err: any) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/visita/marcar-todas-leidas`, {
        method: 'PUT',
      });
      if (!res.ok) {
        throw new Error("No se pudo marcar todas las notificaciones como leídas.");
      }
      fetchNotificaciones(); // Vuelve a cargar los datos para reflejar el cambio en la base de datos
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Bell className="w-10 h-10 text-slate-500" />
            <span>Notificaciones</span>
          </h1>
          <p className="text-lg text-slate-500 mt-1">
            Aquí encontrarás las últimas alertas y actualizaciones del sistema.
          </p>
        </div>
        {noLeidasCount > 0 && (
          <button
            onClick={marcarTodasComoLeidas}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Marcar todas como leídas ({noLeidasCount})</span>
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          {loading ? (
            <p className="text-center text-slate-500">Cargando notificaciones...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : notificaciones.length > 0 ? (
            <div className="space-y-4">
              {notificaciones.map((item) => (
                <NotificacionCard key={item.id} notificacion={item} onMarcarComoLeida={marcarComoLeida} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">No hay notificaciones</p>
          )}
        </div>
      </div>
    </main>
  );
}
