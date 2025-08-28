"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import api from '../../../../../../services/api';
import { Plus, Edit2, Play, StopCircle, X } from "lucide-react";

interface ProgramacionRiego {
  id_pg_riego: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  descripcion: string;
  tipo_riego: string;
  id_zona: number;
  estado?: boolean;
}

export default function ProgramacionRiego() {
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

  const obtenerProgramaciones = async () => {
    try {
      const response = await api.get('/programacionRiego');
      const todas = response.data;
      if (!Array.isArray(todas)) return;

      const ahora = new Date();
      const filtradas = todas.filter((p: ProgramacionRiego) => {
        const fechaFinal = new Date(p.fecha_finalizacion);
        return p.id_zona === zonaId && fechaFinal > ahora;
      });
      setProgramaciones(filtradas);

      const nuevosEstados: { [key: number]: boolean } = {};
      filtradas.forEach(p => {
        nuevosEstados[p.id_pg_riego] = p.estado === false;
      });
      setEstadosDetenidos(nuevosEstados);
    } catch (error) {
      console.error('Error al obtener programaciones de riego:', error);
    }
  };

  useEffect(() => {
    if (zonaId) obtenerProgramaciones();
  }, [zonaId]);

  const convertirFechaParaInput = (fechaString: string) => {
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return "";
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
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
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (editandoId === null) return;

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
    } catch (error) {
      console.error("Error al actualizar la programación:", error);
      alert("Hubo un error al actualizar la programación.");
    }
  };

  const agregar = async () => {
    if (!form.fecha_inicio || !form.fecha_finalizacion || !form.descripcion || !form.tipo_riego) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const nueva = {
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_finalizacion: new Date(form.fecha_finalizacion).toISOString(),
        descripcion: form.descripcion,
        tipo_riego: form.tipo_riego.toLowerCase(),
        id_zona: zonaId,
      };
      await api.post('/programacionRiego', nueva);
      await obtenerProgramaciones();
      setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "", tipo_riego: "" });
      setModalOpen(false);
    } catch (error) {
      console.error("Error al agregar la programación:", error);
      alert("Hubo un error al crear la programación.");
    }
  };

  const detenerRiego = async (id: number) => {
    const nuevoEstado = !estadosDetenidos[id];
    try {
      await api.patch(`/programacionRiego/${id}/estado`, { activo: !nuevoEstado });
      setEstadosDetenidos(prev => ({ ...prev, [id]: nuevoEstado }));
      await obtenerProgramaciones();
    } catch (error) {
      console.error("Error al cambiar estado de programación:", error);
      alert("No se pudo cambiar el estado.");
    }
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      {/* Header y botón Crear */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Programación de Riego - Zona {zonaId}
        </h1>
        <button
          onClick={() => { setEditandoId(null); setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "", tipo_riego: "" }); setModalOpen(true); }}
          className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Programación
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programaciones.map(p => {
          const detenido = estadosDetenidos[p.id_pg_riego] ?? false;
          return (
            <div key={p.id_pg_riego} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="space-y-2">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Activación:</span>{" "}
                  <span className="text-slate-700">{convertirFechaParaInput(p.fecha_inicio)}</span>
                </p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Desactivación:</span>{" "}
                  <span className="text-slate-700">{convertirFechaParaInput(p.fecha_finalizacion)}</span>
                </p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Descripción:</span>{" "}
                  <span className="text-slate-700">{p.descripcion}</span>
                </p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Tipo:</span>{" "}
                  <span className="text-slate-700">{p.tipo_riego}</span>
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => detenerRiego(p.id_pg_riego)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-white transition-colors ${
                    detenido ? "bg-teal-600 hover:bg-teal-700" : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  {detenido ? <Play className="w-4 h-4" /> : <StopCircle className="w-4 h-4" />}
                  {detenido ? "Reanudar" : "Detener"}
                </button>
                <button
                  onClick={() => editar(p)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
              </div>
            </div>
          );
        })}
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
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fecha y hora de finalización
                </label>
                <input
                  type="datetime-local"
                  value={form.fecha_finalizacion}
                  onChange={(e) => setForm({ ...form, fecha_finalizacion: e.target.value })}
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

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tipo de riego
                </label>
                <select
                  value={form.tipo_riego}
                  onChange={(e) => setForm({ ...form, tipo_riego: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecciona el tipo de riego</option>
                  <option value="Goteo">Goteo</option>
                  <option value="Aspersión">Aspersión</option>
                  <option value="Manual">Manual</option>
                </select>
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
                  editandoId ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-700"
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
