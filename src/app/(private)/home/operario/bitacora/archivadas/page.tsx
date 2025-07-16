"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Autor {
  id_persona: number;
  nombre_usuario: string;
}

interface Invernadero {
  id_invernadero: number;
  nombre: string;
}

interface Zona {
  id_zona: number;
  nombre: string;
}

interface Publicacion {
  id_publicacion: number;
  titulo: string;
  contenido: string;
  tipo_evento: string;
  importancia: "alta" | "media" | "baja";
  invernadero?: Invernadero;
  zona?: Zona;
  autor?: Autor;
}

export default function ArchivadasPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/bitacora?archivadas=true")
      .then((res) => setPublicaciones(res.data))
      .catch((err) => console.error("Error al obtener archivadas", err));
  }, []);

  const desarchivar = async (id: number) => {
    try {
      await axios.patch(`http://localhost:4000/api/bitacora/${id}/desarchivar`);
      const res = await axios.get("http://localhost:4000/api/bitacora?archivadas=true");
      setPublicaciones(res.data);
    } catch (err) {
      console.error("Error al desarchivar", err);
      alert("No se pudo desarchivar");
    }
  };

  return (
    <main className="w-full px-6 md:px-12 lg:px-20 xl:px-32 mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-700">Publicaciones Archivadas</h1>
        <Link href="/home/operario/bitacora">
          <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Volver a Bitácora
          </button>
        </Link>
      </div>

      {publicaciones.length === 0 ? (
        <p className="text-gray-500 text-center">No hay publicaciones archivadas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publicaciones.map((pub) => (
            <div key={pub.id_publicacion} className="bg-white shadow rounded-lg p-4 border-l-4 border-gray-400">
              <h3 className="text-xl font-bold text-green-700">{pub.titulo}</h3>
              <p className="text-sm text-gray-500">{pub.tipo_evento?.toUpperCase()}</p>
              <p className="text-gray-700 text-sm mt-2">{pub.contenido}</p>
              <p className="text-xs text-gray-500 mt-2">
                Publicado por: {pub.autor?.nombre_usuario} | Invernadero: {pub.invernadero?.nombre} | Zona: {pub.zona?.nombre}
              </p>

              <button
                onClick={() => desarchivar(pub.id_publicacion)}
                className="mt-3 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 text-sm rounded flex items-center gap-1"
              >
                <ArrowPathIcon className="w-4 h-4" /> Desarchivar
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
