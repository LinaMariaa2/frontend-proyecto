"use client";

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import api from '../../../../../../services/api';

interface ProgramacionIluminacion {
  id_iluminacion: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  descripcion: string;
  estado: boolean;
  id_zona: number;
}

export default function ProgramacionIluminacion() {
  const searchParams = useSearchParams();
  const zonaId = parseInt(searchParams.get("id") || "0");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [programaciones, setProgramaciones] = useState<ProgramacionIluminacion[]>([]);
  const [estadosDetenidos, setEstadosDetenidos] = useState<{ [key: number]: boolean }>({});

  const [form, setForm] = useState({
    fecha_inicio: "",
    fecha_finalizacion: "",
    descripcion: "",
  });

  const [modalOpen, setModalOpen] = useState(false);

  // Function to convert ISO date string to datetime-local format for input
  const convertirFechaParaInput = (fechaString: string) => {
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) {
      console.error("Fecha inválida:", fechaString);
      return "";
    }
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Function to convert datetime-local input string to ISO string for the API
  const crearFechaISO = (datetimeLocal: string): string => {
    return new Date(datetimeLocal).toISOString();
  }

  // Fetch lighting schedules from the API
  const obtenerProgramaciones = async () => {
    try {
      // Updated API call to match backend router changes
      const response = await api.get(`/api/programacionIluminacion/zona/${zonaId}/futuras`);
      const futuras = response.data;

      if (!Array.isArray(futuras)) {
        console.error("La respuesta del backend no es un array:", futuras);
        setProgramaciones([]);
        return;
      }

      setProgramaciones(futuras);

      const nuevosEstados: { [key: number]: boolean } = {};
      futuras.forEach((p: ProgramacionIluminacion) => {
        nuevosEstados[p.id_iluminacion] = !p.estado;
      });
      setEstadosDetenidos(nuevosEstados);
    } catch (error) {
      console.error('Error al obtener programaciones de iluminación:', error);
      setProgramaciones([]);
    }
  };

  useEffect(() => {
    if (zonaId) {
      obtenerProgramaciones();
    }
  }, [zonaId]);

  const editar = (p: ProgramacionIluminacion) => {
    setForm({
      fecha_inicio: convertirFechaParaInput(p.fecha_inicio),
      fecha_finalizacion: convertirFechaParaInput(p.fecha_finalizacion),
      descripcion: p.descripcion,
    });
    setEditandoId(p.id_iluminacion);
    setModalOpen(true);
  };

  const actualizarProgramacion = async () => {
    if (!form.fecha_inicio || !form.fecha_finalizacion || !form.descripcion) {
      // Replaced alert with console log for a better user experience in the iframe environment
      console.error('Por favor, completa todos los campos.');
      return;
    }

    if (editandoId === null) return;

    try {
      const actualizada = {
        fecha_inicio: crearFechaISO(form.fecha_inicio),
        fecha_finalizacion: crearFechaISO(form.fecha_finalizacion),
        descripcion: form.descripcion,
        id_zona: zonaId,
      };

      await api.put(`/api/programacionIluminacion/${editandoId}`, actualizada);
      await obtenerProgramaciones();
      setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "" });
      setEditandoId(null);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar la programación:", error);
      console.error("Hubo un error al actualizar la programacion.");
    }
  };

  const agregar = async () => {
    if (!form.fecha_inicio || !form.fecha_finalizacion || !form.descripcion) {
      // Replaced alert with console log for a better user experience in the iframe environment
      console.error('Por favor, completa todos los campos.');
      return;
    }

    try {
      const nueva = {
        fecha_inicio: crearFechaISO(form.fecha_inicio),
        fecha_finalizacion: crearFechaISO(form.fecha_finalizacion),
        descripcion: form.descripcion,
        id_zona: zonaId,
      };

      await api.post('/api/programacionIluminacion', nueva);
      await obtenerProgramaciones();
      setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "" });
      setModalOpen(false);
    } catch (error) {
      console.error("Error al agregar la programación:", error);
      console.error("Hubo un error al agregar la programación.");
    }
  };

  const detenerIluminacion = async (id: number) => {
    const nuevoEstado = !estadosDetenidos[id];
    try {
      await api.patch(`/api/programacionIluminacion/${id}/estado`, {
        activo: !nuevoEstado,
      });

      setEstadosDetenidos(prev => ({
        ...prev,
        [id]: nuevoEstado,
      }));

      await obtenerProgramaciones();
    } catch (error) {
      console.error("Error al cambiar estado de programación:", error);
      console.error("No se pudo actualizar el estado en el servidor.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-6 md:mb-10 text-center drop-shadow-md">
          Programación de Iluminación - Zona {zonaId}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {programaciones.map((p) => {
            const detenido = estadosDetenidos[p.id_iluminacion] ?? false;

            return (
              <div key={p.id_iluminacion} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 flex flex-col gap-4 border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-700">
                  Activación: <span className="font-normal text-gray-700">{convertirFechaParaInput(p.fecha_inicio)}</span>
                </p>
                <p className="text-sm font-semibold text-indigo-700">
                  Desactivación: <span className="font-normal text-gray-700">{convertirFechaParaInput(p.fecha_finalizacion)}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Descripción: <span className="text-gray-800 font-medium">{p.descripcion}</span>
                </p>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => detenerIluminacion(p.id_iluminacion)}
                    className={`${detenido ? "bg-indigo-600 hover:bg-indigo-700" : "bg-yellow-500 hover:bg-yellow-600"} text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 transform hover:scale-105`}
                  >
                    {detenido ? "Reanudar" : "Detener"}
                  </button>
                  <button
                    onClick={() => editar(p)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={() => {
              setEditandoId(null);
              setForm({
                fecha_inicio: "",
                fecha_finalizacion: "",
                descripcion: "",
              });
              setModalOpen(true);
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-purple-200"
          >
            Crear Programación
          </button>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg z-50 transform scale-95 transition-all duration-300 ease-in-out">
              <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-6 text-center">
                {editandoId ? 'Editar Programación' : 'Agregar Programación'}
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editandoId) {
                  actualizarProgramacion();
                } else {
                  agregar();
                }
              }}>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Fecha de inicio</label>
                <input
                  type="datetime-local"
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  required
                />
                <label className="block mb-2 text-sm font-semibold text-gray-700">Fecha de finalización</label>
                <input
                  type="datetime-local"
                  value={form.fecha_finalizacion}
                  onChange={(e) => setForm({ ...form, fecha_finalizacion: e.target.value })}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  required
                />
                <label className="block mb-2 text-sm font-semibold text-gray-700">Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  required
                />
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-full transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-full transition duration-200"
                  >
                    {editandoId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
