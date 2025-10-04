"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, AlertTriangle, XCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

// --- Interfaces ---
interface NotificacionBase {
  id: number | string;
  tipo: "visita" | "alerta_hardware";
  titulo?: string;
  mensaje?: string;
  leida: boolean;
  createdAt: string;
  // Campos adicionales para visitas
  nombre_visitante?: string;
  motivo?: string;
  ciudad?: string;
  fecha_visita?: string;
  correo?: string;
  identificacion?: string;
  telefono?: string;
}

interface NotificacionSocket {
  id?: number | string;
  id_visita?: number | string;
  tipo: "visita" | "alerta_hardware";
  leida?: boolean;
  createdAt?: string;
  titulo?: string;
  mensaje?: string;
  nombre_visitante?: string;
  motivo?: string;
  ciudad?: string;
  fecha_visita?: string;
  correo?: string;
  identificacion?: string;
  telefono?: string;
}

// --- Helpers ---
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

const ordenarNotificaciones = (arr: NotificacionBase[]) =>
  [...arr].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

// --- Card para visitas ---
const NotificacionCard: React.FC<{
  visita: NotificacionBase;
  onMarcarComoLeida: (id: number | string) => void;
  onSeleccionar: (visita: NotificacionBase) => void;
}> = ({ visita, onMarcarComoLeida, onSeleccionar }) => {
  const style = {
    bg: "bg-red-50",
    border: "border-red-500",
    text: "text-red-600",
  };

  const handleClick = () => {
    onSeleccionar(visita);
    if (!visita.leida) onMarcarComoLeida(visita.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 flex items-start gap-4 rounded-lg border-l-4 cursor-pointer transition-colors ${style.border} ${
        visita.leida ? "opacity-50" : `${style.bg} hover:bg-opacity-80`
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}
      >
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800">
          Nueva visita: {visita.nombre_visitante || "Sin nombre"}
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
        />
      )}
    </div>
  );
};

// --- Card para alertas ---
const AlertaCard: React.FC<{ notificacion: NotificacionBase }> = ({ notificacion }) => {
  return (
    <div
      className={`p-4 flex items-start gap-4 rounded-lg border-l-4 cursor-pointer transition-colors border-red-500 ${
        notificacion.leida ? "opacity-50" : "bg-red-50 hover:bg-opacity-80"
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

// --- Detalle de visita ---
const VisitaDetalles: React.FC<{ visita: NotificacionBase; onClose: () => void }> = ({
  visita,
  onClose,
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
          <p>
            <span className="font-medium text-slate-600">Nombre:</span>{" "}
            {visita.nombre_visitante || "-"}
          </p>
          <p>
            <span className="font-medium text-slate-600">Motivo:</span>{" "}
            {visita.motivo || "-"}
          </p>
          <p>
            <span className="font-medium text-slate-600">Fecha de la Visita:</span>{" "}
            {visita.fecha_visita
              ? new Date(visita.fecha_visita).toLocaleDateString()
              : "-"}
          </p>
          <p>
            <span className="font-medium text-slate-600">Correo:</span>{" "}
            {visita.correo || "-"}
          </p>
          <p>
            <span className="font-medium text-slate-600">Teléfono:</span>{" "}
            {visita.telefono || "-"}
          </p>
          <p>
            <span className="font-medium text-slate-600">Ciudad:</span>{" "}
            {visita.ciudad || "-"}
          </p>
          <p>
            <span className="font-medium text-slate-600">Identificación:</span>{" "}
            {visita.identificacion || "-"}
          </p>
          <p className="text-sm text-slate-500 border-t pt-2">
            <span className="font-medium">Creada:</span>{" "}
            {new Date(visita.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Página Principal ---
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<NotificacionBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<NotificacionBase | null>(null);

  // --- Fetch inicial ---
  const fetchNotificaciones = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/notificaciones/admin");
      if (!res.ok) throw new Error("Error cargando notificaciones");
      const data: NotificacionBase[] = await res.json();
      setNotificaciones(ordenarNotificaciones(data));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();

    const socket: Socket = io("http://localhost:4000");

    socket.on("nuevaNotificacion", (payload: NotificacionSocket) => {
      if (payload.tipo !== "visita" && payload.tipo !== "alerta_hardware") return;

      // Generar ID correcto: visitas usan id_visita, hardware siempre id del backend
      const id =
        payload.tipo === "visita"
          ? payload.id_visita!
          : payload.id ?? "sin-id"; // alerta_hardware debe tener id único desde backend

      if (!id) return;

      const notificacion: NotificacionBase = {
        id,
        tipo: payload.tipo,
        leida: payload.leida ?? false,
        createdAt: payload.createdAt ?? new Date().toISOString(),
        titulo: payload.titulo ?? "",
        mensaje: payload.mensaje ?? "",
        nombre_visitante: payload.nombre_visitante ?? "",
        motivo: payload.motivo ?? "",
        ciudad: payload.ciudad ?? "",
        fecha_visita: payload.fecha_visita ?? "",
        correo: payload.correo ?? "",
        identificacion: payload.identificacion ?? "",
        telefono: payload.telefono ?? "",
      };

      setNotificaciones((prev) => {
        const existe = prev.some((n) => n.id === notificacion.id);
        if (existe) return prev;
        return ordenarNotificaciones([notificacion, ...prev]);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const marcarComoLeida = async (id: number | string) => {
    try {
      await fetch(`http://localhost:4000/api/notificaciones/${id}/leida`, { method: "PATCH" });
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await fetch("http://localhost:4000/api/notificaciones/marcar-todas-leidas", {
        method: "PUT",
      });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const noLeidas = notificaciones.filter((n) => !n.leida);

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Bell className="w-10 h-10 text-slate-500" />
            <span>Notificaciones</span>
            {noLeidas.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center">
                {noLeidas.length}
              </span>
            )}
          </h1>
          <p className="text-lg text-slate-500 mt-1">
            Aquí encontrarás las alertas y actualizaciones del sistema.
          </p>
        </div>

        {noLeidas.length > 0 && (
          <button
            onClick={marcarTodasComoLeidas}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Marcar todas como leídas ({noLeidas.length})</span>
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          {loading ? (
            <p className="text-center text-slate-500">Cargando notificaciones...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <div className="space-y-4">
              {notificaciones.map((n) =>
                n.tipo === "visita" ? (
                  <NotificacionCard
                    key={`visita-${n.id}`}
                    visita={n}
                    onMarcarComoLeida={marcarComoLeida}
                    onSeleccionar={setVisitaSeleccionada}
                  />
                ) : (
                  <AlertaCard key={`alerta-${n.id}`} notificacion={n} />
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
