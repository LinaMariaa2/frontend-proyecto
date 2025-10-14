"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "../../../../../../services/api";
import { Plus, Edit2, Play, StopCircle, Trash, X } from "lucide-react";
import Toast from "@/app/(private)/home/admin/components/Toast";
import { AxiosError } from "axios";

interface ProgramacionRiego {
  id_pg_riego: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  descripcion: string;
  tipo_riego: string;
  id_zona: number;
  estado?: boolean;
}

// 🔹 Componente envuelto en Suspense (para solucionar el error del build)
export default function ProgramacionRiegoPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando...</div>}>
      <ProgramacionRiegoContent />
    </Suspense>
  );
}

// 🔹 Componente principal
function ProgramacionRiegoContent() {
  const searchParams = useSearchParams();
  const zonaId = parseInt(searchParams.get("id") || "0");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [programaciones, setProgramaciones] = useState<ProgramacionRiego[]>([]);
  const [estadosDetenidos, setEstadosDetenidos] = useState<{ [key: number]: boolean }>({});
  const [form, setForm] = useState({
    fecha_inicio: "",
    fecha_finalizacion: "",
    descripcion: "",
    tipo_riego: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => setToastMessage(msg);

  const obtenerProgramaciones = useCallback(async () => {
    try {
      const response = await api.get("/programacionRiego");
      const todas = response.data;
      if (!Array.isArray(todas)) return;

      const ahora = new Date();
      const filtradas = todas.filter((p: ProgramacionRiego) => {
        const fechaFinal = new Date(p.fecha_finalizacion);
        return p.id_zona === zonaId && fechaFinal > ahora;
      });

      setProgramaciones(filtradas);
      const nuevosEstados: { [key: number]: boolean } = {};
      filtradas.forEach((p) => {
        nuevosEstados[p.id_pg_riego] = p.estado === false;
      });
      setEstadosDetenidos(nuevosEstados);
    } catch (error) {
      console.error("Error al obtener programaciones:", error);
      showToast("❌ Error al cargar programaciones de riego");
    }
  }, [zonaId]);

  useEffect(() => {
    if (zonaId) obtenerProgramaciones();
  }, [zonaId, obtenerProgramaciones]);

  const convertirFechaParaInput = (fechaString: string) => {
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return "";
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    const hours = String(fecha.getHours()).padStart(2, "0");
    const minutes = String(fecha.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const editar = (p: ProgramacionRiego) => {
    setForm({
      fecha_inicio: convertirFechaParaInput(p.fecha_inicio),
      fecha_finalizacion: convertirFechaParaInput(p.fecha_finalizacion),
      descripcion: p.descripcion,
      tipo_riego: p.tipo_riego,
    });
    setEditandoId(p.id_pg_riego);
    setModalOpen(true);
  };

  const actualizarProgramacion = async () => {
    if (!form.fecha_inicio || !form.fecha_finalizacion || !form.descripcion || !form.tipo_riego) {
      showToast("⚠️ Por favor, completa todos los campos.");
      return;
    }
    if (editandoId === null) return;
    setLoading(true);
    try {
      const actualizada = {
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_finalizacion: new Date(form.fecha_finalizacion).toISOString(),
        descripcion: form.descripcion,
        tipo_riego: form.tipo_riego.toLowerCase(),
        id_zona: zonaId,
      };
      await api.put(`/programacionRiego/${editandoId}`, actualizada);
      await obtenerProgramaciones();
      setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "", tipo_riego: "" });
      setEditandoId(null);
      setModalOpen(false);
      showToast("✅ Programación actualizada correctamente");
    } catch (error) {
      console.error("Error al actualizar:", error);
      const axiosError = error as AxiosError<{ mensaje?: string }>;
      const backendMsg = axiosError.response?.data?.mensaje || "❌ Hubo un error al actualizar.";
      showToast(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  const agregar = async () => {
    if (!form.fecha_inicio || !form.fecha_finalizacion || !form.descripcion || !form.tipo_riego) {
      showToast("⚠️ Por favor, completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const nueva = {
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_finalizacion: new Date(form.fecha_finalizacion).toISOString(),
        descripcion: form.descripcion,
        tipo_riego: form.tipo_riego.toLowerCase(),
        id_zona: zonaId,
      };
      await api.post("/programacionRiego", nueva);
      await obtenerProgramaciones();
      setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "", tipo_riego: "" });
      setModalOpen(false);
      showToast("✅ Programación creada correctamente");
    } catch (error) {
      console.error("Error al agregar:", error);
      const axiosError = error as AxiosError<{ mensaje?: string }>;
      const backendMsg = axiosError.response?.data?.mensaje || "❌ Error al crear la programación.";
      showToast(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  const detenerRiego = async (id: number) => {
    const nuevoEstado = !estadosDetenidos[id];
    try {
      await api.patch(`/programacionRiego/${id}/estado`, { activo: !nuevoEstado });
      setEstadosDetenidos((prev) => ({ ...prev, [id]: nuevoEstado }));
      await obtenerProgramaciones();
      showToast(nuevoEstado ? "✅ Riego detenido" : "✅ Riego reanudado");
    } catch {
      showToast("❌ No se pudo cambiar el estado.");
    }
  };

  const eliminarProgramacion = async (id: number) => {
    try {
      const res = await api.delete(`/programacionRiego/${id}`);
      if (res.data.ok) {
        setProgramaciones((prev) => prev.filter((p) => p.id_pg_riego !== id));
        showToast(res.data.mensaje || "🗑️ Programación eliminada correctamente");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ mensaje?: string }>;
      const mensaje = axiosError.response?.data?.mensaje || "❌ No se pudo eliminar.";
      showToast(mensaje);
    }
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800">
          Programación de Riego - Zona {zonaId}
        </h1>
        <button
          onClick={() => {
            setEditandoId(null);
            setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "", tipo_riego: "" });
            setModalOpen(true);
          }}
          className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Crear Programación
        </button>
      </div>

      {/* Lista de programaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programaciones.map((p) => {
          const detenido = estadosDetenidos[p.id_pg_riego] ?? false;
          const ahora = new Date();
          const inicio = new Date(p.fecha_inicio);
          const haIniciado = inicio <= ahora;
          const puedeEditarEliminar = !haIniciado || detenido;

          return (
            <div key={p.id_pg_riego} className="bg-white rounded-2xl shadow p-6">
              <p><strong>Inicio:</strong> {new Date(p.fecha_inicio).toLocaleString("es-CO")}</p>
              <p><strong>Fin:</strong> {new Date(p.fecha_finalizacion).toLocaleString("es-CO")}</p>
              <p><strong>Descripción:</strong> {p.descripcion}</p>
              <p><strong>Tipo:</strong> {p.tipo_riego}</p>

              <div className="mt-4 flex gap-2 flex-wrap">
                {haIniciado && (
                  <button
                    onClick={() => detenerRiego(p.id_pg_riego)}
                    className={`px-3 py-2 rounded-lg font-semibold text-white ${
                      detenido ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    {detenido ? "Reanudar" : "Detener"}
                  </button>
                )}
                <button
                  onClick={() => editar(p)}
                  disabled={!puedeEditarEliminar}
                  className={`px-3 py-2 rounded-lg font-semibold ${
                    puedeEditarEliminar ? "bg-teal-600 text-white" : "bg-gray-300 text-gray-500"
                  }`}
                >
                  <Edit2 className="w-4 h-4 inline-block mr-1" /> Editar
                </button>
                <button
                  onClick={() => eliminarProgramacion(p.id_pg_riego)}
                  disabled={!puedeEditarEliminar}
                  className={`px-3 py-2 rounded-lg font-semibold ${
                    puedeEditarEliminar ? "bg-red-600 text-white" : "bg-gray-300 text-gray-500"
                  }`}
                >
                  <Trash className="w-4 h-4 inline-block mr-1" /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editandoId ? "Editar Programación" : "Nueva Programación"}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <label className="block text-sm font-semibold">Fecha de inicio</label>
              <input
                type="datetime-local"
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3"
              />
              <label className="block text-sm font-semibold">Fecha de fin</label>
              <input
                type="datetime-local"
                value={form.fecha_finalizacion}
                onChange={(e) => setForm({ ...form, fecha_finalizacion: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3"
              />
              <label className="block text-sm font-semibold">Descripción</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3"
              />
              <label className="block text-sm font-semibold">Tipo de riego</label>
              <select
                value={form.tipo_riego}
                onChange={(e) => setForm({ ...form, tipo_riego: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3"
              >
                <option value="">Selecciona un tipo</option>
                <option value="Goteo">Goteo</option>
                <option value="Aspersión">Aspersión</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="p-6 border-t flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setModalOpen(false)}
                className="border border-slate-300 rounded-lg px-5 py-2 font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={editandoId ? actualizarProgramacion : agregar}
                disabled={loading}
                className={`rounded-lg px-5 py-2 font-semibold text-white ${
                  editandoId ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Procesando..." : editandoId ? "Guardar Cambios" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </main>
  );
}
