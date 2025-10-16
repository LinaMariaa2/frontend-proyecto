"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, AlertTriangle, Droplet, Sun } from "lucide-react";
import { io, Socket } from "socket.io-client";

// --- Interfaces y Tipos ---
interface NotificacionRecibida {
  id?: number;
  tipo?: string;
  titulo?: string;
  mensaje?: string;
  createdAt?: string;
  timestamp?: string;
  fecha?: string;
  fecha_activacion?: string;
  leida?: boolean;
  descripcion?: string;
}

interface Notificacion {
  id: number;
  tipo: string; // "riego" | "iluminacion" | "general"
  titulo: string;
  mensaje: string;
  createdAt: string;
  leida: boolean;
}

// --- Normalizar fecha al mismo campo createdAt ---
const normalizarNotificacion = (p: NotificacionRecibida): Notificacion | null => {
  if (!p) return null;

  const mensaje = p.mensaje ?? p.descripcion ?? "";
  if (!mensaje) return null;

  const tipo = p.tipo ?? "general";
  let titulo = p.titulo ?? "";

  if (!titulo) {
    if (tipo === "inicio_riego" || tipo === "fin_riego") titulo = "Programación de riego";
    else if (tipo === "iluminacion_inicio" || tipo === "iluminacion_fin") titulo = "Programación de iluminación";
    else titulo = "Notificación";
  }

  const fecha =
    p.createdAt ?? p.timestamp ?? p.fecha ?? p.fecha_activacion ?? new Date().toISOString();

  return {
    id: p.id ?? Math.floor(Math.random() * 100000),
    tipo,
    titulo,
    mensaje,
    leida: p.leida ?? false,
    createdAt: fecha,
  };
};


// --- Función para formatear el tiempo relativo ---
const formatTiempoRelativo = (timestamp: string): string => {
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

// --- Componente NotificacionCard ---
const NotificacionCard: React.FC<{
  notificacion: Notificacion;
  onMarcarComoLeida: (id: number) => void;
}> = ({ notificacion, onMarcarComoLeida }) => {
  const colorClasses =
  notificacion.tipo === "inicio_riego" || notificacion.tipo === "fin_riego" 
    ? { bg: "bg-teal-50", border: "border-teal-500", text: "text-teal-600" }
    : notificacion.tipo === "iluminacion" || notificacion.tipo === "iluminacion_inicio" || notificacion.tipo === "iluminacion_fin"
    ? { bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-600" }
    : { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-500" };

  const handleCardClick = () => {
    if (!notificacion.leida) {
      onMarcarComoLeida(notificacion.id);
    }
  };

  const Icon =
  notificacion.tipo === "inicio_riego" || notificacion.tipo === "fin_riego"
    ? Droplet
    : notificacion.tipo === "iluminacion" || notificacion.tipo === "iluminacion_inicio" || notificacion.tipo === "iluminacion_fin"
    ? Sun
    : AlertTriangle;

  return (
    <div
      onClick={handleCardClick}
      className={`p-4 flex items-start gap-4 rounded-lg border-l-4 cursor-pointer transition-colors ${colorClasses.border} ${
        notificacion.leida
        ? "bg-white opacity-50" // <-- opaca si ya fue leída
        : `${colorClasses.bg} hover:bg-opacity-80`
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClasses.bg} ${colorClasses.text}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800">{notificacion.titulo}</h3>
        <p className="text-sm text-slate-600 mt-1">{notificacion.mensaje}</p>
        <p className="text-xs text-slate-400 mt-2">
          {formatTiempoRelativo(notificacion.createdAt)}
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
export default function NotificacionesOperario() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = async () => {
    try {
      const res = await fetch("https://backendhortitech.onrender.com/api/notificaciones/operario");
      if (!res.ok) throw new Error("No se pudo cargar las notificaciones desde la API.");
      const data: NotificacionRecibida[] = await res.json();
      const formattedData = data
        .map(normalizarNotificacion)
        .filter(
          (n): n is Notificacion =>
            n !== null && (n.tipo === "alerta_sensor" || n.tipo === "info_sensor" || n.tipo === "inicio_riego" || n.tipo === "fin_riego" || n.tipo === "iluminacion_inicio" || n.tipo === "iluminacion_fin")
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotificaciones(formattedData);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();

    const socket: Socket = io("https://backendhortitech.onrender.com", {
      query: { role: "operario" }
    });


    socket.on("nuevaNotificacion", (nueva: NotificacionRecibida) => {
      const normalizada = normalizarNotificacion(nueva);
      if (!normalizada) return;
      if (
        normalizada.tipo !== "alerta_sensor" &&
        normalizada.tipo !== "info_sensor" &&
        normalizada.tipo !== "inicio_riego" &&
        normalizada.tipo !== "fin_riego" &&
        normalizada.tipo !== "iluminacion_inicio" &&
        normalizada.tipo !== "iluminacion_fin"
      ) return;

      setNotificaciones((prev) => [normalizada, ...prev]);
    });


    socket.on("notificacionLeida", (id: number) => {
      setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    });

    socket.on("notificacionesActualizadas", () => {
      fetchNotificaciones();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const marcarComoLeida = async (id: number) => {
    try {
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));

      const res = await fetch(`https://backendhortitech.onrender.com/api/notificaciones/marcar-leida/${id}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("No se pudo marcar la notificación como leída.");
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));

      const res = await fetch(`https://backendhortitech.onrender.com/api/notificaciones/marcar-todas-leidas`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("No se pudo marcar todas como leídas.");
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
            Aquí encontrarás las alertas de riego e iluminación.
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
              {notificaciones.map((n) => (
                <NotificacionCard key={n.id} notificacion={n} onMarcarComoLeida={marcarComoLeida} />
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
