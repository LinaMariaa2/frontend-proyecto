"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, AlertTriangle, XCircle } from "lucide-react";
import { io } from "socket.io-client";

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

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

// Tipo discriminado para la lista combinada
type CombinedNotification =
  | { id: number; tipo: "visita"; createdAt: string; data: Visita }
  | { id: number; tipo: "alerta"; createdAt: string; data: Notificacion };

// --- Helpers / Type guards ---
const isVisita = (obj: unknown): obj is Visita =>
  typeof obj === "object" && obj !== null && "id_visita" in obj;

const isNotificacion = (obj: unknown): obj is Notificacion =>
  typeof obj === "object" && obj !== null && "id" in obj && "titulo" in obj;

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

// --- Componente Card de visitas ---
const NotificacionCard = ({
  visita,
  onMarcarComoLeida,
  onSeleccionar,
  
}: {
  visita: Visita;
  onMarcarComoLeida: (id: number) => void;
  onSeleccionar: (visita: Visita) => void;
  estaSeleccionada: boolean;
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
        visita.leida ? "hidden" : `${style.bg} hover:bg-opacity-80`}
      `}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}
      >
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800">
          Nueva visita: {visita.nombre_visitante}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {visita.motivo || "Motivo no especificado"}
        </p>
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

// --- Componente Card de notificación de sensores ---
const AlertaCard = ({ notificacion }: { notificacion: Notificacion }) => {
  return (
    <div
      className={`p-4 flex items-start gap-4 rounded-lg border-l-4 cursor-pointer transition-colors border-red-500 ${
        notificacion.leida ? "hidden" : "bg-red-50 hover:bg-opacity-80"
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800">{notificacion.titulo}</h3>
        <p className="text-sm text-slate-600 mt-1">{notificacion.mensaje}</p>
        <p className="text-xs text-slate-400 mt-2">
          {formatTiempoRelativo(notificacion.createdAt)}
        </p>
      </div>
    </div>
  );
};

// --- Componente de Detalles de la Visita ---
const VisitaDetalles = ({
  visita,
  onClose,
}: {
  visita: Visita;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Detalles de la Visita
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">Nombre:</span>
            <span className="text-slate-800 text-right">
              {visita.nombre_visitante}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-medium text-slate-600">Motivo:</span>
            <span className="text-slate-800 text-right w-1/2 break-words">
              {visita.motivo || "No especificado"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">
              Fecha de la Visita:
            </span>
            <span className="text-slate-800 text-right">
              {new Date(visita.fecha_visita).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-600">Correo:</span>
            <span className="text-slate-800 text-right break-all">
              {visita.correo}
            </span>
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
            <span className="font-medium text-slate-600">
              Identificación:
            </span>
            <span className="text-slate-800 text-right">
              {visita.identificacion}
            </span>
          </div>
          <div className="flex justify-between items-center border-t pt-2 mt-4 text-sm text-slate-500">
            <span className="font-medium">Fecha de Creación:</span>
            <span className="text-slate-600">
              {new Date(visita.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Visita[]>([]);
  const [alertas, setAlertas] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<Visita | null>(
    null
  );

  const fetchNotificaciones = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/visita");
      if (!res.ok)
        throw new Error("No se pudo cargar las notificaciones desde la API.");
      const data = (await res.json()) as Visita[];
      const formattedData = data.sort(
        (a: Visita, b: Visita) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotificaciones(formattedData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertas = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/notificaciones");
      if (!res.ok)
        throw new Error("No se pudo cargar las alertas desde la API.");
      const data = (await res.json()) as Notificacion[];
      const formatted = data.sort(
        (a: Notificacion, b: Notificacion) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAlertas(formatted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    fetchAlertas();

    // --- Socket.io para notificaciones en tiempo real ---
    const socket = io("http://localhost:4000");

    socket.on("nuevaNotificacion", (payload: unknown) => {
      if (isVisita(payload)) {
        setNotificaciones((prev) => {
          const next = [payload, ...prev];
          next.sort(
            (a: Visita, b: Visita) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );
          return next;
        });
      } else if (isNotificacion(payload)) {
        setAlertas((prev) => {
          const next = [payload, ...prev];
          next.sort(
            (a: Notificacion, b: Notificacion) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );
          return next;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const marcarComoLeida = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/visita/marcar-leida/${id}`,
        {
          method: "PUT",
        }
      );
      if (!res.ok)
        throw new Error("No se pudo marcar la notificación como leída.");
      await fetchNotificaciones();
      if (visitaSeleccionada?.id_visita === id) {
        setVisitaSeleccionada(null);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/visita/marcar-todas-leidas`,
        {
          method: "PUT",
        }
      );
      if (!res.ok)
        throw new Error("No se pudo marcar todas las notificaciones como leídas.");
      await fetchNotificaciones();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const marcarAlertasComoLeidas = () => {
    setAlertas([]);
  };

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  const visitasNoLeidas = notificaciones.filter((v) => !v.leida);

  const todasNotificaciones: CombinedNotification[] = [
    ...visitasNoLeidas.map((v) => ({
      id: v.id_visita,
      tipo: "visita" as const,
      createdAt: v.createdAt,
      data: v,
    })),
    ...alertas.map((a) => ({
      id: a.id,
      tipo: "alerta" as const,
      createdAt: a.createdAt,
      data: a,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
        <div className="flex flex-wrap gap-3">
          {noLeidasCount > 0 && (
            <button
              onClick={marcarTodasComoLeidas}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Marcar visitas como leídas ({noLeidasCount})</span>
            </button>
          )}
          {alertas.length > 0 && (
            <button
              onClick={marcarAlertasComoLeidas}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Marcar alertas como leídas ({alertas.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          {loading ? (
            <p className="text-center text-slate-500">
              Cargando notificaciones...
            </p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <div className="space-y-4">
              {todasNotificaciones.map((n) =>
                n.tipo === "visita" ? (
                  <NotificacionCard
                    key={`visita-${n.id}`}
                    visita={n.data}
                    onMarcarComoLeida={marcarComoLeida}
                    onSeleccionar={setVisitaSeleccionada}
                    estaSeleccionada={
                      visitaSeleccionada?.id_visita === n.data.id_visita
                    }
                  />
                ) : (
                  <AlertaCard key={`alerta-${n.id}`} notificacion={n.data} />
                )
              )}
            </div>
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
