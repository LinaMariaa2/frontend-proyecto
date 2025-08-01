"use client";

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

// --- Componente Principal ---
export default function ProgramacionRiego() {
  const searchParams = useSearchParams();
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
  const [modalOpen, setModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  const [modalConfirm, setModalConfirm] = useState<{ show: boolean; onConfirm: () => void; title: string; message: string; confirmText: string, variant: string }>({ show: false, onConfirm: () => {}, title: '', message: '', confirmText: 'Confirmar', variant: 'default' });
  const [modalMessage, setModalMessage] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });

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
          <Link href={`/home/operario/invernaderos/zonas?id_invernadero=${1}`} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2">
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
                </button>
            </div>
          </div>
        ))}
         {programaciones.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed">
                <Droplets className="w-12 h-12 mx-auto text-slate-300"/>
                <h3 className="text-xl font-semibold text-slate-700 mt-4">No hay programaciones</h3>
                <p className="text-slate-500 mt-1">Crea una nueva programación de riego para esta zona.</p>
            </div>
        )}
      </div>

      {modalOpen && (
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
            </div>
          </div>
        </div>
      )}
      
      {modalConfirm.show && <ConfirmModal title={modalConfirm.title} message={modalConfirm.message} onConfirm={modalConfirm.onConfirm} onCancel={() => setModalConfirm({ ...modalConfirm, show: false })} confirmText={modalConfirm.confirmText} variant={modalConfirm.variant}/>}
      {modalMessage.show && <MessageModal title={modalMessage.title} message={modalMessage.message} success={modalMessage.success} onCerrar={() => setModalMessage({ ...modalMessage, show: false })} />}
    </main>
  );
}
