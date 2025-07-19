"use client";

import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import axios from "axios";

interface Cultivo {
  id_cultivo: number;
  nombre_cultivo: string;
  descripcion: string;
  temp_min: number;
  temp_max: number;
  humedad_min: number;
  humedad_max: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  imagenes?: string;
}

export default function CultivosOperario() {
  const [busqueda, setBusqueda] = useState("");
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/cultivos")
      .then((res) => setCultivos(res.data))
      .catch((err) => console.error("Error al obtener cultivos:", err));
  }, []);

  const cultivosFiltrados = cultivos.filter((c) =>
    c.nombre_cultivo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen transition-all duration-300">
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
            key={c.id_cultivo}
            className="bg-white p-5 rounded-xl shadow-md flex flex-col gap-2"
          >
            <h2 className="text-lg font-bold text-green-700">
              {c.nombre_cultivo}
            </h2>

            {c.imagenes ? (
              <img
                src={c.imagenes}
                alt="Cultivo"
                className="w-full h-40 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm italic rounded-md">
                Sin imagen
              </div>
            )}

            <p className="text-sm text-gray-500">{c.descripcion}</p>
            <p className="text-sm">
              🌡️ {c.temp_min}°C - {c.temp_max}°C
            </p>
            <p className="text-sm">
              💧 {c.humedad_min}% - {c.humedad_max}%
            </p>
            <p className="text-sm">
              🗓️ {new Date(c.fecha_inicio).toLocaleDateString()} -{" "}
              {c.fecha_fin
                ? new Date(c.fecha_fin).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-sm font-semibold uppercase text-green-600">
              Estado: {c.estado}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
