"use client";

import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

export default function CultivosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [cultivos, setCultivos] = useState([
    {
      id: 1,
      nombre_cultivo: "Tomate Cherry",
      descripcion: "Cultivo experimental bajo luz artificial",
      temp_min: 18.5,
      temp_max: 28.0,
      humedad_min: 50.0,
      humedad_max: 80.0,
      id_zona: 1,
      id_invernadero: 1,
      fecha_inicio: "2025-06-01",
      fecha_fin: "2025-08-01",
      estado: "activo",
      imagen: "",
    },
  ]);

  const invernaderos = [
    { id: 1, nombre: "Invernadero 1", estado: "activo" },
    { id: 2, nombre: "Invernadero 2", estado: "inactivo" },
    { id: 3, nombre: "Invernadero 3", estado: "activo" },
  ];

  const zonasPorInvernadero = {
    1: [
      { id: 1, nombre: "Zona A" },
      { id: 2, nombre: "Zona B" },
    ],
    3: [{ id: 3, nombre: "Zona X" }],
  };

  const [form, setForm] = useState({
    nombre_cultivo: "",
    descripcion: "",
    temp_min: "",
    temp_max: "",
    humedad_min: "",
    humedad_max: "",
    id_zona: "",
    id_invernadero: "",
    fecha_inicio: "",
    fecha_fin: "",
    imagen: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const agregarCultivo = () => {
    if (
      !form.nombre_cultivo ||
      !form.descripcion ||
      !form.temp_min ||
      !form.temp_max ||
      !form.humedad_min ||
      !form.humedad_max ||
      !form.id_zona ||
      !form.id_invernadero ||
      !form.fecha_inicio
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    const nuevo = {
      id: Date.now(),
      ...form,
      estado: "activo",
    };

    setCultivos([...cultivos, nuevo]);
    setForm({
      nombre_cultivo: "",
      descripcion: "",
      temp_min: "",
      temp_max: "",
      humedad_min: "",
      humedad_max: "",
      id_zona: "",
      id_invernadero: "",
      fecha_inicio: "",
      fecha_fin: "",
      imagen: "",
    });
    setModalOpen(false);
  };

  const cambiarEstado = (id: number, nuevo: string) => {
    if (confirm("¿Estás seguro de cambiar el estado del cultivo?")) {
      setCultivos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevo } : c))
      );
      setMenuOpenId(null);
    }
  };

  const zonasDisponibles = zonasPorInvernadero[form.id_invernadero] || [];

  const cultivosFiltrados = cultivos.filter((c) =>
    c.nombre_cultivo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-4">
        Gestión de Cultivos
      </h1>

      {/* Buscador */}
      <div className="mb-6 flex items-center gap-2">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
        <input
          placeholder="Buscar cultivo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full md:max-w-sm border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* Lista de cultivos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cultivosFiltrados.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-xl shadow-md relative flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-green-700">
                {c.nombre_cultivo}
              </h2>
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId((prev) => (prev === c.id ? null : c.id))
                  }
                >
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                </button>
                {menuOpenId === c.id && (
                  <div className="absolute right-0 mt-2 bg-white border shadow rounded-md z-50">
                    <button
                      onClick={() => cambiarEstado(c.id, "activo")}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Activar
                    </button>
                    <button
                      onClick={() => cambiarEstado(c.id, "inactivo")}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Inactivar
                    </button>
                  </div>
                )}
              </div>
            </div>
            {c.imagen && (
              <img
                src={c.imagen}
                alt="Cultivo"
                className="w-full h-40 object-cover rounded-md"
              />
            )}
            <p className="text-sm text-gray-500">{c.descripcion}</p>
            <p className="text-sm">🌡️ {c.temp_min}°C - {c.temp_max}°C</p>
            <p className="text-sm">💧 {c.humedad_min}% - {c.humedad_max}%</p>
            <p className="text-sm">Zona: {c.id_zona}</p>
            <p className="text-sm">Invernadero: {c.id_invernadero}</p>
            <p className="text-sm">Inicio: {c.fecha_inicio}</p>
            <p className="text-sm">Fin: {c.fecha_fin || "—"}</p>
            <p className="text-sm font-semibold">Estado: {c.estado}</p>
            <div className="flex gap-2 mt-3">
              <button className="bg-green-500 text-white px-3 py-1 rounded-md text-sm">
                Iniciar
              </button>
              <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">
                Finalizar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botón */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-6 py-3 font-bold rounded-full"
        >
          Crear Cultivo
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Nuevo Cultivo</h2>

            <div className="space-y-3">
              <input
                placeholder="Nombre del cultivo"
                value={form.nombre_cultivo}
                onChange={(e) =>
                  setForm({ ...form, nombre_cultivo: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                placeholder="Descripción"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Temperatura mín"
                  value={form.temp_min}
                  onChange={(e) =>
                    setForm({ ...form, temp_min: e.target.value })
                  }
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Temperatura máx"
                  value={form.temp_max}
                  onChange={(e) =>
                    setForm({ ...form, temp_max: e.target.value })
                  }
                  className="border px-3 py-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Humedad mín"
                  value={form.humedad_min}
                  onChange={(e) =>
                    setForm({ ...form, humedad_min: e.target.value })
                  }
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Humedad máx"
                  value={form.humedad_max}
                  onChange={(e) =>
                    setForm({ ...form, humedad_max: e.target.value })
                  }
                  className="border px-3 py-2 rounded"
                />
              </div>
              <select
                value={form.id_invernadero}
                onChange={(e) =>
                  setForm({
                    ...form,
                    id_invernadero: parseInt(e.target.value),
                    id_zona: "",
                  })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Seleccione un invernadero</option>
                {invernaderos
                  .filter((inv) => inv.estado === "activo")
                  .map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.nombre}
                    </option>
                  ))}
              </select>
              <select
                value={form.id_zona}
                onChange={(e) =>
                  setForm({ ...form, id_zona: parseInt(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Seleccione una zona</option>
                {zonasDisponibles.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) =>
                  setForm({ ...form, fecha_inicio: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="date"
                value={form.fecha_fin}
                onChange={(e) =>
                  setForm({ ...form, fecha_fin: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Imagen del cultivo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () =>
                        setForm({ ...form, imagen: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={agregarCultivo}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Crear Cultivo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
