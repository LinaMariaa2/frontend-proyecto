"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/app/services/api";
import { Plus, Pencil, PauseCircle, PlayCircle, Trash, X } from "lucide-react";
import Toast from "@/app/(private)/home/admin/components/Toast";
import { AxiosError } from "axios";

interface ProgramacionIluminacion {
  id_iluminacion: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  descripcion: string;
  estado: boolean;
}

function ProgramacionIluminacionContent() {
  const searchParams = useSearchParams();
  const zonaId = searchParams.get("id");

  const [estadosDetenidos, setEstadosDetenidos] = useState<{ [id: number]: boolean }>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [programaciones, setProgramaciones] = useState<ProgramacionIluminacion[]>([]);
  const [form, setForm] = useState({ activacion: "", desactivacion: "", descripcion: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const convertirFechaParaInput = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    const tzOffset = fecha.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(fecha.getTime() - tzOffset);
    return fechaLocal.toISOString().slice(0, 16);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

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
        showToast("❌ Error al cargar programaciones");
      });
  }, [zonaId]);

  const validarProgramacion = (): boolean => {
    const inicio = new Date(form.activacion);
    const fin = new Date(form.desactivacion);
    const ahora = new Date();

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      showToast("⚠️ Debes ingresar fechas válidas.");
      return false;
    }

    if (inicio < ahora) {
      showToast("⚠️ La fecha de inicio no puede estar en el pasado.");
      return false;
    }

    if (fin <= inicio) {
      showToast("⚠️ La fecha de finalización debe ser mayor a la de inicio.");
      return false;
    }

    const solapa = programaciones.some((p) => {
      if (editandoId && p.id_iluminacion === editandoId) return false;
      const pInicio = new Date(p.fecha_inicio);
      const pFin = new Date(p.fecha_finalizacion);
      return inicio < pFin && fin > pInicio;
    });

    if (solapa) {
      showToast("⚠️ La programación se solapa con otra existente.");
      return false;
    }

    return true;
  };

  const agregar = async () => {
    if (!form.activacion || !form.desactivacion || !form.descripcion) {
      showToast("⚠️ Por favor, completa todos los campos.");
      return;
    }

    if (!validarProgramacion()) return;

    setLoading(true);
    try {
      const res = await api.post("/programacionIluminacion", {
        fecha_inicio: form.activacion,
        fecha_finalizacion: form.desactivacion,
        descripcion: form.descripcion,
        id_zona: parseInt(zonaId as string),
      });
      setProgramaciones((prev) => [...prev, res.data]);
      setForm({ activacion: "", desactivacion: "", descripcion: "" });
      setModalOpen(false);
      showToast("✅ Programación creada con éxito");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ mensaje?: string }>;
      console.error("Error al crear programación:", axiosErr);
      showToast(axiosErr.response?.data?.mensaje || "❌ Hubo un error al crear la programación.");
    } finally {
      setLoading(false);
    }
  };

  const detener = async (id: number) => {
    const nuevoEstado = !estadosDetenidos[id];
    try {
      await api.patch(`/programacionIluminacion/${id}/estado`, { activo: nuevoEstado });
      setEstadosDetenidos((prev) => ({ ...prev, [id]: nuevoEstado }));
      showToast(nuevoEstado ? "✅ Iluminación detenida" : "✅ Iluminación reanudada");
    } catch (err: unknown) {
      console.error("Error al cambiar estado de programación:", err);
      showToast("❌ No se pudo actualizar el estado en el servidor");
    }
  };

  const actualizarProgramacion = async () => {
    if (!form.activacion || !form.desactivacion || !form.descripcion) {
      showToast("⚠️ Por favor, completa todos los campos.");
      return;
    }

    if (!validarProgramacion()) return;
    if (editandoId === null) return;

    setLoading(true);
    try {
      const res = await api.put(`/programacionIluminacion/${editandoId}`, {
        fecha_inicio: form.activacion,
        fecha_finalizacion: form.desactivacion,
        descripcion: form.descripcion,
      });
      setProgramaciones((prev) =>
        prev.map((p) =>
          p.id_iluminacion === editandoId ? res.data.programacion : p
        )
      );
      setForm({ activacion: "", desactivacion: "", descripcion: "" });
      setEditandoId(null);
      setModalOpen(false);
      showToast(res.data.mensaje || "✅ Programación actualizada");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ mensaje?: string }>;
      const backendMsg = axiosErr.response?.data?.mensaje || "Hubo un error al actualizar la programación.";
      showToast(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  const eliminarProgramacion = async (programacion: ProgramacionIluminacion) => {
    try {
      await api.delete(`/programacionIluminacion/${programacion.id_iluminacion}`);
      setProgramaciones((prev) =>
        prev.filter((p) => p.id_iluminacion !== programacion.id_iluminacion)
      );
      showToast("🗑️ Programación eliminada correctamente");
    } catch (err: unknown) {
      console.error("Error al eliminar programación:", err);
      showToast("❌ No se pudo eliminar la programación");
    }
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Programación de Iluminación - Zona {zonaId}
        </h1>

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

      {/* LISTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programaciones.map((p) => {
          const ahora = new Date();
          const inicio = new Date(p.fecha_inicio);
          const haIniciado = inicio <= ahora;
          const estaDetenida = estadosDetenidos[p.id_iluminacion];
          const puedeEditarEliminar = !haIniciado || estaDetenida;

          return (
            <div
              key={p.id_iluminacion}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
            >
              <div className="space-y-2">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Activación:</span>{" "}
                  {new Date(p.fecha_inicio).toLocaleString("es-CO")}
                </p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Desactivación:</span>{" "}
                  {new Date(p.fecha_finalizacion).toLocaleString("es-CO")}
                </p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Descripción:</span>{" "}
                  {p.descripcion}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2 flex-wrap">
                {haIniciado && (
                  <button
                    onClick={() => detener(p.id_iluminacion)}
                    className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-white transition-colors ${
                      estaDetenida
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    {estaDetenida ? (
                      <>
                        <PlayCircle className="w-4 h-4" /> Reanudar
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-4 h-4" /> Detener
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditandoId(p.id_iluminacion);
                    setForm({
                      activacion: convertirFechaParaInput(p.fecha_inicio),
                      desactivacion: convertirFechaParaInput(p.fecha_finalizacion),
                      descripcion: p.descripcion,
                    });
                    setModalOpen(true);
                  }}
                  disabled={!puedeEditarEliminar}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition-colors ${
                    puedeEditarEliminar
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>

                <button
                  onClick={() => eliminarProgramacion(p)}
                  disabled={!puedeEditarEliminar}
                  className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                    puedeEditarEliminar
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  title="Eliminar"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Fecha y hora de activación
              </label>
              <input
                type="datetime-local"
                value={form.activacion}
                onChange={(e) => setForm({ ...form, activacion: e.target.value })}
                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500"
              />

              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Fecha y hora de finalización
              </label>
              <input
                type="datetime-local"
                value={form.desactivacion}
                onChange={(e) => setForm({ ...form, desactivacion: e.target.value })}
                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500"
              />

              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={editandoId ? actualizarProgramacion : agregar}
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white font-semibold ${
                  editandoId
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-500 hover:bg-green-700"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Procesando..." : editandoId ? "Guardar Cambios" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </main>
  );
}

export default function ProgramacionIluminacionPage() {
  // 🔹 Suspense corrige el error de Next.js con useSearchParams
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      <ProgramacionIluminacionContent />
    </Suspense>
  );
}
