"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sprout, User, Building, CheckCircle2, XCircle, Wrench, Loader2, ChevronRight, X, Droplets, Sun, Thermometer, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from "recharts";

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

// --- Componentes Reutilizables ---
const StatusBadge = ({ estado }: { estado: string }) => {
    const config = {
      activo: { text: "Activo", color: "bg-teal-100 text-teal-800", icon: <CheckCircle2 className="w-3 h-3" /> },
      inactivo: { text: "Inactivo", color: "bg-amber-100 text-amber-800", icon: <XCircle className="w-3 h-3" /> },
      mantenimiento: { text: "Mantenimiento", color: "bg-slate-200 text-slate-800", icon: <Wrench className="w-3 h-3" /> },
    };
    const current = config[estado] || config.inactivo;
    return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${current.color}`}>{current.icon}{current.text}</span>;
};

const ZonaChart = ({ data, idealRange, dataKey, name, unit, color }) => (
    <div className="mt-4">
        <h4 className="text-sm font-semibold text-slate-600 mb-2">{name} Reciente ({unit})</h4>
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tiempo" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[idealRange.min - 5, idealRange.max + 5]}/>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '13px' }}/>
                <ReferenceArea y1={idealRange.min} y2={idealRange.max} fill={color} fillOpacity={0.1} label={{ value: "Rango Ideal", position: "insideTopRight", fill: "#94a3b8", fontSize: 11, dy: 10 }} />
                <Line type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2.5} dot={{ r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

// --- Componente Principal ---
export default function ZonasOperarioPage() {
  const searchParams = useSearchParams();
  const id_invernadero = searchParams.get("id_invernadero");
  
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cultivosDisponibles, setCultivosDisponibles] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id_invernadero) return;
      setLoading(true);
      try {
        const [zonasRes, cultivosRes] = await Promise.all([
            axios.get(`http://localhost:4000/api/zona/invernadero/${id_invernadero}`),
            axios.get("http://localhost:4000/api/cultivos")
        ]);
        setZonas(zonasRes.data);
        setCultivosDisponibles(cultivosRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_invernadero]);

  const obtenerNombreCultivo = (id_cultivo) => {
    const cultivo = cultivosDisponibles.find((c) => c.id_cultivo === Number(id_cultivo));
    return cultivo ? cultivo.nombre_cultivo : "Sin Asignar";
  };
  
  const humidityData = [
      { tiempo: "30m", humedad_actual: 55 }, { tiempo: "20m", humedad_actual: 52 },
      { tiempo: "10m", humedad_actual: 50 }, { tiempo: "Ahora", humedad_actual: 48 },
  ];

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
       <div className="mb-10">
          <Link href="/home/operario/invernaderos" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4"/> Volver a Invernaderos
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Zonas del Invernadero #{id_invernadero}
          </h1>
          <p className="text-lg text-slate-500 mt-1">
            Total: {zonas.length} | Activas: {zonas.filter(z => z.estado === 'activo').length}
          </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
            <Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin"/>
            <p className="mt-4 text-slate-500">Cargando zonas...</p>
        </div>
      ) : zonas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {zonas.map((zona) => (
            <div key={zona.id_zona} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800">{zona.nombre}</h3>
                    <p className="text-sm text-slate-500 mb-3 h-10 line-clamp-2">{zona.descripciones_add}</p>
                    <div className="flex items-center gap-4 mb-3">
                        <StatusBadge estado={zona.estado}/>
                        <span className="text-sm text-slate-600"><strong>Cultivo:</strong> {obtenerNombreCultivo(zona.id_cultivo)}</span>
                    </div>
                    <ZonaChart data={humidityData} idealRange={{min: 50, max: 65}} dataKey="humedad_actual" name="Humedad" unit="%" color="#3b82f6" />
                </div>
                <div className="mt-auto border-t border-slate-200 bg-slate-50 p-3 grid grid-cols-2 gap-3">
                    <Link href={`/home/operario/invernaderos/zonas/programacion-riego?id=${zona.id_zona}`} className="text-sm text-center font-semibold bg-blue-100 text-blue-800 px-3 py-2 rounded-md hover:bg-blue-200 flex items-center justify-center gap-1.5"><Droplets className="w-4 h-4"/> Riego</Link>
                    <Link href={`/home/operario/invernaderos/zonas/programacion-iluminacion?id=${zona.id_zona}`} className="text-sm text-center font-semibold bg-amber-100 text-amber-800 px-3 py-2 rounded-md hover:bg-amber-200 flex items-center justify-center gap-1.5"><Sun className="w-4 h-4"/> Iluminación</Link>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <Building className="w-16 h-16 mx-auto text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-700">No hay zonas para mostrar</h3>
            <p className="text-slate-500 mt-1">Este invernadero aún no tiene zonas configuradas.</p>
        </div>
      )}
    </main>
  );
}
