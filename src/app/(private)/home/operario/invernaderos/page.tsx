'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Invernadero {
  id_invernadero: number;
  nombre: string;
  descripcion: string;
  responsable_id: number;
  estado: string;
  zonas_totales: number;
  zonas_activas: number;
  encargado?: Responsable;
}

interface Responsable {
  id_persona: number;
  nombre_usuario: string;
}

export default function InvernaderosOperarioPage() {
  const [invernaderos, setInvernaderos] = useState<Invernadero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerInvernaderos = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/invernadero');
        setInvernaderos(res.data);
      } catch (err) {
        console.error('Error al cargar invernaderos:', err);
      } finally {
        setLoading(false);
      }
    };

    obtenerInvernaderos();
  }, []);

  const obtenerNombreResponsable = (inv: Invernadero) => {
    return inv.encargado?.nombre_usuario || `ID ${inv.responsable_id}`;
  };

  return (
    <main className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen transition-all duration-300">
      <h1 className="text-4xl font-bold text-green-900 mb-10">Invernaderos</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">Cargando invernaderos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {invernaderos.map((inv) => (
            <div
              key={inv.id_invernadero}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 hover:shadow-lg hover:scale-[1.03] transition-transform"
            >
              <h2 className="text-xl font-semibold text-green-800">{inv.nombre}</h2>
              <p className="text-gray-500 text-sm">{inv.descripcion}</p>
              <p className="text-sm font-medium">
                Responsable: <span className="text-gray-800">{obtenerNombreResponsable(inv)}</span>
              </p>
              <p className="text-sm font-medium">
                Estado: <span className="uppercase font-semibold text-green-600">{inv.estado}</span>
              </p>
              <p className="text-sm text-gray-600">Zonas totales: {inv.zonas_totales}</p>
              <p className="text-sm text-gray-600 mb-4">Zonas activas: {inv.zonas_activas}</p>

              <Link
                href={`/home/operario/invernaderos/zonas?id_invernadero=${inv.id_invernadero}`}
                className="text-green-500 hover:text-green-800 font-semibold mt-auto"
              >
                Ver zonas
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
