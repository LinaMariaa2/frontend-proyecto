"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Package, Search, Loader2, Thermometer, Droplets, CalendarDays } from "lucide-react";

// --- Interfaces ---
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

// --- Componente de Badge de Estado ---
const StatusBadge = ({ estado }: { estado: string }) => {
    const variants = {
        activo: "bg-teal-100 text-teal-800",
        finalizado: "bg-slate-200 text-slate-800",
    };
    const style = variants[estado] || variants.finalizado;
    return <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${style}`}>{estado}</span>;
};

// --- Componente Principal ---
export default function CultivosOperario() {
  const [busqueda, setBusqueda] = useState("");
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCultivos = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:4000/api/cultivos");
            setCultivos(res.data);
        } catch (err) {
            console.error("Error al obtener cultivos:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchCultivos();
  }, []);

  const cultivosFiltrados = cultivos.filter((c) =>
    c.nombre_cultivo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
        <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                <Package className="w-10 h-10 text-slate-500"/>
                <span>Cultivos Registrados</span>
            </h1>
            <p className="text-lg text-slate-500 mt-1">
              Consulta la información y parámetros de los cultivos.
            </p>
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    placeholder="Buscar por nombre de cultivo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full border border-slate-300 p-2.5 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
        </div>

        {loading ? (
            <div className="text-center py-20">
                <Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin"/>
                <p className="mt-4 text-slate-500">Cargando cultivos...</p>
            </div>
        ) : cultivosFiltrados.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cultivosFiltrados.map((c) => (
                    <div
                        key={c.id_cultivo}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group"
                    >
                        <div className="h-48 bg-slate-100 overflow-hidden">
                            <Image
                                src={c.imagenes || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Sin+Imagen'}
                                alt={c.nombre_cultivo}
                                width={600}
                                height={400}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                unoptimized={true} // CORRECCIÓN: Evita el error del loader
                            />
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold text-slate-800">{c.nombre_cultivo}</h2>
                                <StatusBadge estado={c.estado} />
                            </div>
                            <p className="text-sm text-slate-500 mb-4 flex-grow line-clamp-3">{c.descripcion}</p>
                            <div className="text-sm space-y-2 border-t border-slate-200 pt-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Thermometer className="w-4 h-4 text-red-500"/>
                                    <span>{c.temp_min}°C - {c.temp_max}°C</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Droplets className="w-4 h-4 text-sky-500"/>
                                    <span>{c.humedad_min}% - {c.humedad_max}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <CalendarDays className="w-4 h-4 text-slate-500"/>
                                    <span>
                                        {new Date(c.fecha_inicio).toLocaleDateString()} - {c.fecha_fin ? new Date(c.fecha_fin).toLocaleDateString() : "Presente"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <Package className="w-16 h-16 mx-auto text-slate-400" />
                <h3 className="mt-4 text-xl font-semibold text-slate-700">No se encontraron cultivos</h3>
                <p className="text-slate-500 mt-1">Intenta con otro término de búsqueda.</p>
            </div>
        )}
    </main>
  );
}
