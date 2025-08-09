"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Sprout, User, Building, CheckCircle2, XCircle, Wrench, Loader2, ChevronRight } from 'lucide-react';

// --- Interfaces ---
interface Invernadero {
  id_invernadero: number;
  nombre: string;
  descripcion: string;
  responsable_id: number;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  zonas_totales: number;
  zonas_activas: number;
  encargado?: Responsable;
}

interface Responsable {
  id_persona: number;
  nombre_usuario: string;
}

// --- Componente de Badge de Estado ---
const StatusBadge = ({ estado }: { estado: string }) => {
    const config = {
      activo: { text: "Activo", color: "bg-teal-100 text-teal-800", icon: <CheckCircle2 className="w-3 h-3" /> },
      inactivo: { text: "Inactivo", color: "bg-amber-100 text-amber-800", icon: <XCircle className="w-3 h-3" /> },
      mantenimiento: { text: "Mantenimiento", color: "bg-slate-200 text-slate-800", icon: <Wrench className="w-3 h-3" /> },
    };
    const current = config[estado] || config.inactivo;
    return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${current.color}`}>{current.icon}{current.text}</span>;
};

// --- Componente Principal ---
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

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Sprout className="w-10 h-10 text-slate-500"/>
            <span>Invernaderos</span>
        </h1>
        <p className="text-lg text-slate-500 mt-1">
          Consulta el estado y la información de los invernaderos asignados.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
            <Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin"/>
            <p className="mt-4 text-slate-500">Cargando invernaderos...</p>
        </div>
      ) : invernaderos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invernaderos.map((inv) => (
            <div
              key={inv.id_invernadero}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group"
            >
                <div className="p-5">
                    <h2 className="text-xl font-bold text-slate-800">{inv.nombre}</h2>
                    <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{inv.descripcion}</p>
                    <div className="text-sm space-y-2">
                        <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4"/>
                            <span>Responsable: <span className="font-semibold">{inv.encargado?.nombre_usuario || 'No asignado'}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Building className="w-4 h-4"/>
                            <span>Zonas: <span className="font-semibold">{inv.zonas_activas || 0} de {inv.zonas_totales || 0} activas</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge estado={inv.estado} />
                        </div>
                    </div>
                </div>
                 <div className="mt-auto border-t border-slate-200 bg-slate-50 p-4">
                     <Link
                      href={`/home/operario/invernaderos/zonas?id_invernadero=${inv.id_invernadero}`}
                      className="font-semibold text-teal-600 flex items-center justify-between group-hover:text-teal-700"
                    >
                        <span>Ver Zonas</span>
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <Sprout className="w-16 h-16 mx-auto text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-700">No hay invernaderos para mostrar</h3>
            <p className="text-slate-500 mt-1">No se encontraron invernaderos activos o asignados.</p>
        </div>
      )}
    </main>
  );
}
