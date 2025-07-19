"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";

interface Zona {
  id_zona: number;
  nombre: string;
  descripciones_add: string;
  estado: string;
  id_cultivo?: string | null;
}

interface Cultivo {
  id_cultivo: number;
  nombre_cultivo: string;
}

export default function ZonasOperario() {
  const searchParams = useSearchParams();
  const id_invernadero = searchParams.get("id_invernadero") || "1";

  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cultivosDisponibles, setCultivosDisponibles] = useState<Cultivo[]>([]);

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case "activo":
        return "text-green-600";
      case "inactivo":
        return "text-gray-500";
      case "mantenimiento":
        return "text-yellow-600";
      default:
        return "text-gray-700";
    }
  };

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/zona/invernadero/${id_invernadero}`);
        setZonas(res.data);
      } catch (error) {
        console.error("Error al cargar zonas:", error);
      }
    };
    fetchZonas();
  }, [id_invernadero]);

  useEffect(() => {
    const fetchCultivos = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/cultivos");
        setCultivosDisponibles(res.data);
      } catch (error) {
        console.error("Error al cargar cultivos:", error);
      }
    };
    fetchCultivos();
  }, []);

  const obtenerNombreCultivo = (id_cultivo: string | null | undefined) => {
    const cultivo = cultivosDisponibles.find((c) => c.id_cultivo === Number(id_cultivo));
    return cultivo ? cultivo.nombre_cultivo : "Sin cultivo asignado";
  };

  const totalZonas = zonas.length;
  const zonasActivas = zonas.filter((z) => z.estado === "activo").length;

  return (
    <main className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen transition-all duration-300">
      <h1 className="text-3xl font-bold text-green-800 mb-4">
        Zonas del Invernadero #{id_invernadero}
      </h1>

      <p className="text-gray-600 mb-8">
        Total zonas: <strong>{totalZonas}</strong> | Zonas activas: <strong>{zonasActivas}</strong>
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zonas.map((zona) => (
          <div
            key={zona.id_zona}
            className="bg-white rounded-xl shadow-md p-5 border border-gray-200 flex flex-col gap-2"
          >
            <h2 className="text-xl font-semibold text-green-700">{zona.nombre}</h2>
            <p className="text-sm text-gray-600">{zona.descripciones_add}</p>
            <p className="text-sm text-gray-700">
              Estado: <span className={`font-semibold uppercase ${getColorEstado(zona.estado)}`}>{zona.estado}</span>
            </p>
            <p className="text-sm text-gray-700">
              Cultivo: <span className="italic text-gray-600">{obtenerNombreCultivo(zona.id_cultivo)}</span>
            </p>
            <p className="text-xs text-gray-500">
              ID Zona: {zona.id_zona} | Invernadero: {id_invernadero}
            </p>

            <div className="flex justify-between mt-4">
              <Link
                href={`/home/operario/invernaderos/zonas/programacion-riego?id=${zona.id_zona}`}
                className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 text-sm"
              >
                Riego
              </Link>
              <Link
                href={`/home/operario/invernaderos/zonas/programacion-iluminacion?id=${zona.id_zona}`}
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
