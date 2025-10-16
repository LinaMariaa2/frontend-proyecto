"use client";

import React, { useEffect, useState, useRef, JSX } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; 
// 🚨 CAMBIA ESTA RUTA POR LA RUTA REAL A TU ARCHIVO app.ts (o donde tengas tu cliente 'api')
import api from "@/app/services/api"; 
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import io from "socket.io-client";

import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Check,
  CircleDot,
  Wrench,
  ArrowLeft,
  Droplets,
  Sun,
  Sprout,
  Info
} from "lucide-react";

// 🚨 URL del Backend Desplegado para Socket.io
const DEPLOYED_BACKEND_URL = 'https://backendhortitech.onrender.com'; 

// --- Interfaces ---
interface Zona {
  id_zona: number;
  nombre: string;
  descripciones_add: string;
  estado: "activo" | "inactivo" | "mantenimiento";
  id_cultivo?: string | null;
}

interface Cultivo {
  id_cultivo: number;
  nombre_cultivo: string;
}

interface HumedadLectura {
  actual: number;
  min: number;
  max: number;
  timestamp: string;
}

const formInicial = { nombre: "", descripciones_add: "", id_cultivo: "" };

// --- Modales ---
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

// --- Gráfica ---
const ZonaChart = ({ lecturas }: { lecturas: HumedadLectura[] }) => {
  if (!lecturas || lecturas.length === 0) return <p className="text-sm text-slate-400">No hay datos disponibles</p>;

  const data = lecturas.map(l => ({
    name: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    Actual: l.actual,
    Min: l.min,
    Max: l.max,
  }));

  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold text-slate-500 mb-2">Humedad Reciente: {lecturas[lecturas.length - 1]?.actual ?? 0} % </h4>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '13px' }}/>
          <Legend wrapperStyle={{ fontSize: "13px" }}/>
          <Line type="monotone" dataKey="Max" stroke="#a7f3d0" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Min" stroke="#d1fae5" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Actual" stroke="#14b8a6" strokeWidth={3} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Página Cliente: ZonasContent ---
export function ZonasContent() {
  const searchParams = useSearchParams();
  const id_invernadero = searchParams.get("id_invernadero"); 

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

  useEffect(() => {
    const fetchData = async () => {
      if (!id_invernadero) return;
      setCargando(true);
      try {
        const [zonasRes, cultivosRes] = await Promise.all([
          // 💡 CORRECCIÓN: Usar 'api' y ruta relativa.
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
  }, [id_invernadero]);

  // --- Socket.io ---
  useEffect(() => {
    // 💡 CORRECCIÓN: Usar la URL desplegada (sin /api)
    const socket = io(DEPLOYED_BACKEND_URL); 
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
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const abrirModal = (zona: Zona | null = null) => {
    if (zona) {
      setEditando(zona);
      setForm({
        nombre: zona.nombre,
        descripciones_add: zona.descripciones_add,
        id_cultivo: zona.id_cultivo != null ? String(zona.id_cultivo) : "",
      });
    } else {
      setEditando(null);
      setForm(formInicial);
    }
    setModalOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.nombre.trim() || !form.descripciones_add.trim()) {
      setModalMessage({ show: true, success: false, title: "Campos Incompletos", message: "El nombre y la descripción son obligatorios." });
      return;
    }
    setGuardando(true);

    const payload = {
      nombre: form.nombre.trim(),
      descripciones_add: form.descripciones_add.trim(),
      id_cultivo: form.id_cultivo ? Number(form.id_cultivo) : null,
      id_invernadero: Number(id_invernadero),
      estado: editando ? editando.estado : "activo",
    };

    try {
      let res;
      if (editando) {
        // 💡 CORRECCIÓN: Usar 'api' y ruta relativa.
        res = await api.put(`/zona/${editando.id_zona}`, payload);
        const updatedZona = res.data?.zona ?? res.data;
        // La API puede devolver id_cultivo como null, lo manejamos.
        const idCultivoFinal = updatedZona?.id_cultivo === undefined ? payload.id_cultivo : updatedZona.id_cultivo;
        setZonas(prev => prev.map(z => z.id_zona === editando.id_zona ? { ...z, ...updatedZona, id_cultivo: idCultivoFinal } : z));
      } else {
        // 💡 CORRECCIÓN: Usar 'api' y ruta relativa.
        res = await api.post("/zona", payload);
        const newZona = res.data?.zona ?? res.data;
        if (newZona && newZona.id_cultivo === undefined) newZona.id_cultivo = payload.id_cultivo ?? null;
        setZonas(prev => [...prev, newZona]);
      }

      setModalOpen(false);
      setModalMessage({ show: true, success: true, title: "Operación Exitosa", message: `La zona "${payload.nombre}" se ha guardado correctamente.`});
    } catch (error: any) {
      console.error("Error guardando zona:", error);
      setModalMessage({ show: true, success: false, title: "Error al Guardar", message: error.response?.data?.error || "Ocurrió un error inesperado."});
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = (zona: Zona, nuevoEstado: string) => {
    setModalConfirm({
      show: true,
      title: `Cambiar Estado`,
      message: `¿Seguro que quieres cambiar el estado de la zona <strong>${zona.nombre}</strong> a <strong>${nuevoEstado}</strong>?`,
      confirmText: 'Confirmar',
      variant: 'default',
      onConfirm: async () => {
        try {
          // Mapeo simple de estado a ruta de API
          const ruta = {"activo": "activar", "inactivo": "inactivar", "mantenimiento": "mantenimiento"}[nuevoEstado];
          // 💡 CORRECCIÓN: Usar 'api' y ruta relativa.
          await api.patch(`/zona/${ruta}/${zona.id_zona}`);
          setZonas(zonas.map(z => z.id_zona === zona.id_zona ? {...z, estado: nuevoEstado as any} : z));
          setModalMessage({ show: true, success: true, title: "Estado Actualizado", message: `El estado de la zona ha sido actualizado a ${nuevoEstado}.` });
        } catch (error: any) {
          setModalMessage({ show: true, success: false, title: "Error", message: error.response?.data?.error || "No se pudo cambiar el estado." });
        } finally {
          setModalConfirm({ ...modalConfirm, show: false });
          setMenuOpenId(null);
        }
      },
      onCancel: () => setModalConfirm({ ...modalConfirm, show: false })
    });
  };

  const eliminarZona = (zona: Zona) => {
    if (zona.estado !== 'inactivo') {
      setModalMessage({ show: true, success: false, title: "Acción no permitida", message: `Solo se pueden eliminar zonas con estado "Inactivo". El estado actual es "${zona.estado}".` });
      setMenuOpenId(null);
      return;
    }
    setModalConfirm({
      show: true,
      title: "Eliminar Zona",
      message: `Esta acción es permanente y no se puede deshacer. ¿Seguro que quieres eliminar la zona <strong>${zona.nombre}</strong>?`,
      confirmText: "Eliminar",
      variant: 'danger',
      onConfirm: async () => {
        try {
          // 💡 CORRECCIÓN: Usar 'api' y ruta relativa.
          await api.delete(`/zona/${zona.id_zona}`);
          setZonas(zonas.filter(z => z.id_zona !== zona.id_zona));
          setModalMessage({ show: true, success: true, title: "Zona Eliminada", message: "La zona ha sido eliminada correctamente." });
        } catch (error: any) {
          setModalMessage({ show: true, success: false, title: "Error al Eliminar", message: error.response?.data?.error || "Ocurrió un error." });
        } finally {
          setModalConfirm({ ...modalConfirm, show: false });
          setMenuOpenId(null);
        }
      },
      onCancel: () => setModalConfirm({ ...modalConfirm, show: false })
    });
  };

  const StatusBadge = ({ estado }: { estado: string }) => {
    const config: Record<string, { text: string, color: string, icon: JSX.Element }> = {
      activo: { text: "Activo", color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-3 h-3" /> },
      inactivo: { text: "Inactivo", color: "bg-slate-100 text-slate-600", icon: <XCircle className="w-3 h-3" /> },
      mantenimiento: { text: "Mantenimiento", color: "bg-amber-100 text-amber-800", icon: <Wrench className="w-3 h-3" /> },
    };
    const current = config[estado] || config.inactivo;
    return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${current.color}`}>{current.icon}{current.text}</span>;
  };

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
          {zonas.map((zona) => (
            <div key={zona.id_zona} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{zona.nombre}</h2>
                    <div ref={menuOpenId === zona.id_zona ? menuRef : null} className="relative">
                        <button onClick={() => setMenuOpenId(prev => prev === zona.id_zona ? null : zona.id_zona)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><MoreVertical className="w-5 h-5" /></button>
                        {menuOpenId === zona.id_zona && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-lg z-10 overflow-hidden">
                                <button onClick={() => abrirModal(zona)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Pencil className="w-4 h-4"/> Editar</button>
                                <button onClick={() => cambiarEstado(zona, "activo")} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Activar</button>
                                <button onClick={() => cambiarEstado(zona, "inactivo")} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><CircleDot className="w-4 h-4 text-slate-500"/> Inactivar</button>
                                <button onClick={() => cambiarEstado(zona, "mantenimiento")} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Wrench className="w-4 h-4 text-amber-500"/> Mantenimiento</button>
                                <button onClick={() => eliminarZona(zona)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Eliminar</button>
                            </div>
                        )}
                    </div>
                 </div>
                 <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{zona.descripciones_add}</p>
                 <div className="text-sm space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-600"><Sprout className="w-4 h-4"/><span>Cultivo: <span className="font-semibold">{cultivosDisponibles.find(c => c.id_cultivo === Number(zona.id_cultivo))?.nombre_cultivo || 'No asignado'}</span></span></div>
                    <div className="flex items-center gap-2"><StatusBadge estado={zona.estado} /></div>
                 </div>
                 <ZonaChart lecturas={lecturas[zona.id_zona] || []} />
              </div>
              <div className="mt-auto border-t border-slate-200 bg-slate-50 p-4 grid grid-cols-2 gap-3">
                 <Link 
                    href={`/home/admin/invernaderos/zonas/programacion-riego?id=${zona.id_zona}`} 
                    className="text-center font-semibold bg-blue-100 text-blue-800 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                 >
                    <Droplets className="w-4 h-4"/>Riego
                 </Link>
                 <Link 
                    href={`/home/admin/invernaderos/zonas/programacion-iluminacion?id=${zona.id_zona}`} 
                    className="text-center font-semibold bg-amber-100 text-amber-800 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-amber-200 transition-colors"
                 >
                    <Sun className="w-4 h-4"/>Iluminación
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">{editando ? "Editar" : "Nueva"} Zona</h2>
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <input placeholder="Nombre de la zona" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <textarea placeholder="Descripción adicional" value={form.descripciones_add} onChange={(e) => setForm({ ...form, descripciones_add: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3}/>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Asignar Cultivo (Opcional)</label>
                  <select value={form.id_cultivo} onChange={(e) => setForm({ ...form, id_cultivo: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option value="">-- Sin cultivo asignado --</option>
                    {cultivosDisponibles.map((cultivo) => (
                        <option key={cultivo.id_cultivo} value={cultivo.id_cultivo}>{cultivo.nombre_cultivo}</option>
                    ))}
                  </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
              <button onClick={handleFormSubmit} disabled={guardando} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:bg-teal-400">
                {guardando ? <><Loader2 className="w-5 h-5 animate-spin"/> Guardando...</> : editando ? "Guardar Cambios" : "Crear Zona"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfirm.show && <ConfirmModal title={modalConfirm.title} message={modalConfirm.message} onConfirm={modalConfirm.onConfirm} onCancel={() => setModalConfirm({ ...modalConfirm, show: false })} confirmText={modalConfirm.confirmText} variant={modalConfirm.variant}/>}
      {modalMessage.show && <MessageModal title={modalMessage.title} message={modalMessage.message} success={modalMessage.success} onCerrar={() => setModalMessage({ ...modalMessage, show: false })} />}
    </main>
  );
}