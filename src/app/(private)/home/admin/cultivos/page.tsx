"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
// Iconos
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Thermometer,
  Droplets,
  CalendarDays,
  Leaf,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  CircleDot,
  Check
} from "lucide-react";

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
  imagenes: string | null;
  estado: "activo" | "finalizado";
  cantidad_cosechada: number | null;
  cantidad_disponible: number | null;
  cantidad_reservada: number | null;
  unidad_medida?: "kilogramos" | "unidades"; 

}

// --- Modales Personalizados ---
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = "Confirmar" }: any) => (
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


export default function CultivosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalConfirm, setModalConfirm] = useState<{ show: boolean; onConfirm: () => void; title: string; message: string; confirmText: string }>({ show: false, onConfirm: () => {}, title: '', message: '', confirmText: '' });
  const [modalMessage, setModalMessage] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });
  const [modalProduccion, setModalProduccion] = useState(false);
  const [cultivoSeleccionado, setCultivoSeleccionado] = useState<number | null>(null);

  const [form, setForm] = useState({
    nombre_cultivo: "",
    descripcion: "",
    temp_min: "",
    temp_max: "",
    humedad_min: "",
    humedad_max: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [form2, setForm2]= useState({
    cantidad_cosechada: "",
    cantidad_disponible: "",
    cantidad_reservada: "",
    unidad_medida: "",
  });


  
  const cultivoEditando = editandoId ? cultivos.find(x => x.id_cultivo === editandoId) ?? null : null;

  const abrirModalProduccion = (id: number) => {
  setCultivoSeleccionado(id);
  const c = cultivos.find(x => x.id_cultivo === id);

  setForm2({
    cantidad_cosechada: c?.cantidad_cosechada != null ? String(c.cantidad_cosechada) : "",
    cantidad_disponible: c?.cantidad_disponible != null ? String(c.cantidad_disponible) : "",
    cantidad_reservada: c?.cantidad_reservada != null ? String(c.cantidad_reservada) : "",
    unidad_medida: c?.unidad_medida ?? "kilogramos", 
  });

  setModalProduccion(true);
};


  const guardarProduccion = async () => {
  if (cultivoSeleccionado == null) {
    setModalMessage({ show: true, title: "Error", message: "No se identificó el cultivo seleccionado.", success: false });
    return;
  }
  if (
    form2.cantidad_cosechada === "" ||
    form2.cantidad_disponible === "" ||
    form2.cantidad_reservada === ""
  ) {
    setModalMessage({ show: true, title: "Campos Incompletos", message: "Completa todos los campos de producción.", success: false });
    return;
  }
  if (!form2.unidad_medida) {
    setModalMessage({ show: true, title: "Falta la unidad", message: "Selecciona la unidad de medida (kilogramos o unidades).", success: false });
    return;
  }

  try {
    await axios.patch(`http://localhost:4000/api/cultivos/${cultivoSeleccionado}`, {
      cantidad_cosechada: Number(form2.cantidad_cosechada),
      cantidad_disponible: Number(form2.cantidad_disponible),
      cantidad_reservada: Number(form2.cantidad_reservada),
      unidad_medida: form2.unidad_medida,
    });

    // refrescar lista
    const res = await axios.get("http://localhost:4000/api/cultivos");
    setCultivos(res.data);
    setModalProduccion(false);
    setModalMessage({ show: true, title: "Éxito", message: "Producción registrada correctamente.", success: true });
  } catch (error) {
    console.error(error);
    setModalMessage({ show: true, title: "Error", message: "No se pudo guardar la producción.", success: false });
  }
};


  // --- Efectos y Lógica de Datos ---
  useEffect(() => {
    const ListarCultivos = async () => {
        setCargando(true);
        try {
            const res = await axios.get("http://localhost:4000/api/cultivos");
            setCultivos(res.data);
        } catch (error) {
            console.error("Error al cargar cultivos", error);
            setModalMessage({ show: true, title: "Error de Carga", message: "No se pudieron cargar los datos de cultivos.", success: false });
        } finally {
            setCargando(false);
        }
    };
    ListarCultivos();
  }, []);

  useEffect(() => {
    const ClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-opciones-container')) {
            setMenuOpenId(null);
        }
    };
    document.addEventListener("mousedown", ClickOutside);
    return () => document.removeEventListener("mousedown", ClickOutside);
  }, []);

  // --- Funciones CRUD y de UI ---
  const resetForm = () => {
    setForm({ nombre_cultivo: "", descripcion: "", temp_min: "", temp_max: "", humedad_min: "", humedad_max: "", fecha_inicio: "", fecha_fin: "" });
    setImagenFile(null);
    setEditandoId(null);
  };

  const abrirModal = (cultivo: Cultivo | null = null) => {
    if (cultivo) {
        setForm({
            nombre_cultivo: cultivo.nombre_cultivo,
            descripcion: cultivo.descripcion,
            temp_min: String(cultivo.temp_min),
            temp_max: String(cultivo.temp_max),
            humedad_min: String(cultivo.humedad_min),
            humedad_max: String(cultivo.humedad_max),
            fecha_inicio: cultivo.fecha_inicio.slice(0, 10),
            fecha_fin: cultivo.fecha_fin ? cultivo.fecha_fin.slice(0, 10) : "",
        });
        setEditandoId(cultivo.id_cultivo);
    } else {
        resetForm();
    }
    setModalOpen(true);
  };

  const agregarCultivo = async () => {
    if (!form.nombre_cultivo || !form.descripcion || !form.temp_min || !form.temp_max || !form.humedad_min || !form.humedad_max || !form.fecha_inicio) {
        setModalMessage({ show: true, title: "Campos Incompletos", message: "Por favor, completa todos los campos obligatorios.", success: false });
        return;
    }
    setGuardando(true);
    let urlImagen = "";

    if (imagenFile) {
        const formData = new FormData();
        formData.append("imagen", imagenFile);
        try {
            const res = await axios.post("http://localhost:4000/api/imagen/imagen-cultivo", formData);
            urlImagen = res.data.url;
        } catch (error) {
            setModalMessage({ show: true, title: "Error de Imagen", message: "No se pudo subir la imagen. Inténtalo de nuevo.", success: false });
            setGuardando(false);
            return;
        }
    }

    const payload: any = {
        ...form,
        temp_min: Number(form.temp_min), temp_max: Number(form.temp_max), humedad_min: Number(form.humedad_min), humedad_max: Number(form.humedad_max),
        fecha_fin: form.fecha_fin || null, estado: "activo"
    };
    if (urlImagen) payload.imagenes = urlImagen;

    try {
        if (editandoId) {
            await axios.put(`http://localhost:4000/api/cultivos/${editandoId}`, payload);
        } else {
            await axios.post("http://localhost:4000/api/cultivos", { ...payload, imagenes: urlImagen });
        }
        const res = await axios.get("http://localhost:4000/api/cultivos");
        setCultivos(res.data);
        setModalOpen(false);
        resetForm();
        setModalMessage({ show: true, title: "Éxito", message: `El cultivo "${payload.nombre_cultivo}" ha sido guardado correctamente.`, success: true });
    } catch (error) {
        console.error(error);
        setModalMessage({ show: true, title: "Error al Guardar", message: "No se pudo guardar el cultivo. Revisa los datos e inténtalo de nuevo.", success: false });
    } finally {
        setGuardando(false);
    }
  };

  const eliminarCultivo = (id: number) => {
    setModalConfirm({
        show: true,
        title: "Eliminar Cultivo",
        message: "¿Estás seguro de que quieres eliminar este cultivo de forma permanente? Esta acción no se puede deshacer.",
        confirmText: "Eliminar",
        onConfirm: async () => {
            try {
                await axios.delete(`http://localhost:4000/api/cultivos/${id}`);
                setCultivos(prev => prev.filter(c => c.id_cultivo !== id));
                setModalMessage({ show: true, title: "Eliminado", message: "El cultivo ha sido eliminado.", success: true });
            } catch {
                setModalMessage({ show: true, title: "Error", message: "No se pudo eliminar el cultivo.", success: false });
            } finally {
                setModalConfirm({ ...modalConfirm, show: false });
                setMenuOpenId(null);
            }
        }
    });
  };

  const cambiarEstado = (id: number, nuevo: string) => {
    const onConfirm = async () => {
        try {
            await axios.patch(`http://localhost:4000/api/cultivos/${id}/estado/${nuevo}`);
            setCultivos(prev => prev.map(c => c.id_cultivo === id ? { ...c, estado: nuevo as any } : c));
            setModalMessage({ show: true, title: "Estado Actualizado", message: `El estado del cultivo ha sido cambiado a "${nuevo}".`, success: true });
        } catch {
            setModalMessage({ show: true, title: "Error", message: "No se pudo cambiar el estado del cultivo.", success: false });
        } finally {
            setModalConfirm({ ...modalConfirm, show: false });
            setMenuOpenId(null);
        }
    };
    setModalConfirm({
        show: true,
        title: `¿${nuevo.charAt(0).toUpperCase() + nuevo.slice(1)} Cultivo?`,
        message: `¿Estás seguro de que quieres cambiar el estado de este cultivo a "${nuevo}"?`,
        confirmText: "Confirmar",
        onConfirm
    });
  };

  const cultivosFiltrados = cultivos.filter(c => c.nombre_cultivo.toLowerCase().includes(busqueda.toLowerCase()));
