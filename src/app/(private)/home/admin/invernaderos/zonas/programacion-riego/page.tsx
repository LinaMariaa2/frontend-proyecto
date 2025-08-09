"use client";

<<<<<<< HEAD
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import api from '../../../../../../services/api';

interface ProgramacionRiego {
  id_pg_riego: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  descripcion: string;
  tipo_riego: string;
  id_zona: number;
  estado?: boolean;
}
=======
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, X, Droplets, Trash2, Ban, Loader2, CheckCircle2, XCircle, AlertTriangle, Info, ArrowLeft, Wind, Waves, SprayCan } from "lucide-react";

// --- Interfaces ---
interface Programacion {
  id: number;
  activacion: string;
  desactivacion: string;
  descripcion: string;
  tipo_riego: string;
  zona_id: string | null;
}

const formInicial = { activacion: "", desactivacion: "", descripcion: "", tipo_riego: "" };
const tiposDeRiego = ["Goteo", "Aspersión", "Microaspersión", "Nebulización"];

// --- Modales Personalizados (Reutilizados) ---
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = "Confirmar", variant = "default" }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {variant === 'danger' ? <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" /> : <Info className="w-16 h-16 mx-auto text-blue-500 mb-4" />}
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 mb-8" dangerouslySetInnerHTML={{ __html: message }}></p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
                <button onClick={onConfirm} className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}`}>{confirmText}</button>
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
>>>>>>> 9a20aa639cfac192d9717eda0c1890f836afd7f2

// --- Componente Principal ---
export default function ProgramacionRiego() {
  const searchParams = useSearchParams();
<<<<<<< HEAD
  const zonaId = parseInt(searchParams.get("id") || "0");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [programaciones, setProgramaciones] = useState<ProgramacionRiego[]>([]);
  const [estadosDetenidos, setEstadosDetenidos] = useState<{ [key: number]: boolean }>({});

  const [form, setForm] = useState({
    fecha_inicio: "",
    fecha_finalizacion: "",
    descripcion: "",
    tipo_riego: "",
  });

=======
  const zonaId = searchParams.get("id");

  const [programaciones, setProgramaciones] = useState<Programacion[]>([
    {
      id: 1,
      activacion: "2025-06-22T06:00",
      desactivacion: "2025-06-22T07:00",
      descripcion: "Riego matutino para cultivo de tomates.",
      tipo_riego: "Goteo",
      zona_id: zonaId,
    },
  ]);

  const [form, setForm] = useState(formInicial);
>>>>>>> 9a20aa639cfac192d9717eda0c1890f836afd7f2
  const [modalOpen, setModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  const [modalConfirm, setModalConfirm] = useState<{ show: boolean; onConfirm: () => void; title: string; message: string; confirmText: string, variant: string }>({ show: false, onConfirm: () => {}, title: '', message: '', confirmText: 'Confirmar', variant: 'default' });
  const [modalMessage, setModalMessage] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });

<<<<<<< HEAD
  const obtenerProgramaciones = async () => {
    try {
      const response = await api.get('/programacionRiego');
      const todas = response.data;

      if (!Array.isArray(todas)) {
        console.error("La respuesta del backend no es un array:", todas);
        return;
      }

      const ahora = new Date();

      const filtradas = todas.filter((p: ProgramacionRiego) => {
        const fechaFinal = new Date(p.fecha_finalizacion);
        return p.id_zona === zonaId && fechaFinal > ahora;
      });

      setProgramaciones(filtradas);

      const nuevosEstados: { [key: number]: boolean } = {};
      filtradas.forEach(p => {
        nuevosEstados[p.id_pg_riego] = p.estado === false;
      });
      setEstadosDetenidos(nuevosEstados);
    } catch (error) {
      console.error('Error al obtener programaciones de riego:', error);
    }
  };

  useEffect(() => {
    if (zonaId) {
      obtenerProgramaciones();
    }
  }, [zonaId]);

  const convertirFechaParaInput = (fechaString: string) => {
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) {
      console.error("Fecha inválida:", fechaString);
      return "";
    }
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const editar = (p: ProgramacionRiego) => {
    setForm({
      fecha_inicio: convertirFechaParaInput(p.fecha_inicio),
      fecha_finalizacion: convertirFechaParaInput(p.fecha_finalizacion),
      descripcion: p.descripcion,
      tipo_riego: p.tipo_riego,
    });
    setEditandoId(p.id_pg_riego);
    setModalOpen(true);
  };

  const actualizarProgramacion = async () => {
    if (!form.fecha_inicio || !form.fecha_finalizacion || !form.descripcion || !form.tipo_riego) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    if (editandoId === null) return;

    try {
      const actualizada = {
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_finalizacion: new Date(form.fecha_finalizacion).toISOString(),
        descripcion: form.descripcion,
        tipo_riego: form.tipo_riego.toLowerCase(),
        id_zona: zonaId,
      };

      await api.put(`/programacionRiego/${editandoId}`, actualizada);
      await obtenerProgramaciones();
      setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "", tipo_riego: "" });
      setEditandoId(null);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar la programación:", error);
      alert("Hubo un error al actualizar la programación.");
    }
  };

  const agregar = async () => {
    if (!form.fecha_inicio || !form.fecha_finalizacion || !form.descripcion || !form.tipo_riego) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const nueva = {
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_finalizacion: new Date(form.fecha_finalizacion).toISOString(),
        descripcion: form.descripcion,
        tipo_riego: form.tipo_riego.toLowerCase(),
        id_zona: zonaId,
      };

      await api.post('/programacionRiego', nueva);
      await obtenerProgramaciones();
      setForm({ fecha_inicio: "", fecha_finalizacion: "", descripcion: "", tipo_riego: "" });
      setModalOpen(false);
    } catch (error) {
      console.error("Error al agregar la programación:", error);
      alert("Hubo un error al crear la programación.");
    }
  };

  const detenerRiego = async (id: number) => {
    const nuevoEstado = !estadosDetenidos[id];
    try {
      await api.patch(`/programacionRiego/${id}/estado`, {
        activo: !nuevoEstado,
      });

      setEstadosDetenidos(prev => ({
        ...prev,
        [id]: nuevoEstado,
      }));

      await obtenerProgramaciones();
    } catch (error) {
      console.error("Error al cambiar estado de programación:", error);
      alert("No se pudo cambiar el estado.");
    }
=======
  const handleAgregar = () => {
    if (!form.activacion || !form.desactivacion || !form.descripcion.trim() || !form.tipo_riego) {
      setModalMessage({ show: true, success: false, title: "Campos Incompletos", message: "Asegúrate de completar todos los campos del formulario."});
      return;
    }

    setGuardando(true);
    // Simular guardado
    setTimeout(() => {
      const nuevaProgramacion = { id: Date.now(), ...form, zona_id: zonaId };
      setProgramaciones([...programaciones, nuevaProgramacion]);
      setForm(formInicial);
      setModalOpen(false);
      setGuardando(false);
      setModalMessage({ show: true, success: true, title: "¡Éxito!", message: "La nueva programación de riego se ha creado correctamente."});
    }, 500);
  };

  const handleDetener = (id: number) => {
    setModalMessage({ show: true, success: true, title: "Acción Simulada", message: `La programación de riego #${id} se ha detenido.` });
  };
  
  const handleEliminar = (id: number) => {
    setModalConfirm({
      show: true,
      title: "Eliminar Programación",
      message: "¿Estás seguro de que quieres eliminar esta programación de riego? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      variant: "danger",
      onConfirm: () => {
        setProgramaciones(programaciones.filter((p) => p.id !== id));
        setModalConfirm({ ...modalConfirm, show: false });
        setModalMessage({ show: true, success: true, title: "Eliminado", message: "La programación ha sido eliminada."});
      },
    });
>>>>>>> 9a20aa639cfac192d9717eda0c1890f836afd7f2
  };
  
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }

  const RiegoIcon = ({ tipo }) => {
    const icons = {
        "Goteo": <Waves className="w-4 h-4" />,
        "Aspersión": <SprayCan className="w-4 h-4" />,
        "Microaspersión": <Wind className="w-4 h-4" />,
        "Nebulización": <Droplets className="w-4 h-4" />,
    };
    return icons[tipo] || <Droplets className="w-4 h-4" />;
  }

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <Link href={`/home/admin/invernaderos/zonas?id_invernadero=${1}`} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4"/> Volver a Zonas
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Droplets className="w-10 h-10 text-blue-500"/>
            <span>Programación de Riego</span>
          </h1>
          <p className="text-lg text-slate-500 mt-1">Zona #{zonaId}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Crear Programación</span>
        </button>
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {programaciones.map((p) => {
          const detenido = estadosDetenidos[p.id_pg_riego] ?? false;

          return (
            <div key={p.id_pg_riego} className="bg-white rounded-2xl shadow-green p-6 flex flex-col gap-4">
              <p className="text-lg font-semibold text-greenSecondary-900">
                Activación: <span className="font-normal text-darkGreen-700">{convertirFechaParaInput(p.fecha_inicio)}</span>
              </p>
              <p className="text-lg font-semibold text-greenSecondary-900">
                Desactivación: <span className="font-normal text-darkGreen-700">{convertirFechaParaInput(p.fecha_finalizacion)}</span>
              </p>
              <p className="text-gray-400">
                Descripción: <span className="text-gray-800">{p.descripcion}</span>
              </p>
              <p className="text-sm text-darkGreen-900 font-medium">
                Tipo: <span className="text-darkGreen-700">{p.tipo_riego}</span>
              </p>

              <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-gray-800 border-opacity-10">
                <button
                  onClick={() => detenerRiego(p.id_pg_riego)}
                  className={`${detenido ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600"} text-white font-bold py-2 px-4 rounded-full transition duration-200`}
                >
                  {detenido ? "Reanudar" : "Detener"}
                </button>
                <button
                  onClick={() => editar(p)}
                  className="bg-pink-500 hover:bg-pinkSecondary-900 text-white font-bold py-2 px-4 rounded-full transition duration-200"
                >
                  Editar
=======
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programaciones.filter((p) => p.zona_id === zonaId).map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-5 flex-grow">
              <span className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800 mb-3">
                <RiegoIcon tipo={p.tipo_riego} /> {p.tipo_riego}
              </span>
              <p className="text-sm text-slate-600 mb-3">{p.descripcion}</p>
              <div className="space-y-2 text-sm">
                  <p><strong className="font-semibold text-slate-800">Activación:</strong> {formatDateTime(p.activacion)}</p>
                  <p><strong className="font-semibold text-slate-800">Desactivación:</strong> {formatDateTime(p.desactivacion)}</p>
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 p-3 flex justify-end gap-2">
                <button onClick={() => handleDetener(p.id)} className="text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-md flex items-center gap-1">
                    <Ban className="w-4 h-4"/> Detener
                </button>
                <button onClick={() => handleEliminar(p.id)} className="text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-md flex items-center gap-1">
                    <Trash2 className="w-4 h-4"/> Eliminar
>>>>>>> 9a20aa639cfac192d9717eda0c1890f836afd7f2
                </button>
            </div>
<<<<<<< HEAD
          );
        })}
