"use client";

import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function CultivosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [cultivos] = useState([
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

  const cultivosFiltrados = cultivos.filter((c) =>
    c.nombre_cultivo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-4">
        Cultivos Registrados
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
            <h2 className="text-lg font-bold text-green-700">
              {c.nombre_cultivo}
            </h2>
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
            <p className="text-sm font-semibold uppercase">
              Estado: {c.estado}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
