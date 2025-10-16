"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, ArchiveRestore, Loader2, Inbox, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

// --- Interfaces ---
interface Autor {
  id_persona: number;
  nombre_usuario: string;
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
  id_publicacion: number;
  titulo: string;
  contenido: string;
  tipo_evento: string;
  importancia: "alta" | "media" | "baja";
  invernadero?: Invernadero;
  zona?: Zona;
  autor?: Autor;
}

// --- Componente de Modal de Mensaje ---
const MessageModal = ({ title, message, onCerrar, success = true }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {success ? <CheckCircle2 className="w-16 h-16 mx-auto text-teal-500 mb-4" /> : <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />}
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <button onClick={onCerrar} className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Entendido</button>
        </div>
    </div>
);

// --- Componente Principal ---
export default function ArchivadasPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });

  useEffect(() => {
    const fetchArchivadas = async () => {
        setLoading(true);
        try {
            const res = await axios.get("https://backendhortitech.onrender.com/api/bitacora?archivadas=true");
            setPublicaciones(res.data);
        } catch (err) {
            console.error("Error al obtener archivadas", err);
            setModalMessage({ show: true, success: false, title: "Error de Carga", message: "No se pudieron cargar las publicaciones archivadas." });
        } finally {
            setLoading(false);
        }
    };
    fetchArchivadas();
  }, []);

  const desarchivar = async (id: number) => {
    try {
      await axios.patch(`https://backendhortitech.onrender.com/api/bitacora/${id}/desarchivar`);
      setPublicaciones((prev) => prev.filter((pub) => pub.id_publicacion !== id));
      setModalMessage({ show: true, success: true, title: "Restaurado", message: "La publicación ha sido restaurada a la bitácora principal." });
    } catch (err) {
      console.error("Error al desarchivar", err);
      setModalMessage({ show: true, success: false, title: "Error", message: "No se pudo restaurar la publicación. Inténtelo de nuevo." });
    }
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
            <Link href="/home/operario/bitacora" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2">
                <ArrowLeft className="w-4 h-4"/> Volver a Bitácora
            </Link>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Publicaciones Archivadas</h1>
            <p className="text-lg text-slate-500 mt-1">Eventos y actividades removidas de la bitácora principal.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
            <Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin"/>
            <p className="mt-4 text-slate-500">Cargando archivados...</p>
        </div>
      ) : publicaciones.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <Inbox className="w-16 h-16 mx-auto text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-700">No hay nada aquí</h3>
            <p className="text-slate-500 mt-1">No se encontraron publicaciones archivadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicaciones.map((pub) => (
            <div 
                key={pub.id_publicacion} 
                className="bg-white shadow-sm rounded-lg p-5 border-l-4 border-slate-400 flex flex-col"
            >
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full self-start ${
                  pub.importancia === 'alta' ? 'bg-red-100 text-red-700' :
                  pub.importancia === 'media' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
              }`}>
                {pub.tipo_evento}
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-3">{pub.titulo}</h3>
              <p className="text-sm text-slate-600 mt-1 flex-grow">{pub.contenido}</p>
              <div className="text-xs text-slate-500 mt-4 border-t border-slate-200 pt-3">
                  <p><strong>Autor:</strong> {pub.autor?.nombre_usuario || 'N/A'}</p>
                  <p><strong>Ubicación:</strong> {pub.invernadero?.nombre || 'N/A'} - {pub.zona?.nombre || 'N/A'}</p>
              </div>

              <button
                onClick={() => desarchivar(pub.id_publicacion)}
                className="mt-4 w-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold px-3 py-2 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <ArchiveRestore className="w-4 h-4" />
                Restaurar
              </button>
            </div>
          ))}
        </div>
      )}

      {modalMessage.show && <MessageModal title={modalMessage.title} message={modalMessage.message} success={modalMessage.success} onCerrar={() => setModalMessage({ ...modalMessage, show: false })} />}
    </main>
  );
}
