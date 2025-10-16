"use client";
import axios from "axios"; 

import Link from "next/link";
import React, { useState, useEffect } from "react";
import api from "@/app/services/api"; // ✅ usa tu instancia configurada
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
  Loader2,
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

// --- Componente Principal ---
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
          api.get("/bitacora?archivadas=false"),
          api.get("/persona"),
          api.get("/invernadero"),
        ]);
        setPublicaciones(bitacoraRes.data);
        setAutores(personaRes.data);
        setInvernaderos(invernaderoRes.data);
      } catch (error) {
        console.error("Error al cargar los datos iniciales:", error);
        setModalMensaje("No se pudieron cargar los datos. Revisa la conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (form.id_invernadero) {
      api
        .get(`/zona/invernadero/${form.id_invernadero}`)
        .then((res) => setZonasDisponibles(res.data))
        .catch((error) => {
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
        return;
      }
      setForm(pub);
      setEditando(true);
    } else {
      setForm({
        id_publicacion: null,
        titulo: "",
        contenido: "",
        tipo_evento: "",
        importancia: "media",
        id_invernadero: "",
        id_zona: "",
        autor_id: "",
      });
      setEditando(false);
    }
    setModalOpen(true);
  };

  const guardarPublicacion = async () => {
    setIsSaving(true);
    try {
      const url = `/bitacora${editando ? `/${form.id_publicacion}` : ""}`;
      const method = editando ? api.put : api.post;

      if (!form.titulo || !form.contenido || !form.tipo_evento || !form.id_invernadero || !form.id_zona || !form.autor_id) {
        setModalMensaje("Por favor completa todos los campos obligatorios.");
        setIsSaving(false);
        return;
      }

      await method(url, {
        ...form,
        id_invernadero: Number(form.id_invernadero),
        id_zona: Number(form.id_zona),
        autor_id: Number(form.autor_id),
      });

      const res = await api.get("/bitacora?archivadas=false");
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
    // Petición DELETE para eliminar la publicación
    await api.delete(`/bitacora/${id}`);

    // Recargar la lista de publicaciones actualizadas
    const res = await api.get("/bitacora?archivadas=false");
    setPublicaciones(res.data);

    // Mostrar mensaje de éxito
    setModalMensaje("Publicación eliminada correctamente.");
  } catch (error: unknown) {
    // Manejo de error con validación segura
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      setModalMensaje("No puedes eliminar publicaciones de importancia ALTA.");
    } else {
      setModalMensaje("Error al eliminar la publicación.");
    }
  } finally {
    // Cerrar el modal de confirmación
    setModalConfirmar(false);
  }
});
  const archivarPublicacion = async (id: number | null) => {
    if (!id) return;
    try {
      await api.patch(`/bitacora/${id}/archivar`);
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
    if (filtroActivo === "invernadero")
      return (
        pub.invernadero?.nombre?.toLowerCase().includes(valor) ||
        String(pub.id_invernadero).toLowerCase().includes(valor)
      );
    if (filtroActivo === "importancia") return pub.importancia?.toLowerCase().includes(valor);
    if (filtroActivo === "etiqueta") return pub.tipo_evento?.toLowerCase().includes(valor);
    return true;
  });

  // --- Render ---
  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      {/* El resto del render queda igual */}
      {/* ... */}
      {modalConfirmar && (
        <ConfirmModal
          mensaje="¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer."
          onConfirmar={accionConfirmar}
          onCancelar={() => setModalConfirmar(false)}
        />
      )}
      {modalMensaje && <MessageModal mensaje={modalMensaje} onCerrar={() => setModalMensaje("")} />}
    </main>
  );
}
}