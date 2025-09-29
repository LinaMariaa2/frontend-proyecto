"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  BookMarked,
  X,
  ChevronDown,
  Loader2 
} from "lucide-react";

// --- Interfaces ---
interface Autor {
  id_persona: number;
  nombre_usuario: string;
  estado: string;
  rol: string;
}

interface Invernadero {
  id_invernadero: number;
  nombre: string;
}

interface Zona {
  id_zona: number;
  nombre: string;
}

interface Publicacion {
  id_publicacion: number | null;
  titulo: string;
  contenido: string;
  tipo_evento: string;
  importancia: "alta" | "media" | "baja";
  id_invernadero: number | string;
  id_zona: number | string;
  autor_id: number | string;
  timestamp_publicacion?: string;
  autor?: Autor;
  invernadero?: Invernadero;
  zona?: Zona;
}

// --- Componentes de Modales ---
const ConfirmModal = ({
  mensaje,
  onConfirmar,
  onCancelar,
}: {
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmación Requerida</h3>
      <p className="text-slate-500 mb-8">{mensaje}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancelar}
          className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

const MessageModal = ({ mensaje, onCerrar }: { mensaje: string; onCerrar: () => void }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      {mensaje.includes("90 minutos") ? (
        <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
      ) : (
        <CheckCircle2 className="w-16 h-16 mx-auto text-teal-500 mb-4" />
      )}
      <h3 className="text-xl font-bold text-slate-800 mb-4">
        {mensaje.includes("90 minutos") ? "Aviso" : "Operación Exitosa"}
      </h3>
      <p className="text-slate-500 mb-8">{mensaje}</p>
      <button
        onClick={onCerrar}
        className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
      >
        Entendido
      </button>
    </div>
  </div>
);

// --- Componente Principal de la Página de Bitácora ---
export default function BitacoraPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [form, setForm] = useState<Publicacion>({
    id_publicacion: null,
    titulo: "",
    contenido: "",
    tipo_evento: "",
    importancia: "media",
    id_invernadero: "",
    id_zona: "",
    autor_id: "",
  });
  const [autores, setAutores] = useState<Autor[]>([]);
  const [invernaderos, setInvernaderos] = useState<Invernadero[]>([]);
  const [zonasDisponibles, setZonasDisponibles] = useState<Zona[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [autoresFiltrados, setAutoresFiltrados] = useState<Autor[]>([]);
  const [modalMensaje, setModalMensaje] = useState("");
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState<() => void>(() => {});
  const tipoEventos = ["riego", "iluminacion", "cultivo", "alerta", "mantenimiento", "hardware", "general"];
  const [filtroActivo, setFiltroActivo] = useState("invernadero");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);
      try {
        const [bitacoraRes, personaRes, invernaderoRes] = await Promise.all([
          axios.get("http://localhost:4000/api/bitacora?archivadas=false"),
          axios.get("http://localhost:4000/api/persona"),
          axios.get("http://localhost:4000/api/invernadero")
        ]);
        setPublicaciones(bitacoraRes.data);
        setAutores(personaRes.data);
        setInvernaderos(invernaderoRes.data);
      } catch (error) {
        console.error("Error al cargar los datos iniciales:", error);
        setModalMensaje("No se pudieron cargar los datos. Revisa la consola y la conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (form.id_invernadero) {
      axios.get(`http://localhost:4000/api/zona/invernadero/${form.id_invernadero}`)
        .then((res) => setZonasDisponibles(res.data))
        .catch(error => {
            console.error("Error al cargar las zonas:", error);
            setZonasDisponibles([]);
        });
    } else {
      setZonasDisponibles([]);
    }
  }, [form.id_invernadero]);

  useEffect(() => {
    const filtrados = autores.filter((a) => a.estado === "activo" && ["admin", "operario"].includes(a.rol));
    setAutoresFiltrados(filtrados);
  }, [autores]);

  const abrirModal = (pub: Publicacion | null = null) => {
    if (pub) {
      const tiempoCreacion = new Date(pub.timestamp_publicacion || "");
      const ahora = new Date();
      const minutosPasados = (ahora.getTime() - tiempoCreacion.getTime()) / 1000 / 60;
      if (minutosPasados > 90) {
        setModalMensaje("No puedes editar publicaciones con más de 90 minutos de antigüedad.");
        return; // aviso rápido y no abre modal de edición
      }
      setForm(pub);
      setEditando(true);
    } else {
      setForm({ id_publicacion: null, titulo: "", contenido: "", tipo_evento: "", importancia: "media", id_invernadero: "", id_zona: "", autor_id: "" });
      setEditando(false);
    }
    setModalOpen(true);
  };

  const guardarPublicacion = async () => {
    setIsSaving(true);
    try {
      const url = `http://localhost:4000/api/bitacora${editando ? `/${form.id_publicacion}` : ""}`;
      const method = editando ? axios.put : axios.post;
      if (!form.titulo || !form.contenido || !form.tipo_evento || !form.id_invernadero || !form.id_zona || !form.autor_id) {
        setModalMensaje("Por favor completa todos los campos obligatorios.");
        setIsSaving(false);
        return;
      }
      await method(url, { ...form, id_invernadero: Number(form.id_invernadero), id_zona: Number(form.id_zona), autor_id: Number(form.autor_id) });
      const res = await axios.get("http://localhost:4000/api/bitacora?archivadas=false");
      setPublicaciones(res.data);
      setModalOpen(false);
      setEditando(false);
      setModalMensaje("¡Publicación guardada con éxito!");
    } catch (err) {
      console.error("Error al guardar", err);
      setModalMensaje("Error al guardar la publicación.");
    } finally {
        setIsSaving(false);
    }
  };

  const eliminarPublicacion = (id: number | null) => {
    if (!id) {
      setModalMensaje("ID no válido para eliminar.");
      return;
    }
    setAccionConfirmar(() => async () => {
      try {
        await axios.delete(`http://localhost:4000/api/bitacora/${id}`);
        const res = await axios.get("http://localhost:4000/api/bitacora?archivadas=false");
        setPublicaciones(res.data);
        setModalMensaje("Publicación eliminada correctamente.");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setModalMensaje("No puedes eliminar publicaciones de importancia ALTA.");
        } else {
          setModalMensaje("Error al eliminar la publicación.");
        }
      } finally {
        setModalConfirmar(false);
      }
    });
    setModalConfirmar(true);
  };
  
  const archivarPublicacion = async (id: number | null) => {
    if (!id) return;
    try {
      await axios.patch(`http://localhost:4000/api/bitacora/${id}/archivar`);
      setPublicaciones((prev) => prev.filter((p) => p.id_publicacion !== id));
      setModalMensaje("Publicación archivada.");
    } catch (err) {
      console.error("Error al archivar", err);
      setModalMensaje("No se pudo archivar la publicación.");
    }
  };

  const filteredPublicaciones = publicaciones.filter((pub) => {
      const valor = busqueda.toLowerCase();
      if (!valor) return true;
      if (filtroActivo === "invernadero") return pub.invernadero?.nombre?.toLowerCase().includes(valor) || String(pub.id_invernadero).toLowerCase().includes(valor);
      if (filtroActivo === "importancia") return pub.importancia?.toLowerCase().includes(valor);
      if (filtroActivo === "etiqueta") return pub.tipo_evento?.toLowerCase().includes(valor);
      return true;
  });
  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Bitácora</h1>
          <p className="text-lg text-slate-500 mt-1">Registro de eventos y actividades.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/home/admin/bitacora/archivadas">
            <button className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2">
              <Archive className="w-5 h-5"/>
              <span>Ver Archivadas</span>
            </button>
          </Link>
          <button
            onClick={() => abrirModal()}
            className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Bitacora</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={`Buscar por ${filtroActivo}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-slate-300 p-2.5 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="relative">
            <select
                value={filtroActivo}
                onChange={(e) => setFiltroActivo(e.target.value)}
                className="border border-slate-300 p-2.5 rounded-lg text-sm bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
                <option value="invernadero">Invernadero</option>
                <option value="importancia">Importancia</option>
                <option value="etiqueta">Tipo de evento</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
      
      {cargando ? (
        <div className="text-center py-16">
            <Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin"/>
            <p className="mt-4 text-slate-500">Cargando publicaciones...</p>
        </div>
      ) : filteredPublicaciones.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredPublicaciones.map((pub) => (
            <div
              key={pub.id_publicacion!}
              className={`bg-white shadow-sm rounded-lg p-4 flex gap-4 items-start border-l-4 transition-all hover:shadow-md ${
                pub.importancia === 'alta' ? 'border-red-500' :
                pub.importancia === 'media' ? 'border-amber-500' : 'border-sky-500'
              }`}
            >
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                   <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                     pub.importancia === 'alta' ? 'bg-red-100 text-red-700' :
                     pub.importancia === 'media' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                   }`}>
                      {pub.tipo_evento}
                   </span>
                   <span className="text-xs text-slate-500">{new Date(pub.timestamp_publicacion || '').toLocaleString('es-CO')}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{pub.titulo}</h3>
                <p className="text-sm text-slate-600 mt-1">{pub.contenido}</p>
                <div className="text-xs text-slate-500 mt-3 border-t border-slate-200 pt-2 flex items-center gap-4">
                    <span><strong>Autor:</strong> {pub.autor?.nombre_usuario || pub.autor_id}</span>
                    <span><strong>Invernadero:</strong> {pub.invernadero?.nombre || pub.id_invernadero}</span>
                    <span><strong>Zona:</strong> {pub.zona?.nombre || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => abrirModal(pub)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => archivarPublicacion(pub.id_publicacion)} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"><Archive className="w-4 h-4" /></button>
                  <button onClick={() => eliminarPublicacion(pub.id_publicacion)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <div className="flex flex-col items-center gap-2 text-slate-500">
                <BookMarked className="w-12 h-12"/>
                <p className="font-semibold text-lg">No hay publicaciones</p>
                <p>Crea una nueva entrada para empezar a registrar eventos.</p>
            </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"><X/></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{editando ? "Editar" : "Nueva"} Publicación</h2>
            <div className="space-y-4">
                <input type="text" placeholder="Título de la entrada" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <textarea placeholder="Describe el evento o actividad..." value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={4} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.tipo_evento} onChange={(e) => setForm({ ...form, tipo_evento: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Tipo de evento</option>
                        {tipoEventos.map((tipo) => <option key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>)}
                    </select>
                    <select value={form.importancia} onChange={(e) => setForm({ ...form, importancia: e.target.value as Publicacion['importancia'] })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="alta">Importancia: Alta</option>
                        <option value="media">Importancia: Media</option>
                        <option value="baja">Importancia: Baja</option>
                    </select>
                    <select value={form.id_invernadero} onChange={(e) => setForm({ ...form, id_invernadero: e.target.value, id_zona: '' })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Selecciona invernadero</option>
                        {invernaderos.map((inv) => <option key={inv.id_invernadero} value={inv.id_invernadero}>{inv.nombre}</option>)}
                    </select>
                    <select value={form.id_zona} onChange={(e) => setForm({ ...form, id_zona: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={!form.id_invernadero}>
                        <option value="">Selecciona zona</option>
                        {zonasDisponibles.map((zona) => <option key={zona.id_zona} value={zona.id_zona}>{zona.nombre}</option>)}
                    </select>
                </div>
                 <select value={form.autor_id} onChange={(e) => setForm({ ...form, autor_id: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Selecciona autor</option>
                    {autoresFiltrados.map((autor) => <option key={autor.id_persona} value={autor.id_persona}>{autor.nombre_usuario}</option>)}
                </select>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Cancelar</button>
                    <button onClick={guardarPublicacion} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2" disabled={isSaving}>
                         {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : "Guardar"}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {modalConfirmar && <ConfirmModal mensaje="¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer." onConfirmar={accionConfirmar} onCancelar={() => setModalConfirmar(false)} />}
      {modalMensaje && <MessageModal mensaje={modalMensaje} onCerrar={() => setModalMensaje("")} />}
    </main>
  );
}
