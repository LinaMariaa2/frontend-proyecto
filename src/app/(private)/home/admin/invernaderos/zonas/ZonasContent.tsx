"use client";

import React, { useEffect, useState, useRef, JSX } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
    id?: number; // Añadimos id opcional para el formulario de creación
    nombre: string;
    descripciones_add: string;
    id_cultivo: string;
    estado: string;
}
interface Cultivo { id: string; nombre: string; } // Asegúrate de que Cultivo tenga id y nombre
interface HumedadLectura { actual: number; min: number; max: number; timestamp: string; }

// --- Modales (Se mantienen igual) ---
const formInicial = { nombre: "", descripciones_add: "", id_cultivo: "" };
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = "Confirmar", variant = "default" }: any) => (
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
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      {success ? <CheckCircle2 className="w-16 h-16 mx-auto text-teal-500 mb-4" /> : <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />}
      <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-500 mb-8">{message}</p>
      <button onClick={onCerrar} className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Entendido</button>
    </div>
  </div>
);
const ZonaChart = ({ lecturas }: { lecturas: HumedadLectura[] }) => { /* ... */ return <></> }; // Modificado para devolver JSX vacío si no hay cuerpo

// Función auxiliar para el badge de estado
const StatusBadge = ({ estado }: { estado: string }) => {
    const isActivo = estado === 'activo';
    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
            isActivo ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
        }`}>
            {isActivo ? <CircleDot className="w-3 h-3 mr-1 fill-teal-500 text-teal-500" /> : <XCircle className="w-3 h-3 mr-1 text-slate-400" />}
            {isActivo ? 'Activa' : 'Inactiva'}
        </span>
    );
};


export function ZonasContent()  {
  const searchParams = useSearchParams();
  const id_invernadero = searchParams.get("id_invernadero"); 
  const [isMounted, setIsMounted] = useState(false); 
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cultivosDisponibles, setCultivosDisponibles] = useState<Cultivo[]>([]);
  const [form, setForm] = useState<typeof formInicial>(formInicial);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Zona | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const [modalConfirm, setModalConfirm] = useState<any>({ show: false, onConfirm: () => {}, title: '', message: '', confirmText: 'Confirmar', variant: 'default' });
  const [modalMessage, setModalMessage] = useState<any>({ show: false, title: '', message: '', success: true });

  const [lecturas, setLecturas] = useState<{ [key: number]: HumedadLectura[] }>({});

  const menuRef = useRef<HTMLDivElement>(null);

    // 💡 NUEVA FUNCIÓN: Para recargar las zonas después de una acción (crear, editar, eliminar)
    const recargarZonas = async (invernaderoId: string) => {
        setCargando(true);
        try {
            // Verifica la URL de la API: `/zona/invernadero/${invernaderoId}`
            const zonasRes = await api.get(`/zona/invernadero/${invernaderoId}`); 
            const cultivosRes = await api.get("/cultivos");
            setZonas(zonasRes.data);
            setCultivosDisponibles(cultivosRes.data);
        } catch (error) {
            console.error("Error al recargar datos:", error);
            setModalMessage({ show: true, success: false, title: "Error de Carga", message: "No se pudieron obtener los datos de las zonas o cultivos. El backend podría estar inaccesible o la ruta es incorrecta." });
        } finally {
            setCargando(false);
        }
    };


  // 1. Efecto para manejar el montaje y configurar isMounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Efecto para cargar los datos (usa la nueva función)
  useEffect(() => {
    if (!isMounted || !id_invernadero) return; 
    
    recargarZonas(id_invernadero);
  }, [id_invernadero, isMounted]);


  // --- Socket.io (Se mantiene igual) ---
  useEffect(() => {
    if (!id_invernadero) return;
    const socket = io(DEPLOYED_BACKEND_URL); 
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
  }, [id_invernadero]);

    // 💡 CORRECCIÓN 1: Implementación de la función para abrir el modal
    function abrirModal(zona?: Zona): void {
        setEditando(zona || null);
        setForm(zona ? { 
            nombre: zona.nombre, 
            descripciones_add: zona.descripciones_add, 
            id_cultivo: zona.id_cultivo 
        } : formInicial);
        setModalOpen(true);
    }
    
    // --- NUEVAS FUNCIONES DE LÓGICA (Ejemplo de Implementación Mínima) ---

    // Función para manejar la creación/edición
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id_invernadero) return;
        setGuardando(true);
        const data = { ...form, id_invernadero };

        try {
            if (editando) {
                // Lógica de edición
                await api.put(`/zona/${editando.id}`, data);
                setModalMessage({ show: true, success: true, title: "Actualización Exitosa", message: `La zona '${form.nombre}' ha sido actualizada.` });
            } else {
                // Lógica de creación
                await api.post("/zona", data);
                setModalMessage({ show: true, success: true, title: "Creación Exitosa", message: `La zona '${form.nombre}' ha sido creada.` });
            }
            setModalOpen(false);
            recargarZonas(id_invernadero); // Recargar datos para ver el cambio
        } catch (error) {
            console.error("Error al guardar la zona:", error);
            setModalMessage({ show: true, success: false, title: "Error al Guardar", message: "Hubo un problema al intentar guardar la zona. Verifica la conexión con el backend." });
        } finally {
            setGuardando(false);
        }
    };

    // Función para manejar el cambio de estado (activar/desactivar)
    const cambiarEstado = (zona: Zona) => {
        const nuevoEstado = zona.estado === 'activo' ? 'inactivo' : 'activo';
        setModalConfirm({
            show: true,
            title: `Confirmar ${nuevoEstado === 'activo' ? 'Activación' : 'Desactivación'}`,
            message: `¿Estás seguro de que quieres ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} la zona **${zona.nombre}**?`,
            confirmText: `Sí, ${nuevoEstado === 'activo' ? 'Activar' : 'Desactivar'}`,
            variant: nuevoEstado === 'activo' ? 'default' : 'danger',
            onConfirm: async () => {
                setModalConfirm({ show: false, onConfirm: () => {}, title: '', message: '' });
                try {
                    // Endpoint para cambiar estado
                    await api.put(`/zona/estado/${zona.id}`, { estado: nuevoEstado });
                    setModalMessage({ show: true, success: true, title: "Estado Actualizado", message: `La zona '${zona.nombre}' ha sido ${nuevoEstado}.` });
                    if (id_invernadero) recargarZonas(id_invernadero);
                } catch (error) {
                    setModalMessage({ show: true, success: false, title: "Error", message: `No se pudo cambiar el estado de la zona ${zona.nombre}.` });
                }
            },
            onCancel: () => setModalConfirm({ show: false, onConfirm: () => {}, title: '', message: '' })
        });
    };

    // Función para manejar la eliminación
    const eliminarZona = (zona: Zona) => {
        setModalConfirm({
            show: true,
            title: "Confirmar Eliminación",
            message: `¿Estás seguro de que deseas **eliminar permanentemente** la zona **${zona.nombre}**? Esta acción no se puede deshacer.`,
            confirmText: "Eliminar Zona",
            variant: 'danger',
            onConfirm: async () => {
                setModalConfirm({ show: false, onConfirm: () => {}, title: '', message: '' });
                try {
                    await api.delete(`/zona/${zona.id}`);
                    setModalMessage({ show: true, success: true, title: "Zona Eliminada", message: `La zona '${zona.nombre}' ha sido eliminada correctamente.` });
                    if (id_invernadero) recargarZonas(id_invernadero);
                } catch (error) {
                    setModalMessage({ show: true, success: false, title: "Error", message: `No se pudo eliminar la zona ${zona.nombre}.` });
                }
            },
            onCancel: () => setModalConfirm({ show: false, onConfirm: () => {}, title: '', message: '' })
        });
    };


    // Manejo de cierre de menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

  if (!isMounted) { /* ... */ return }
  if (!id_invernadero) { /* ... */ return }

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {/* Contenido de las zonas (debes implementarlo con las variables 'zonas') */}
            {zonas.length === 0 ? (
                <div className="md:col-span-3 text-center py-10 bg-white rounded-xl shadow-lg">
                    <Sprout className="w-12 h-12 mx-auto text-teal-500 mb-4" />
                    <p className="text-lg font-semibold text-slate-800">No hay zonas configuradas.</p>
                    <p className="text-slate-500">Usa el botón "Nueva Zona" para empezar.</p>
                </div>
            ) : (
                zonas.map((zona) => (
                    <div key={zona.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-shadow hover:shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{zona.nombre}</h3>
                                <p className="text-sm text-slate-500 mt-1">{zona.descripciones_add}</p>
                            </div>
                            <div className="relative" ref={menuRef}>
                                <button onClick={() => setMenuOpenId(menuOpenId === zona.id ? null : zona.id!)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-500" />
                                </button>
                                {menuOpenId === zona.id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10 border border-slate-200">
                                        <button onClick={() => { abrirModal(zona); setMenuOpenId(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                            <Pencil className="w-4 h-4" /> Editar
                                        </button>
                                        <button onClick={() => { cambiarEstado(zona); setMenuOpenId(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                            <Wrench className="w-4 h-4" /> {zona.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                        </button>
                                        <button onClick={() => { eliminarZona(zona); setMenuOpenId(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="flex items-center gap-4 mb-3">
                                <StatusBadge estado={zona.estado} />
                                {/* Aquí iría el nombre del cultivo si lo tienes en la interfaz */}
                                <p className="text-sm text-slate-600">Cultivo: {cultivosDisponibles.find(c => c.id === zona.id_cultivo)?.nombre || 'N/A'}</p>
                            </div>
                            {/* Gráfica de Humedad (simulación si no tienes datos) */}
                            <h4 className="text-md font-semibold text-slate-700 mb-2 flex items-center gap-1"><Droplets className="w-4 h-4 text-sky-500" /> Humedad Reciente</h4>
                            <ZonaChart lecturas={lecturas[zona.id!] || []} />
                        </div>
                    </div>
                ))
            )}
        </div>
      )}
    
    {/* Modal de Creación/Edición */}
    {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">{editando ? `Editar Zona: ${editando.nombre}` : 'Crear Nueva Zona'}</h3>
                    <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <form onSubmit={handleFormSubmit}>
                    {/* Campos del Formulario */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Zona</label>
                        <input type="text" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción Adicional</label>
                        <textarea value={form.descripciones_add} onChange={(e) => setForm({...form, descripciones_add: e.target.value})} 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" rows={3} />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Cultivo Asignado</label>
                        <select value={form.id_cultivo} onChange={(e) => setForm({...form, id_cultivo: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" required>
                            <option value="">Seleccione un Cultivo</option>
                            {cultivosDisponibles.map(cultivo => (
                                <option key={cultivo.id} value={cultivo.id}>{cultivo.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
                        <button type="submit" disabled={guardando} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                            {editando ? (guardando ? 'Actualizando...' : 'Actualizar') : (guardando ? 'Creando...' : 'Crear Zona')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

      {/* Modales de Confirmación y Mensaje */}
      {modalConfirm.show && <ConfirmModal {...modalConfirm} />}
      {modalMessage.show && <MessageModal {...modalMessage} onCerrar={() => setModalMessage({ show: false, title: '', message: '', success: true })} />}
    </main>
  );
}