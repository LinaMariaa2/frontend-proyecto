"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function InvernaderosPage() {
  const [invernaderos, setInvernaderos] = useState([
    {
      id: 1,
      nombre: "Invernadero A",
      descripcion: "Cultivo de tomate",
      responsable: "Juan",
      estado: "activo",
      zonas_totales: 5,
      zonas_activas: 3,
    },
    {
      id: 2,
      nombre: "Invernadero B",
      descripcion: "Cultivo de lechuga",
      responsable: "Perez",
      estado: "inactivo",
      zonas_totales: 4,
      zonas_activas: 0,
    },
  ]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    responsable: "",
    zonas_totales: 0,
    zonas_activas: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [busquedaResponsable, setBusquedaResponsable] = useState("");

  const responsables = [
    { id: 1, nombre: "Carlos Pérez", rol: "admin", activo: true },
    { id: 2, nombre: "Laura Gómez", rol: "operario", activo: true },
    { id: 3, nombre: "Andrés Díaz", rol: "admin", activo: false },
    { id: 4, nombre: "Marcela Ruiz", rol: "operario", activo: true },
  ];

  const filtrados = responsables.filter(
    (r) =>
      r.activo &&
      (r.nombre.toLowerCase().includes(busquedaResponsable.toLowerCase()) ||
        r.rol.toLowerCase().includes(busquedaResponsable.toLowerCase())) &&
      (r.rol === "admin" || r.rol === "operario")
  );

  const crearInvernadero = () => {
    if (!form.nombre || !form.descripcion || !form.responsable) return;
    const nuevo = {
      id: Date.now(),
      ...form,
      estado: "activo",
    };
    setInvernaderos([...invernaderos, nuevo]);
    setForm({
      nombre: "",
      descripcion: "",
      responsable: "",
      zonas_totales: 0,
      zonas_activas: 0,
    });
    setBusquedaResponsable("");
    setModalOpen(false);
  };

  const cambiarEstado = (id: number, nuevoEstado: string) => {
    setInvernaderos((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, estado: nuevoEstado } : inv
      )
    );
    setMenuOpenId(null);
  };

  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-darkGreen-900 mb-8 text-center md:text-left">
        Invernaderos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {invernaderos.map((inv) => (
          <div
            key={inv.id}
            className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3 relative"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold text-green-800">
                {inv.nombre}
              </h2>
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId((prev) => (prev === inv.id ? null : inv.id))
                  }
                  className="text-gray-600 hover:text-gray-800"
                >
                  ⋮
                </button>
                {menuOpenId === inv.id && (
                  <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md z-50">
                    <button
                      onClick={() => cambiarEstado(inv.id, "activo")}
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      Activar
                    </button>
                    <button
                      onClick={() => cambiarEstado(inv.id, "inactivo")}
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      Inactivar
                    </button>
                    <button
                      onClick={() => cambiarEstado(inv.id, "mantenimiento")}
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      En mantenimiento
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-500 text-sm">{inv.descripcion}</p>
            <p className="text-sm font-medium">
              Responsable:{" "}
              <span className="text-gray-800">{inv.responsable}</span>
            </p>
            <p className="text-sm font-medium">
              Estado:{" "}
              <span className="uppercase text-green-600">{inv.estado}</span>
            </p>
            <p className="text-sm text-gray-600">
              Zonas totales: {inv.zonas_totales}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Zonas activas: {inv.zonas_activas}
            </p>

            <Link
              href={`/home/admin/invernaderos/zonas?id_invernadero=${inv.id}`}
              className="text-green-500 hover:text-green-700 font-semibold mt-auto"
            >
              Ver zonas
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow"
      >
        Crear Invernadero
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow p-8 w-full max-w-md">
            <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">
              Nuevo Invernadero
            </h2>
            <input
              className="w-full p-3 mb-3 border border-gray-300 rounded"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              className="w-full p-3 mb-3 border border-gray-300 rounded"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />

            {/* Buscador de responsable */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Buscar Responsable
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar responsable..."
                  value={busquedaResponsable}
                  onChange={(e) => setBusquedaResponsable(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded"
                />
              </div>
              {busquedaResponsable && (
                <ul className="border mt-1 rounded shadow-sm max-h-40 overflow-y-auto bg-white">
                  {filtrados.length > 0 ? (
                    filtrados.map((r) => (
                      <li
                        key={r.id}
                        className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                        onClick={() => {
                          setForm({ ...form, responsable: r.nombre });
                          setBusquedaResponsable(r.nombre);
                        }}
                      >
                        {r.nombre}{" "}
                        <span className="text-xs text-gray-500">({r.rol})</span>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500">No encontrado</li>
                  )}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-full"
              >
                Cancelar
              </button>
              <button
                onClick={crearInvernadero}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-full"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