=======
          </div>
        ))}
         {programaciones.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed">
                <Droplets className="w-12 h-12 mx-auto text-slate-300"/>
                <h3 className="text-xl font-semibold text-slate-700 mt-4">No hay programaciones</h3>
                <p className="text-slate-500 mt-1">Crea una nueva programación de riego para esta zona.</p>
            </div>
        )}
>>>>>>> 9a20aa639cfac192d9717eda0c1890f836afd7f2
      </div>

      {modalOpen && (
<<<<<<< HEAD
        <div className="fixed inset-0 z-40 backdrop-blur-md bg-black/10 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-green p-8 w-full max-w-md">
            <h2 className="text-3xl font-bold text-darkGreen-900 mb-6 text-center">
              {editandoId ? 'Editar Programación' : 'Agregar Programación'}
            </h2>
            <h3>Fecha de inicio</h3>
            <input
              type="datetime-local"
              value={form.fecha_inicio}
              onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-800 border-opacity-20 rounded-md"
            />
            <h3>Fecha de finalización</h3>
            <input
              type="datetime-local"
              value={form.fecha_finalizacion}
              onChange={(e) => setForm({ ...form, fecha_finalizacion: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-800 border-opacity-20 rounded-md"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-800 border-opacity-20 rounded-md"
            />
            <select
              value={form.tipo_riego}
              onChange={(e) => setForm({ ...form, tipo_riego: e.target.value })}
              className="w-full p-3 mb-6 border border-gray-800 border-opacity-20 rounded-md"
            >
              <option value="">Selecciona el tipo de riego</option>
              <option value="Goteo">Goteo</option>
              <option value="Aspersión">Aspersión</option>
              <option value="Manual">Manual</option>
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-full"
              >
                Cancelar
              </button>
              {editandoId ? (
                <button
                  onClick={actualizarProgramacion}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full"
                >
                  Actualizar
                </button>
              ) : (
                <button
                  onClick={agregar}
                  className="bg-green-500 hover:bg-darkGreen-700 text-white font-bold py-2 px-5 rounded-full"
                >
                  Crear
                </button>
              )}
=======
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Nueva Programación de Riego</h2>
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha y Hora de Activación</label>
                <input type="datetime-local" value={form.activacion} onChange={(e) => setForm({ ...form, activacion: e.target.value })} className="w-full border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha y Hora de Desactivación</label>
                <input type="datetime-local" value={form.desactivacion} onChange={(e) => setForm({ ...form, desactivacion: e.target.value })} className="w-full border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
               <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Riego</label>
                 <select value={form.tipo_riego} onChange={(e) => setForm({ ...form, tipo_riego: e.target.value })} className="w-full border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option value="">Selecciona un tipo</option>
                    {tiposDeRiego.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                 </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                <textarea placeholder="Ej: Riego para tomates" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3}/>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
              <button onClick={handleAgregar} disabled={guardando} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:bg-teal-400">
                {guardando ? <><Loader2 className="w-5 h-5 animate-spin"/> Guardando...</> : "Crear Programación"}
              </button>
>>>>>>> 9a20aa639cfac192d9717eda0c1890f836afd7f2
            </div>
          </div>
        </div>
      )}
      
      {modalConfirm.show && <ConfirmModal title={modalConfirm.title} message={modalConfirm.message} onConfirm={modalConfirm.onConfirm} onCancel={() => setModalConfirm({ ...modalConfirm, show: false })} confirmText={modalConfirm.confirmText} variant={modalConfirm.variant}/>}
      {modalMessage.show && <MessageModal title={modalMessage.title} message={modalMessage.message} success={modalMessage.success} onCerrar={() => setModalMessage({ ...modalMessage, show: false })} />}
    </main>
  );
}
