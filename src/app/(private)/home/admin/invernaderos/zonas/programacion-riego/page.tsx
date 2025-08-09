"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import api from '../../../../../../services/api';

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

      if (!Array.isArray(todas)) {
        console.error("La respuesta del backend no es un array:", todas);
        return;
      }

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
    if (zonaId) {
      obtenerProgramaciones();
    }
  }, [zonaId]);

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
      await api.patch(`/programacionRiego/${id}/estado`, {
        activo: !nuevoEstado,
      });

      setEstadosDetenidos(prev => ({
        ...prev,
        [id]: nuevoEstado,
      }));

      await obtenerProgramaciones();
    } catch (error) {
      console.error("Error al cambiar estado de programación:", error);
      alert("No se pudo cambiar el estado.");
    }
  };

  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold text-darkGreen-900 mb-8 text-center md:text-left">
        Programación de Riego - Zona {zonaId}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {programaciones.map((p) => {
          const detenido = estadosDetenidos[p.id_pg_riego] ?? false;

          return (
            <div key={p.id_pg_riego} className="bg-white rounded-2xl shadow-green p-6 flex flex-col gap-4">
              <p className="text-lg font-semibold text-greenSecondary-900">
                Activación: <span className="font-normal text-darkGreen-700">{convertirFechaParaInput(p.fecha_inicio)}</span>
              </p>
              <p className="text-lg font-semibold text-greenSecondary-900">
                Desactivación: <span className="font-normal text-darkGreen-700">{convertirFechaParaInput(p.fecha_finalizacion)}</span>
              </p>
              <p className="text-gray-400">
                Descripción: <span className="text-gray-800">{p.descripcion}</span>
              </p>
              <p className="text-sm text-darkGreen-900 font-medium">
                Tipo: <span className="text-darkGreen-700">{p.tipo_riego}</span>
              </p>

              <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-gray-800 border-opacity-10">
                <button
                  onClick={() => detenerRiego(p.id_pg_riego)}
                  className={`${detenido ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600"} text-white font-bold py-2 px-4 rounded-full transition duration-200`}
                >
                  {detenido ? "Reanudar" : "Detener"}
                </button>
                <button
                  onClick={() => editar(p)}
                  className="bg-pink-500 hover:bg-pinkSecondary-900 text-white font-bold py-2 px-4 rounded-full transition duration-200"
                >
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-500 hover:bg-darkGreen-700 text-white font-bold py-3 px-6 rounded-full transition duration-200 ease-in-out shadow-green"
      >
        Crear Programación
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-40 backdrop-blur-md bg-black/10 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-green p-8 w-full max-w-md">
            <h2 className="text-3xl font-bold text-darkGreen-900 mb-6 text-center">
              {editandoId ? 'Editar Programación' : 'Agregar Programación'}
            </h2>
            <h3>Fecha de inicio</h3>
            <input
              type="datetime-local"
              value={form.fecha_inicio}
              onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-800 border-opacity-20 rounded-md"
            />
            <h3>Fecha de finalización</h3>
            <input
              type="datetime-local"
              value={form.fecha_finalizacion}
              onChange={(e) => setForm({ ...form, fecha_finalizacion: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-800 border-opacity-20 rounded-md"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-800 border-opacity-20 rounded-md"
            />
            <select
              value={form.tipo_riego}
              onChange={(e) => setForm({ ...form, tipo_riego: e.target.value })}
              className="w-full p-3 mb-6 border border-gray-800 border-opacity-20 rounded-md"
            >
              <option value="">Selecciona el tipo de riego</option>
              <option value="Goteo">Goteo</option>
              <option value="Aspersión">Aspersión</option>
              <option value="Manual">Manual</option>
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-full"
              >
                Cancelar
              </button>
              {editandoId ? (
                <button
                  onClick={actualizarProgramacion}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full"
                >
                  Actualizar
                </button>
              ) : (
                <button
                  onClick={agregar}
                  className="bg-green-500 hover:bg-darkGreen-700 text-white font-bold py-2 px-5 rounded-full"
                >
                  Crear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
