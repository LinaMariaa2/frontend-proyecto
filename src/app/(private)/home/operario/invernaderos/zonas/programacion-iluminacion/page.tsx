"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import api from "@/app/services/api";
import { Plus, Pencil, PauseCircle, PlayCircle, X } from "lucide-react";

interface ProgramacionIluminacion {
  id_iluminacion: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  descripcion: string;
  estado: boolean;
}

export default function ProgramacionIluminacion() {
  const searchParams = useSearchParams();
  const zonaId = searchParams.get("id");

  const [estadosDetenidos, setEstadosDetenidos] = useState<{ [id: number]: boolean }>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [programaciones, setProgramaciones] = useState<ProgramacionIluminacion[]>([]);
  const [form, setForm] = useState({ activacion: "", desactivacion: "", descripcion: "" });
  const [modalOpen, setModalOpen] = useState(false);

  const convertirFechaParaInput = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    const tzOffset = fecha.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(fecha.getTime() - tzOffset);
    return fechaLocal.toISOString().slice(0, 16);
  };

  // Obtener programaciones al cargar
  useEffect(() => {
    if (!zonaId) return;
    api
      .get(`/programacionIluminacion/zona/${zonaId}/futuras`)
      .then((res) => {
        setProgramaciones(res.data);
        const nuevosEstados: Record<number, boolean> = {};
        (res.data as ProgramacionIluminacion[]).forEach((p) => {
          nuevosEstados[p.id_iluminacion] = !p.estado;
        });
        setEstadosDetenidos(nuevosEstados);
      })
      .catch((err) => {
        console.error("Error al cargar programaciones:", err);
      });
  }, [zonaId]);

  // Crear nueva programación
  const agregar = () => {
    if (!form.activacion || !form.desactivacion || !form.descripcion) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    api
      .post("/programacionIluminacion", {
        fecha_inicio: form.activacion,
        fecha_finalizacion: form.desactivacion,
        descripcion: form.descripcion,
        id_zona: parseInt(zonaId as string),
      })
      .then((res) => {
        setProgramaciones((prev) => [...prev, res.data]);
        setForm({ activacion: "", desactivacion: "", descripcion: "" });
        setModalOpen(false);
      })
      .catch((err) => {
        console.error("Error al crear programación:", err);
        alert("Hubo un error al crear la programación.");
      });
  };

  // Detener/Reanudar programación
 const detener = async (id: number) => {
  const nuevoEstado = !estadosDetenidos[id];
  try {
    await api.patch(`/programacionIluminacion/${id}/estado`, { activo: nuevoEstado });
    setEstadosDetenidos((prev) => ({ ...prev, [id]: nuevoEstado }));
    console.log(`Programación #${id} actualizada a ${!nuevoEstado ? "activa" : "detenida"}`);
  } catch (error) {
    console.error("Error al cambiar estado de programación:", error);
    alert("No se pudo actualizar el estado en el servidor");
  }
};


  // Actualizar programación
  const actualizarProgramacion = () => {
    if (!form.activacion || !form.desactivacion || !form.descripcion) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (editandoId === null) return;

    api
      .put(`/programacionIluminacion/${editandoId}`, {
        fecha_inicio: form.activacion,
        fecha_finalizacion: form.desactivacion,
        descripcion: form.descripcion,
      })
      .then((res) => {
        setProgramaciones((prev) => prev.map((p) => (p.id_iluminacion === editandoId ? res.data : p)));
        setForm({ activacion: "", desactivacion: "", descripcion: "" });
        setEditandoId(null);
        setModalOpen(false);
      })
      .catch((err) => {
        console.error("Error al actualizar programacion", err);
        alert("Hubo un error al actualizar la programación.");
      });
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Programación de Iluminación - Zona {zonaId}
          </h1>
        </div>
        <button
          onClick={() => {
            setEditandoId(null);
            setForm({ activacion: "", desactivacion: "", descripcion: "" });
            setModalOpen(true);
          }}
          className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Crear Programación</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programaciones.map((p) => (
          <div
            key={p.id_iluminacion}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
          >
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Activación:</span>{" "}
                <span className="text-slate-700">
                  {p.fecha_inicio
                    ? new Date(p.fecha_inicio).toLocaleString("es-CO", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : ""}
                </span>
              </p>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Desactivación:</span>{" "}
                <span className="text-slate-700">
                  {p.fecha_finalizacion
                    ? new Date(p.fecha_finalizacion).toLocaleString("es-CO", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : ""}
                </span>
              </p>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Descripción:</span>{" "}
                <span className="text-slate-700">{p.descripcion}</span>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => detener(p.id_iluminacion)}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-white transition-colors ${
                  estadosDetenidos[p.id_iluminacion]
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {estadosDetenidos[p.id_iluminacion] ? (
                  <>
                    <PlayCircle className="w-4 h-4" /> Reanudar
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-4 h-4" /> Detener
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setEditandoId(p.id_iluminacion);
                  setForm({
                    activacion: p.fecha_inicio ? convertirFechaParaInput(p.fecha_inicio) : "",
                    desactivacion: p.fecha_finalizacion ? convertirFechaParaInput(p.fecha_finalizacion) : "",
                    descripcion: p.descripcion,
                  });
                  setModalOpen(true);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
              >
                <Pencil className="w-4 h-4" /> Actualizar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {editandoId ? "Editar Programación" : "Agregar Programación"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-full"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fecha y hora de activación
                </label>
                <input
                  type="datetime-local"
                  value={form.activacion}
                  onChange={(e) => setForm({ ...form, activacion: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fecha y hora de finalización
                </label>
                <input
                  type="datetime-local"
                  value={form.desactivacion}
                  onChange={(e) => setForm({ ...form, desactivacion: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  placeholder="Descripción"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editandoId ? actualizarProgramacion : agregar}
                className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
                  editandoId ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-darkGreen-700"
                }`}
              >
                {editandoId ? "Guardar Cambios" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
