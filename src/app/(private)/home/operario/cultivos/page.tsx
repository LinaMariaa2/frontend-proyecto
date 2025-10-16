"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext'; // tu contexto de usuario
import Image from 'next/image';
import { Package, Loader2, Thermometer, Droplets, CalendarDays, AlertTriangle } from 'lucide-react';

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
  estado: 'activo' | 'finalizado';
  imagenes?: string;
}

// --- Badge de estado ---
const StatusBadge = ({ estado }: { estado: 'activo' | 'finalizado' }) => {
  const config = {
    activo: { text: "Activo", color: "bg-teal-100 text-teal-800" },
    finalizado: { text: "Finalizado", color: "bg-slate-200 text-slate-800" },
  };
  const current = config[estado] || config.finalizado;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${current.color}`}>
      {current.text}
    </span>
  );
};

// --- Componente principal ---
export default function CultivosOperarioPage() {
  const { user } = useUser(); // usuario logueado
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCultivos = async () => {
      if (!user?.id_persona) {
        setError("No se pudo obtener el ID del operario. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`https://backendhortitech.onrender.com/api/cultivos/operario/${user.id_persona}`);
        setCultivos(res.data);
      } catch (err) {
        console.error('Error al cargar cultivos:', err);
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data.error || 'Error al conectar con el servidor.');
        } else {
          setError('Ocurrió un error inesperado al cargar los cultivos.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCultivos();
  }, [user]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin"/>
          <p className="mt-4 text-slate-500">Cargando cultivos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-red-300 text-red-700">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500"/>
          <h3 className="mt-4 text-xl font-semibold">Error al cargar datos</h3>
          <p className="mt-1">{error}</p>
        </div>
      );
    }

    if (cultivos.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Package className="w-16 h-16 mx-auto text-slate-400" />
          <h3 className="mt-4 text-xl font-semibold text-slate-700">No hay cultivos para mostrar</h3>
          <p className="text-slate-500 mt-1">No se encontraron cultivos asignados a tu cuenta.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cultivos.map((c) => (
          <div
            key={c.id_cultivo}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group"
          >
            <div className="h-48 bg-slate-100 overflow-hidden">
              <Image
                src={c.imagenes || "https://placehold.co/600x400/e2e8f0/94a3b8?text=Sin+Imagen"}
                alt={c.nombre_cultivo}
                width={600}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                unoptimized={true} // evita loader de Next.js
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
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>{c.temp_min}°C - {c.temp_max}°C</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span>{c.humedad_min}% - {c.humedad_max}%</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <span>
                    {new Date(c.fecha_inicio).toLocaleDateString()} -{" "}
                    {c.fecha_fin ? new Date(c.fecha_fin).toLocaleDateString() : "Presente"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Package className="w-10 h-10 text-slate-500"/>
          <span>Cultivos Asignados</span>
        </h1>
        <p className="text-lg text-slate-500 mt-1">
          Consulta los cultivos asignados a tu perfil y sus parámetros.
        </p>
      </div>
      {renderContent()}
    </main>
  );
}
