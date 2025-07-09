"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ZonasPage() {
  const searchParams = useSearchParams();
  const id_invernadero = searchParams.get("id_invernadero") || "1";

  const [zonas, setZonas] = useState([
    {
      id: 1,
      nombre: "Zona Norte",
      descripciones_add: "Tomates y pimientos",
      estado: "activo",
      id_cultivo: null,
    },
  ]);
  const [zonaEditando, setZonaEditando] = useState<any>(null);

const guardarEdicion = () => {
  setZonas((prev) =>
    prev.map((z) =>
      z.id === zonaEditando.id ? zonaEditando : z
    )
  );
  setZonaEditando(null);
};


  // Cultivos simulados
  const cultivosDisponibles = [
    { id: 1, nombre_cultivo: "Tomate" },
    { id: 2, nombre_cultivo: "Lechuga" },
    { id: 3, nombre_cultivo: "Pimiento" },
  ];

  const [form, setForm] = useState({
    nombre: "",
    descripciones_add: "",
    id_cultivo: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const crearZona = () => {
    const nueva = {
      id: Date.now(),
      nombre: form.nombre,
      descripciones_add: form.descripciones_add,
      estado: "activo",
      id_cultivo: form.id_cultivo || null,
    };

    setZonas([...zonas, nueva]);
    setForm({ nombre: "", descripciones_add: "", id_cultivo: "" });
    setModalOpen(false);
  };

  const cambiarEstado = (id: number, nuevoEstado: string) => {
    setZonas((prev) =>
      prev.map((zona) =>
        zona.id === id ? { ...zona, estado: nuevoEstado } : zona
      )
    );
    setMenuOpenId(null);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-8">
        Zonas del Invernadero #{id_invernadero}
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zonas.map((zona) => (
          
          <div
            key={zona.id}
            className="bg-white rounded-xl shadow-md p-5 border border-gray-200 relative flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-green-700">{zona.nombre}</h2>
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId((prev) => (prev === zona.id ? null : zona.id))
                  }
                  className="text-gray-600 hover:text-gray-800"
                >
                  ⋮
                </button>
                {menuOpenId === zona.id && (
                  <div className="absolute right-0 mt-2 bg-white border shadow rounded-md z-50">
                    <button
                      onClick={() => cambiarEstado(zona.id, "activo")}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Activar
                    </button>
                    <button
                      onClick={() => cambiarEstado(zona.id, "inactivo")}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Inactivar
                    </button>
                    <button
                      onClick={() => cambiarEstado(zona.id, "mantenimiento")}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      En mantenimiento
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600">{zona.descripciones_add}</p>
            <p className="text-sm text-gray-700">
              Estado:{" "}
              <span className="font-semibold uppercase">{zona.estado}</span>
            </p>
            <p className="text-xs text-gray-500">Invernadero ID: {id_invernadero}</p>
            {zona.id_cultivo && (
              <p className="text-xs text-gray-700">
                Cultivo asignado:{" "}
                {
                  cultivosDisponibles.find((c) => c.id.toString() === zona.id_cultivo)?.nombre_cultivo
                }
              </p>
            )}

            <div className="flex justify-between mt-4">
              <Link
                href={`/home/admin/invernaderos/zonas/programacion-riego?id=${zona.id}`}
                className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 text-sm"
              >
                Riego
              </Link>
              <Link
                href={`/home/admin/invernaderos/zonas/programacion-iluminacion?id=${zona.id}`}
                className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 text-sm"
              >
                Iluminación
              </Link>
              <button
                onClick={() => setZonaEditando(zona)}
                className="bg-blue- text-blue-700 px-4 py-1 rounded-md hover:bg-blue-600 text-sm"
              >
                Editar
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Botón de crear zona */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition"
        >
          Crear Zona
        </button>
      </div>

      {/* Modal de creación */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Nueva Zona</h2>

            <input
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded mb-3"
            />
            <textarea
              placeholder="Descripción"
              value={form.descripciones_add}
              onChange={(e) =>
                setForm({ ...form, descripciones_add: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded mb-3"
            />

            {/* Select de cultivo */}
            <select
              value={form.id_cultivo}
              onChange={(e) => setForm({ ...form, id_cultivo: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded mb-4"
            >
              <option value="">-- Sin cultivo --</option>
              {cultivosDisponibles.map((cultivo) => (
                <option key={cultivo.id} value={cultivo.id}>
                  {cultivo.nombre_cultivo}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={crearZona}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de edición */}
{zonaEditando && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-semibold text-green-700 mb-4">Editar Zona</h2>

      <input
        placeholder="Nombre"
        value={zonaEditando.nombre}
        onChange={(e) =>
          setZonaEditando({ ...zonaEditando, nombre: e.target.value })
        }
        className="w-full border border-gray-300 p-2 rounded mb-3"
      />
      <textarea
        placeholder="Descripción"
        value={zonaEditando.descripciones_add}
        onChange={(e) =>
          setZonaEditando({
            ...zonaEditando,
            descripciones_add: e.target.value,
          })
        }
        className="w-full border border-gray-300 p-2 rounded mb-3"
      />

      <select
        value={zonaEditando.id_cultivo || ""}
        onChange={(e) =>
          setZonaEditando({
            ...zonaEditando,
            id_cultivo: e.target.value,
          })
        }
        className="w-full border border-gray-300 p-2 rounded mb-4"
      >
        <option value="">-- Sin cultivo --</option>
        {cultivosDisponibles.map((cultivo) => (
          <option key={cultivo.id} value={cultivo.id}>
            {cultivo.nombre_cultivo}
          </option>
        ))}
      </select>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setZonaEditando(null)}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button
          onClick={guardarEdicion}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}
