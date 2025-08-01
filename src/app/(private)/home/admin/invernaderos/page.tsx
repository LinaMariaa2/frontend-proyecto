"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
// CAMBIO: Iconografía consistente con lucide-react
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Building,
  Check,
  CircleDot,
  Wrench,
  ChevronRight
} from "lucide-react";

// --- Interfaces ---
interface Invernadero {
  id_invernadero: number;
  nombre: string;
  descripcion: string;
  responsable_id: number;
  estado: "activo" | "inactivo" | "mantenimiento";
  zonas_totales: number;
  zonas_activas: number;
  encargado?: Responsable;
}

interface Responsable {
  id_persona: number;
  nombre_usuario: string;
  rol: string;
  estado: string;
}

const formInicial = {
  id_invernadero: 0,
  nombre: "",
  descripcion: "",
  responsable_id: 0,
  estado: "activo" as "activo",
  zonas_totales: 0,
  zonas_activas: 0,
};

// --- Modales Personalizados ---
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = "Confirmar" }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
                <button onClick={onConfirm} className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${confirmText === 'Eliminar' ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}`}>{confirmText}</button>
            </div>
        </div>
    </div>
);

const MessageModal = ({ title, message, onCerrar, success = true }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {success ? <CheckCircle2 className="w-16 h-16 mx-auto text-teal-500 mb-4" /> : <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />}
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <button onClick={onCerrar} className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Entendido</button>
        </div>
    </div>
);

export default function InvernaderosPage() {
  const [invernaderos, setInvernaderos] = useState<Invernadero[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [busquedaResponsable, setBusquedaResponsable] = useState("");
  const [responsableSeleccionado, setResponsableSeleccionado] = useState<Responsable | null>(null);
  const [form, setForm] = useState(formInicial);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editarModo, setEditarModo] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [modalConfirm, setModalConfirm] = useState<{ show: boolean; onConfirm: () => void; title: string; message: string; confirmText: string }>({ show: false, onConfirm: () => {}, title: '', message: '', confirmText: 'Confirmar' });
  const [modalMessage, setModalMessage] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });

  const obtenerInvernaderos = async () => {
    setCargando(true);
    try {
      const response = await axios.get("http://localhost:4000/api/invernadero");
      setInvernaderos(response.data);
    } catch (error) {
      console.error("Error al obtener invernaderos:", error);
      setModalMessage({ show: true, title: "Error de Carga", message: "No se pudieron obtener los datos de los invernaderos.", success: false });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerInvernaderos();
  }, []);

  useEffect(() => {
    const obtenerResponsables = async () => {
      if (!busquedaResponsable.trim()) {
        setResponsables([]);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:4000/api/persona?filtro=${encodeURIComponent(busquedaResponsable)}`);
        setResponsables(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error al obtener responsables:", error);
      }
    };
    const debounce = setTimeout(obtenerResponsables, 300);
    return () => clearTimeout(debounce);
  }, [busquedaResponsable]);

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  const abrirModal = (inv: Invernadero | null = null) => {
    if (inv) {
        setEditarModo(inv.id_invernadero);
        setForm({ ...inv, responsable_id: inv.responsable_id || 0 });
        if(inv.encargado) setResponsableSeleccionado(inv.encargado);
    } else {
        setEditarModo(null);
        setForm(formInicial);
        setResponsableSeleccionado(null);
    }
    setModalOpen(true);
  };
  
  const cerrarModal = () => {
    setModalOpen(false);
    setBusquedaResponsable("");
    setResponsables([]);
  }

  const handleFormSubmit = async () => {
    if (!form.nombre.trim() || !form.descripcion.trim() || !form.responsable_id) {
        setModalMessage({ show: true, title: "Campos Incompletos", message: "Por favor, completa el nombre, la descripción y asigna un responsable.", success: false });
        return;
    }
    setGuardando(true);
    try {
        const payload = {
            nombre: form.nombre,
            descripcion: form.descripcion,
            responsable_id: form.responsable_id,
        };
        if (editarModo) {
            await axios.put(`http://localhost:4000/api/invernadero/${editarModo}`, payload);
        } else {
            await axios.post("http://localhost:4000/api/invernadero", {...payload, estado: 'activo'});
        }
        await obtenerInvernaderos();
        cerrarModal();
        setModalMessage({ show: true, title: "Éxito", message: `El invernadero "${payload.nombre}" se ha guardado correctamente.`, success: true });
    } catch (error: any) {
        const mensaje = error.response?.data?.error || `Error al ${editarModo ? 'actualizar' : 'crear'} el invernadero.`;
        setModalMessage({ show: true, title: "Error", message: mensaje, success: false });
    } finally {
        setGuardando(false);
    }
  };

  const cambiarEstado = (id: number, nuevoEstado: string) => {
    const onConfirm = async () => {
        try {
            const ruta = {"activo": "activar", "inactivo": "inactivar", "mantenimiento": "mantenimiento"}[nuevoEstado];
            await axios.patch(`http://localhost:4000/api/invernadero/${ruta}/${id}`);
            await obtenerInvernaderos();
            setModalMessage({ show: true, title: "Estado Actualizado", message: "El estado del invernadero ha sido actualizado.", success: true });
        } catch (error: any) {
            setModalMessage({ show: true, title: "Error", message: error.response?.data?.error || "No se pudo cambiar el estado.", success: false });
        } finally {
            setModalConfirm({ ...modalConfirm, show: false });
            setMenuOpenId(null);
        }
    };
    setModalConfirm({
        show: true,
        title: `Cambiar Estado a ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}`,
        message: `¿Estás seguro de que quieres cambiar el estado de este invernadero?`,
        confirmText: "Confirmar",
        onConfirm
    });
  };

  const eliminarInvernadero = (id: number) => {
    setModalConfirm({
        show: true,
        title: "Eliminar Invernadero",
        message: "Esta acción es permanente y no se puede deshacer. ¿Continuar?",
        confirmText: "Eliminar",
        onConfirm: async () => {
            try {
                await axios.delete(`http://localhost:4000/api/invernadero/${id}`);
                await obtenerInvernaderos();
                setModalMessage({ show: true, title: "Eliminado", message: "El invernadero ha sido eliminado.", success: true });
            } catch (error: any) {
                setModalMessage({ show: true, title: "Error", message: error.response?.data?.error || "No se pudo eliminar el invernadero.", success: false });
            } finally {
                setModalConfirm({ ...modalConfirm, show: false });
                setMenuOpenId(null);
            }
        }
    });
  };

  const StatusBadge = ({ estado }) => {
    const config = {
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
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Gestión de Invernaderos</h1>
          <p className="text-lg text-slate-500 mt-1">Crea, edita y administra tus invernaderos.</p>
        </div>
        <button onClick={() => abrirModal()} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Nuevo Invernadero</span>
        </button>
      </div>

      {cargando ? (
        <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin" /><p className="mt-4 text-slate-500">Cargando invernaderos...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invernaderos.map((inv) => (
            <div key={inv.id_invernadero} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group">
              <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{inv.nombre}</h2>
                    <div ref={menuOpenId === inv.id_invernadero ? menuRef : null} className="relative">
                        <button onClick={() => setMenuOpenId(prev => prev === inv.id_invernadero ? null : inv.id_invernadero)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><MoreVertical className="w-5 h-5" /></button>
                        {menuOpenId === inv.id_invernadero && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-lg z-10 overflow-hidden">
                                <button onClick={() => abrirModal(inv)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Pencil className="w-4 h-4"/> Editar</button>
                                <button onClick={() => cambiarEstado(inv.id_invernadero, "activo")} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Activar</button>
                                <button onClick={() => cambiarEstado(inv.id_invernadero, "inactivo")} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><CircleDot className="w-4 h-4 text-slate-500"/> Inactivar</button>
                                <button onClick={() => cambiarEstado(inv.id_invernadero, "mantenimiento")} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Wrench className="w-4 h-4 text-amber-500"/> Mantenimiento</button>
                                <button onClick={() => eliminarInvernadero(inv.id_invernadero)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Eliminar</button>
                            </div>
                        )}
                    </div>
                 </div>
                 <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{inv.descripcion}</p>
                 <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2 text-slate-600"><User className="w-4 h-4"/><span>Responsable: <span className="font-semibold">{inv.encargado?.nombre_usuario || 'No asignado'}</span></span></div>
                    <div className="flex items-center gap-2 text-slate-600"><Building className="w-4 h-4"/><span>Zonas: <span className="font-semibold">{inv.zonas_activas || 0} de {inv.zonas_totales || 0} activas</span></span></div>
                    <div className="flex items-center gap-2"><StatusBadge estado={inv.estado} /></div>
                 </div>
              </div>
              <div className="mt-auto border-t border-slate-200 bg-slate-50 p-4">
                 <Link href={`/home/admin/invernaderos/zonas?id_invernadero=${inv.id_invernadero}`} className="font-semibold text-teal-600 flex items-center justify-between group-hover:text-teal-700">
                    <span>Gestionar Zonas</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
              <h2 className="text-2xl font-bold text-slate-800">{editarModo ? "Editar" : "Nuevo"} Invernadero</h2>
              <button onClick={cerrarModal} className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <input placeholder="Nombre del invernadero" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <textarea placeholder="Descripción breve" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3}/>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Responsable</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Buscar por nombre o correo..." value={busquedaResponsable} onChange={(e) => setBusquedaResponsable(e.target.value)} className="w-full border-slate-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                {busquedaResponsable && (
                  <ul className="border border-slate-200 mt-1 rounded-lg shadow-sm max-h-40 overflow-y-auto bg-white z-10 relative">
                    {responsables.length > 0 ? (
                      responsables.map((r) => (
                        <li key={r.id_persona} className="px-4 py-2 hover:bg-teal-50 cursor-pointer" onClick={() => { setForm({ ...form, responsable_id: r.id_persona }); setResponsableSeleccionado(r); setBusquedaResponsable(""); }}>
                          {r.nombre_usuario} <span className="text-xs text-slate-500">({r.rol})</span>
                        </li>
                      ))
                    ) : ( <li className="px-4 py-2 text-slate-500">No se encontraron responsables.</li> )}
                  </ul>
                )}
                {responsableSeleccionado && !busquedaResponsable && (
                    <div className="mt-2 bg-teal-50 text-teal-800 p-3 rounded-lg flex justify-between items-center">
                        <p className="text-sm font-semibold">Seleccionado: {responsableSeleccionado.nombre_usuario}</p>
                        <button onClick={() => setResponsableSeleccionado(null)} className="text-teal-600 hover:text-teal-800"><X className="w-4 h-4"/></button>
                    </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={cerrarModal} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
              <button onClick={handleFormSubmit} disabled={guardando} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:bg-teal-400">
                {guardando ? <><Loader2 className="w-5 h-5 animate-spin"/> Guardando...</> : editarModo ? "Guardar Cambios" : "Crear Invernadero"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfirm.show && <ConfirmModal title={modalConfirm.title} message={modalConfirm.message} onConfirm={modalConfirm.onConfirm} onCancel={() => setModalConfirm({ ...modalConfirm, show: false })} confirmText={modalConfirm.confirmText} />}
      {modalMessage.show && <MessageModal title={modalMessage.title} message={modalMessage.message} success={modalMessage.success} onCerrar={() => setModalMessage({ ...modalMessage, show: false })} />}
    </main>
  );
}
