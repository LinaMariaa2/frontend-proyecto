"use client";

import React, { JSX, useState, useEffect } from "react";
import { Bell, Check, AlertTriangle, XCircle } from "lucide-react";

// --- Interfaces y Tipos ---
interface Visita {
  id_visita: number;
  nombre_visitante: string;
  motivo: string;
  createdAt: string;
  leida: boolean;
  ciudad: string;
  fecha_visita: string;
  correo: string;
  identificacion: string;
  telefono: string;
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

// --- Componente Card (con funcionalidad de expansión) ---
const NotificacionCard = ({
  visita,
  onMarcarComoLeida,
  onSeleccionar,
}: {
  visita: Visita;
  onMarcarComoLeida: (id: number) => void;
  onSeleccionar: (visita: Visita) => void;
  estaSeleccionada: boolean; // Este prop no se usa en este componente, pero no causa problema
}) => {
  const colorClasses = {
    bg: "bg-red-50",
    border: "border-red-500",
    text: "text-red-600",
  };

  const style = colorClasses;

  const handleCardClick = () => {
    onSeleccionar(visita);
    if (!visita.leida) {
      onMarcarComoLeida(visita.id_visita);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`p-4 flex items-start gap-4 rounded-lg border-l-4 cursor-pointer transition-colors ${style.border} ${
        visita.leida ? "bg-white" : `${style.bg} hover:bg-opacity-80`
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}
      >
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800">Nueva visita: {visita.nombre_visitante}</h3>
        <p className="text-sm text-slate-600 mt-1">{visita.motivo || "Motivo no especificado"}</p>
        <p className="text-xs text-slate-400 mt-2">
          {formatTiempoRelativo(visita.createdAt)}
        </p>
      </div>
      {!visita.leida && (
        <div
          className="w-2.5 h-2.5 bg-teal-500 rounded-full self-center flex-shrink-0"
          title="No leída"
        ></div>
      )}
    </div>
  );
};

// --- Componente de Detalles de la Visita ---
const VisitaDetalles = ({ visita, onClose }: { visita: Visita; onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose} // Cierra el modal al hacer clic en el fondo
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Evita que el clic en la tarjeta cierre el modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Detalles de la Visita</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">Nombre:</span>
            <span className="text-slate-800 text-right">{visita.nombre_visitante}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-medium text-slate-600">Motivo:</span>
            <span className="text-slate-800 text-right w-1/2 break-words">
              {visita.motivo || "No especificado"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">Fecha de la Visita:</span>
            <span className="text-slate-800 text-right">{new Date(visita.fecha_visita).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">Correo:</span>
            <span className="text-slate-800 text-right break-all">{visita.correo}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">Teléfono:</span>
            <span className="text-slate-800 text-right">{visita.telefono}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">Ciudad:</span>
            <span className="text-slate-800 text-right">{visita.ciudad}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">Identificación:</span>
            <span className="text-slate-800 text-right">{visita.identificacion}</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2 mt-4 text-sm text-slate-500">
            <span className="font-medium">Fecha de Creación:</span>
            <span className="text-slate-600">{new Date(visita.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<Visita | null>(null);

  const fetchNotificaciones = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/visita");
      if (!res.ok) {
        throw new Error("No se pudo cargar las notificaciones desde la API.");
      }
      const data: Visita[] = await res.json();
      const formattedData = data
        .sort((a: Visita, b: Visita) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      fetchNotificaciones();
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
      fetchNotificaciones();
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
              {notificaciones.map((visita) => (
                <NotificacionCard
                  key={visita.id_visita}
                  visita={visita}
                  onMarcarComoLeida={marcarComoLeida}
                  onSeleccionar={setVisitaSeleccionada}
                  estaSeleccionada={visitaSeleccionada?.id_visita === visita.id_visita}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">No hay notificaciones</p>
          )}
        </div>
      </div>

      {visitaSeleccionada && (
        <VisitaDetalles
          visita={visitaSeleccionada}
          onClose={() => setVisitaSeleccionada(null)}
        />
      )}
    </main>
  );
}