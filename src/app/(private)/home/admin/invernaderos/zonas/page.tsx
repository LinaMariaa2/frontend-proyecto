"use client";

import React, { useEffect, useState, useRef, JSX } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Se mantiene
import api from "@/app/services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import io from "socket.io-client";

import {
  Plus, MoreVertical, Pencil, Trash2, X, CheckCircle2, XCircle, AlertTriangle, Loader2, Check, CircleDot, Wrench, ArrowLeft, Droplets, Sun, Sprout, Info
} from "lucide-react";

// 🚨 URL del Backend Desplegado para Socket.io
const DEPLOYED_BACKEND_URL = 'https://backendhortitech.onrender.com'; 

// --- Interfaces (Se mantienen igual) ---
interface Zona {
    estado: string;
}
interface Cultivo { /* ... */ }
interface HumedadLectura { /* ... */ }
// ... (Interfaces, ConfirmModal, MessageModal, ZonaChart - Se mantienen igual)
const formInicial = { nombre: "", descripciones_add: "", id_cultivo: "" };

// --- Modales (Se mantienen igual) ---
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = "Confirmar", variant = "default" }: any) => (
  // ... (cuerpo del modal)
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      {variant === 'danger' ? <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" /> : <Info className="w-16 h-16 mx-auto text-amber-500 mb-4" />}
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 mb-8" dangerouslySetInnerHTML={{ __html: message }}></p>
      <div className="flex justify-center gap-4">
        <button onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
        <button onClick={onConfirm} className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}`}>{confirmText}</button>
      </div>
    </div>
  </div>
);

const MessageModal = ({ title, message, onCerrar, success = true }: any) => (
  // ... (cuerpo del modal)
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      {success ? <CheckCircle2 className="w-16 h-16 mx-auto text-teal-500 mb-4" /> : <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />}
      <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-500 mb-8">{message}</p>
      <button onClick={onCerrar} className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Entendido</button>
    </div>
  </div>
);

// --- Gráfica (Se mantiene igual) ---
const ZonaChart = ({ lecturas }: { lecturas: HumedadLectura[] }) => { /* ... */ return };

export default function ZonasContent() {
  const searchParams = useSearchParams();
  // 💡 MANTENEMOS ESTA LECTURA, PERO LA USAMOS CONDICIONALMENTE
  const id_invernadero = searchParams.get("id_invernadero"); 

  // NUEVO ESTADO: Para asegurar que el componente ha sido montado en el cliente
  const [isMounted, setIsMounted] = useState(false); 

  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cultivosDisponibles, setCultivosDisponibles] = useState<Cultivo[]>([]);
  const [form, setForm] = useState(formInicial);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Zona | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const [modalConfirm, setModalConfirm] = useState<any>({ show: false, onConfirm: () => {}, title: '', message: '', confirmText: 'Confirmar', variant: 'default' });
  const [modalMessage, setModalMessage] = useState<any>({ show: false, title: '', message: '', success: true });

  const [lecturas, setLecturas] = useState<{ [key: number]: HumedadLectura[] }>({});

  const menuRef = useRef<HTMLDivElement>(null);

  // 1. Efecto para manejar el montaje y configurar isMounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Efecto para cargar los datos (depende de id_invernadero e isMounted)
  useEffect(() => {
    // Si no está montado, o no hay ID, no hagas nada
    if (!isMounted || !id_invernadero) return; 

    const fetchData = async () => {
      setCargando(true);
      try {
        const [zonasRes, cultivosRes] = await Promise.all([
          api.get(`/zona/invernadero/${id_invernadero}`), 
          api.get("/cultivos")
        ]);
        setZonas(zonasRes.data);
        setCultivosDisponibles(cultivosRes.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setModalMessage({ show: true, success: false, title: "Error de Carga", message: "No se pudieron obtener los datos de las zonas o cultivos." });
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, [id_invernadero, isMounted]); // Depende de ambos

  // --- Socket.io (No necesita isMounted, pero lo agregamos a la dependencia del ID) ---
  useEffect(() => {
    if (!id_invernadero) return;
    const socket = io(DEPLOYED_BACKEND_URL); 
    // La conexión se realiza solo si hay un ID
    socket.emit('joinInvernadero', id_invernadero); 

    socket.on("nuevaLectura", (data: any) => {
      console.log("Lectura recibida:", data);
      if (data.tipo_sensor === "humedad" && data.id_zona) {
        setLecturas(prev => {
          const zonaLecturas = prev[data.id_zona] ? [...prev[data.id_zona]] : [];
          zonaLecturas.push({ actual: data.valor, min: data.min ?? 40, max: data.max ?? 70, timestamp: data.timestamp });
          if (zonaLecturas.length > 20) zonaLecturas.shift();
          return { ...prev, [data.id_zona]: zonaLecturas };
        });
      }
    });
    return () => { 
        socket.emit('leaveInvernadero', id_invernadero);
        socket.disconnect(); 
    };
  }, [id_invernadero]); // Se ejecuta solo cuando el ID está disponible

  // ... (Resto de useEffect, abrirModal, handleFormSubmit, cambiarEstado, eliminarZona, StatusBadge - Se mantienen igual)

  // 🚨 Manejo de la Carga Inicial y Error de ID
  if (!isMounted) {
    // Primera carga, antes de que el cliente tome el control y pueda leer searchParams
    return (
        <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
            <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin" /><p className="mt-4 text-slate-500">Preparando la página...</p></div>
        </main>
    );
  }

  if (!id_invernadero) {
    // Si ya está montado, pero el ID sigue siendo nulo (ej. URL mal formada)
    return (
      <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-800">ID de Invernadero no Encontrado</h1>
          <p className="text-slate-500">La URL está incompleta. Regresa a la página de invernaderos.</p>
          <Link href="/home/admin/invernaderos" className="mt-4 inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold">
            <ArrowLeft className="w-4 h-4"/> Volver a Invernaderos
          </Link>
        </div>
      </main>
    );
  }


    function abrirModal(): void {
        throw new Error("Function not implemented.");
    }

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <Link href="/home/admin/invernaderos" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4"/> Volver a Invernaderos
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Zonas del Invernadero #{id_invernadero}</h1>
          <p className="text-lg text-slate-500 mt-1">
            {zonas.length} Zonas Totales | {zonas.filter(z => z.estado === 'activo').length} Zonas Activas
          </p>
        </div>
        <button onClick={() => abrirModal()} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Nueva Zona</span>
        </button>
      </div>

      {cargando ? (
        <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin" /><p className="mt-4 text-slate-500">Cargando zonas...</p></div>
      ) : (
        // ... (resto del código de renderizado de zonas - Se mantiene igual)
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {/* ... contenido de zonas */}
        </div>
      )}

      {/* ... (Modales - Se mantienen igual) */}
    </main>
  );
}