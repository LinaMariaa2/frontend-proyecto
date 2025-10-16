"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sprout, User, Building, CheckCircle2, XCircle, Wrench, Loader2, ChevronRight, AlertTriangle } from 'lucide-react';

interface LinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
}

// 2. Componente Link con tipado explícito
const Link = ({ children, href, className }: LinkProps) => (
    <a href={href} className={className} onClick={(e) => e.preventDefault()}>{children}</a>
);

// 2. Sustituto para useUser (proporciona un ID de prueba para la API)
const useUser = () => ({
	user: { id_persona: 1, nombre_usuario: "OperarioDemo", rol: "OPERARIO", estado: "activo" },
});

// 3. Sustituto para el cliente 'api' (Apunta a tu URL de Render)
// La URL base DEBE ser 'https://backendhortitech.onrender.com/api'
const api = axios.create({
    baseURL: 'https://backendhortitech.onrender.com/api',
});
// -------------------------------------------------------------------------


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
  const current = config[estado as keyof typeof config] || config.inactivo;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${current.color}`}>
      {current.icon}
      {current.text}
    </span>
  );
};

// --- Componente Principal ---
export default function InvernaderosOperarioPage() {
  const { user } = useUser(); // ⬅️ Usuario logueado
  const [invernaderos, setInvernaderos] = useState<Invernadero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerInvernaderos = async () => {
      if (!user?.id_persona) {
        setError("No se pudo obtener el ID del operario. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      try {
        // ✅ CORRECCIÓN FINAL: Usa el cliente 'api' con la ruta relativa.
        // La URL completa será: https://backendhortitech.onrender.com/api/invernadero/operario/{id}
        const res = await api.get(`/invernadero/operario/${user.id_persona}`); 
        
        setInvernaderos(res.data);
      } catch (err) {
        console.error('Error al cargar invernaderos:', err);
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data.error || 'Error al conectar con el servidor.');
        } else {
          setError('Ocurrió un error inesperado al cargar los invernaderos. (Verifique que el backend esté activo).');
        }
      } finally {
        setLoading(false);
      }
    };

    obtenerInvernaderos();
  }, [user]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin"/>
          <p className="mt-4 text-slate-500">Cargando invernaderos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-red-300 text-red-700 p-8">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500"/>
          <h3 className="mt-4 text-xl font-semibold">Error al cargar datos</h3>
          <p className="mt-1 font-mono text-sm break-words px-4">{error}</p>
        </div>
      );
    }
    
    if (invernaderos.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 p-8">
          <Sprout className="w-16 h-16 mx-auto text-slate-400" />
          <h3 className="mt-4 text-xl font-semibold text-slate-700">No hay invernaderos para mostrar</h3>
          <p className="text-slate-500 mt-1">No se encontraron invernaderos asignados a tu cuenta.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invernaderos.map((inv) => (
          <div
            key={inv.id_invernadero}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group hover:shadow-lg transition-shadow"
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
            <div className="mt-auto border-t border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
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
    );
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Sprout className="w-10 h-10 text-slate-500"/>
          <span>Invernaderos Asignados</span>
        </h1>
        <p className="text-lg text-slate-500 mt-1">
          Consulta el estado y la información de los invernaderos asignados a tu perfil.
        </p>
      </div>
      {renderContent()}
    </main>
  );
}
