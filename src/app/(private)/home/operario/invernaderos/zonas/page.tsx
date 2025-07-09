"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ZonasOperarioPage() {
  const searchParams = useSearchParams();
  const id_invernadero = searchParams.get("id_invernadero") || "1";

  const [zonas] = useState([
    {
      id: 1,
      nombre: "Zona Norte",
      descripciones_add: "Tomates y pimientos",
      estado: "activo",
      id_cultivo: "1",
    },
    {
      id: 2,
      nombre: "Zona Sur",
      descripciones_add: "Lechugas",
      estado: "inactivo",
      id_cultivo: null,
    },
  ]);

  const cultivosDisponibles = [
    { id: 1, nombre_cultivo: "Tomate" },
    { id: 2, nombre_cultivo: "Lechuga" },
    { id: 3, nombre_cultivo: "Pimiento" },
  ];

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
            <h2 className="text-xl font-semibold text-green-700">{zona.nombre}</h2>

            <p className="text-sm text-gray-600">{zona.descripciones_add}</p>
            <p className="text-sm text-gray-700">
              Estado:{" "}
              <span className="font-semibold uppercase">{zona.estado}</span>
            </p>
            <p className="text-xs text-gray-500">Invernadero ID: {id_invernadero}</p>
            {zona.id_cultivo && (
              <p className="text-xs text-gray-700">
                Cultivo asignado:{" "}
                {cultivosDisponibles.find((c) => c.id.toString() === zona.id_cultivo)?.nombre_cultivo}
              </p>
            )}

            <div className="flex justify-between mt-4">
              <Link
                href={`/home/operario/invernaderos/zonas/programacion-riego?id=${zona.id}`}
                className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 text-sm"
              >
                Riego
              </Link>
              <Link
                href={`/home/operario/invernaderos/zonas/programacion-iluminacion?id=${zona.id}`}
                className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 text-sm"
              >
                Iluminación
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
