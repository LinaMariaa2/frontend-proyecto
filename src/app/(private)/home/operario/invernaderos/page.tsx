"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function InvernaderosOperarioPage() {
  const [invernaderos] = useState([
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

  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-darkGreen-900 mb-8 text-center md:text-left">
        Invernaderos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invernaderos.map((inv) => (
          <div
            key={inv.id}
            className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold text-green-800">
                {inv.nombre}
              </h2>
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
              href={`/home/operario/invernaderos/zonas?id_invernadero=${inv.id}`}
              className="text-green-500 hover:text-green-700 font-semibold mt-auto"
            >
              Ver zonas
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