const unitSuffix = (u?: Cultivo["unidad_medida"]) => {
  if (u === "unidades") return "unid.";
  // default/fallback
  return "kg";
};

  // --- Renderizado del Componente ---
  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Gestión de Cultivos</h1>
              <p className="text-lg text-slate-500 mt-1">Administra los tipos de cultivos de tus invernaderos.</p>
          </div>
          <button onClick={() => abrirModal()} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Nuevo Cultivo</span>
          </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input placeholder="Buscar por nombre de cultivo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full border border-slate-300 p-2.5 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin"/><p className="mt-4 text-slate-500">Cargando cultivos...</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cultivosFiltrados.map((c) => (
            <div key={c.id_cultivo} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group">
              <div className="h-48 bg-slate-100 overflow-hidden">
                <img src={c.imagenes || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Sin+Imagen'} alt={c.nombre_cultivo} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{c.nombre_cultivo}</h2>
                    <div className="relative menu-opciones-container">
                        <button onClick={() => setMenuOpenId(prev => prev === c.id_cultivo ? null : c.id_cultivo)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><MoreVertical className="w-5 h-5" /></button>
                        {menuOpenId === c.id_cultivo && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-lg z-10 overflow-hidden">
                                <button onClick={() => abrirModal(c)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Pencil className="w-4 h-4"/> Editar</button>
                                <button onClick={() => cambiarEstado(c.id_cultivo, "activo")} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Activar</button>
                                <button onClick={() => cambiarEstado(c.id_cultivo, "finalizado")} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><CircleDot className="w-4 h-4 text-slate-500"/> Finalizar</button>
                                <button onClick={() => eliminarCultivo(c.id_cultivo)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Eliminar</button>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 flex-grow line-clamp-3">{c.descripcion}</p>
                <div className="text-sm space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 text-slate-600"><Thermometer className="w-4 h-4 text-red-500"/><span>{c.temp_min}°C - {c.temp_max}°C</span></div>
                  <div className="flex items-center gap-2 text-slate-600"><Droplets className="w-4 h-4 text-sky-500"/><span>{c.humedad_min}% - {c.humedad_max}%</span></div>
                  <div className="flex items-center gap-2 text-slate-600"><CalendarDays className="w-4 h-4 text-slate-500"/><span>{new Date(c.fecha_inicio).toLocaleDateString()} - {c.fecha_fin ? new Date(c.fecha_fin).toLocaleDateString() : "Presente"}</span></div>
                </div>

                {/* BLOQUE DE PRODUCCIÓN (OPCIÓN 1: mostrar siempre) */}
                <div className="text-sm space-y-2 border-t border-slate-200 pt-4 mt-4 text-slate-500 mb-4 flex-grow line-clamp-3">
                <div>
                  Cosechado: {c.cantidad_cosechada ?? "—"} {unitSuffix(c.unidad_medida)}
                </div>
                <div>
                  Disponible: {c.cantidad_disponible ?? "—"} {unitSuffix(c.unidad_medida)}
                </div>
                <div>
                  Reservado: {c.cantidad_reservada ?? "—"} {unitSuffix(c.unidad_medida)}
                </div>
              </div>


                <div className={`mt-4 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full self-start ${c.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{c.estado}</div>

                {/* Botones: Producción y demás */}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => abrirModalProduccion(c.id_cultivo)} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:bg-teal-400">
                    Gestion Producción
                  </button>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar Cultivo */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">{editandoId ? "Editar" : "Nuevo"} Cultivo</h2>
                <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <input placeholder="Nombre del cultivo (Ej: Rosa Roja)" value={form.nombre_cultivo} onChange={(e) => setForm({ ...form, nombre_cultivo: e.target.value })} className="w-full border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <textarea placeholder="Descripción detallada del cultivo..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={4}/>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Temp. Mínima (°C)" value={form.temp_min} onChange={(e) => setForm({ ...form, temp_min: e.target.value })} className="border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <input type="number" placeholder="Temp. Máxima (°C)" value={form.temp_max} onChange={(e) => setForm({ ...form, temp_max: e.target.value })} className="border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Humedad Mínima (%)" value={form.humedad_min} onChange={(e) => setForm({ ...form, humedad_min: e.target.value })} className="border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <input type="number" placeholder="Humedad Máxima (%)" value={form.humedad_max} onChange={(e) => setForm({ ...form, humedad_max: e.target.value })} className="border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input type="date" title="Fecha de Inicio" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="w-full text-slate-500 border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                 <input type="date" title="Fecha de Fin (opcional)" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} className="w-full text-slate-500 border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              {/* Si estamos editando, muestro producción actual (no usa 'c' fuera del map) */}
              {cultivoEditando && (
                <div className="text-sm space-y-1 border-t border-slate-200 pt-4 mt-4">
                  <div><strong>Cosechado:</strong> {cultivoEditando.cantidad_cosechada ?? '—'}</div>
                  <div><strong>Disponible:</strong> {cultivoEditando.cantidad_disponible ?? '—'}</div>
                  <div><strong>Reservado:</strong> {cultivoEditando.cantidad_reservada ?? '—'}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Imagen del Cultivo</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400"/>
                    <p className="mt-2 text-sm text-slate-600">
                        <span className="font-semibold text-teal-600">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files?.[0] || null)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                    {imagenFile && <p className="text-xs text-slate-500 mt-2">Archivo seleccionado: {imagenFile.name}</p>}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
              <button onClick={agregarCultivo} disabled={guardando} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:bg-teal-400">
                {guardando ? <><Loader2 className="w-5 h-5 animate-spin"/> Guardando...</> : editandoId ? "Guardar Cambios" : "Crear Cultivo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfirm.show && <ConfirmModal title={modalConfirm.title} message={modalConfirm.message} onConfirm={modalConfirm.onConfirm} onCancel={() => setModalConfirm({ ...modalConfirm, show: false })} confirmText={modalConfirm.confirmText} />}

      {modalMessage.show && <MessageModal title={modalMessage.title} message={modalMessage.message} success={modalMessage.success} onCerrar={() => setModalMessage({ ...modalMessage, show: false })} />}

        {/* Modal Producción */}
{modalProduccion && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <h2 className="text-xl font mb-4">Registrar Producción</h2>

      {/* Tipo de unidad */}
      <select
        value={form2.unidad_medida}
        onChange={(e) => setForm2({ ...form2, unidad_medida: e.target.value })}
        className="w-full mb-3 border p-2 rounded-lg"
      >
        <option value="">Seleccione unidad</option>
        <option value="kilogramos">Kilogramos</option>
        <option value="unidades">Unidades</option>
      </select>

      <input
        type="number"
        placeholder="Cantidad Cosechada"
        value={form2.cantidad_cosechada}
        onChange={(e) => setForm2({ ...form2, cantidad_cosechada: e.target.value })}
        className="w-full mb-3 border p-2 rounded-lg"
      />
      <input
        type="number"
        placeholder="Cantidad Disponible"
        value={form2.cantidad_disponible}
        onChange={(e) => setForm2({ ...form2, cantidad_disponible: e.target.value })}
        className="w-full mb-3 border p-2 rounded-lg"
      />
      <input
        type="number"
        placeholder="Cantidad Reservada"
        value={form2.cantidad_reservada}
        onChange={(e) => setForm2({ ...form2, cantidad_reservada: e.target.value })}
        className="w-full mb-4 border p-2 rounded-lg"
      />
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setModalProduccion(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancelar
        </button>
        <button
          onClick={guardarProduccion}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}



    </main>
  );
}
