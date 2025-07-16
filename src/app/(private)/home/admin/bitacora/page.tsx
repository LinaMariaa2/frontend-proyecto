"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

// Interfaces
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

// Confirm Modal solo para eliminar
const ConfirmModal = ({
  mensaje,
  onConfirmar,
  onCancelar,
}: {
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
      <div className="mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-12 h-12 mx-auto text-red-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.435.732.87.732h3.507c.512 0 .923.41.923.922v.016a.923.923 0 01-.923.922H4.923A.923.923 0 014 6.504v-.016c0-.512.411-.922.923-.922h3.507c.435 0 .8-.308.87-.732l.149-.894zM6.478 20.563A1.125 1.125 0 007.591 21h8.818a1.125 1.125 0 001.113-.937l1.5-12A1.125 1.125 0 0017.909 6H6.091a1.125 1.125 0 00-1.113 1.063l1.5 12z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar publicación?</h3>
      <p className="text-sm text-gray-600 mb-6">{mensaje}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancelar}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// Message Modal
const MessageModal = ({ mensaje, onCerrar }: { mensaje: string; onCerrar: () => void }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
      <h3 className="text-lg font-semibold text-green-700 mb-4">Mensaje</h3>
      <p className="text-sm text-gray-700 mb-6">{mensaje}</p>
      <button
        onClick={onCerrar}
        className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Cerrar
      </button>
    </div>
  </div>
);

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
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroEvento, setFiltroEvento] = useState("");
  const [filtroImportancia, setFiltroImportancia] = useState("");
  const [filtroInvernadero, setFiltroInvernadero] = useState("");
  const [filtroZona, setFiltroZona] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("invernadero"); // selecciona qué tipo de filtro aplicar
const [busqueda, setBusqueda] = useState(""); // tu barra de búsqueda general


  useEffect(() => {
    axios.get("http://localhost:4000/api/bitacora?archivadas=false").then((res) => setPublicaciones(res.data));
    axios.get("http://localhost:4000/api/persona").then((res) => setAutores(res.data));
    axios.get("http://localhost:4000/api/invernadero").then((res) => setInvernaderos(res.data));
  }, []);

  useEffect(() => {
    if (form.id_invernadero) {
      axios.get(`http://localhost:4000/api/zona/invernadero/${form.id_invernadero}`).then((res) => setZonasDisponibles(res.data));
    } else {
      setZonasDisponibles([]);
    }
  }, [form.id_invernadero]);

  useEffect(() => {
  const filtrados = autores.filter(
    (a) =>
      a.estado === "activo" && ["admin", "operario"].includes(a.rol)
  );
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
    try {
      const url = `http://localhost:4000/api/bitacora${editando ? `/${form.id_publicacion}` : ""}`;
      const method = editando ? axios.put : axios.post;
      if (
  !form.titulo ||
  !form.contenido ||
  !form.tipo_evento ||
  !form.id_invernadero ||
  !form.id_zona ||
  !form.autor_id
) {
  setModalMensaje("Por favor completa todos los campos obligatorios.");
  return;
}

await method(url, {
  ...form,
  id_invernadero: Number(form.id_invernadero),
  id_zona: Number(form.id_zona),
  autor_id: Number(form.autor_id),
});

      const res = await axios.get("http://localhost:4000/api/bitacora?archivadas=false");

      setPublicaciones(res.data);
      setModalOpen(false);
      setEditando(false);
      setModalMensaje("¡Publicación guardada con éxito!");
    } catch (err) {
      console.error("Error al guardar", err);
      setModalMensaje("Error al guardar la publicación.");
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
      } catch (error: any) {
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

  // ✅ Archivar SIN ConfirmModal
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

  return (
  <main className="w-full px-6 md:px-12 lg:px-20 xl:px-32 mx-auto mt-10">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-green-700">Bitácora</h1>
      <div className="flex gap-2">
        <Link href="/home/admin/bitacora/archivadas">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Ver Archivadas
          </button>
        </Link>
        <button
          onClick={() => abrirModal()}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Crear Publicación
        </button>
      </div>
    </div>

    <div className="flex items-center gap-3 mb-6">
  <div className="relative w-full">
    <input
      type="text"
      placeholder={`Buscar por ${filtroActivo}`}
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="w-full border border-gray-300 p-2 pl-10 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
    />
    <svg
      className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35M16.65 9a7.65 7.65 0 11-15.3 0 7.65 7.65 0 0115.3 0z"
      />
    </svg>
  </div>

  <select
  value={filtroActivo}
  onChange={(e) => setFiltroActivo(e.target.value)}
  className="border border-gray-300 p-2 rounded text-sm bg-white"
>
  <option value="invernadero">Invernadero</option>
  <option value="importancia">Importancia</option>
  <option value="etiqueta">Tipo de evento</option>
</select>

</div>



    <div className="flex flex-col gap-2">
      {publicaciones
 .filter((pub) => {
  const valor = busqueda.toLowerCase();

  const matchesFiltro = () => {
    if (!valor) return true;

    if (filtroActivo === "invernadero") {
      return (
        pub.invernadero?.nombre?.toLowerCase().includes(valor) ||
        String(pub.id_invernadero).toLowerCase().includes(valor)
      );
    }

    if (filtroActivo === "importancia") {
      return pub.importancia?.toLowerCase().includes(valor);
    }

    if (filtroActivo === "etiqueta") {
      return pub.tipo_evento?.toLowerCase().includes(valor);
    }

    return true;
  };

  const importanciaMatch = !filtroImportancia || pub.importancia === filtroImportancia;
  const invernaderoMatch = !filtroInvernadero || String(pub.id_invernadero) === filtroInvernadero;
  const zonaMatch = !filtroZona || String(pub.id_zona) === filtroZona;

  const fechaPub = pub.timestamp_publicacion?.slice(0, 10);
  const fechaInicioMatch = !filtroFechaInicio || (fechaPub && fechaPub >= filtroFechaInicio);
  const fechaFinMatch = !filtroFechaFin || (fechaPub && fechaPub <= filtroFechaFin);

  return (
    matchesFiltro() &&
    importanciaMatch &&
    invernaderoMatch &&
    zonaMatch &&
    fechaInicioMatch &&
    fechaFinMatch
  );
})
  .map((pub) => (
        <div
          key={pub.id_publicacion!}
          className="bg-white shadow rounded-lg px-4 py-2 border-l-2 border-gray-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-green-800">{pub.titulo}</h3>
              <p className="text-xs text-gray-500 font-medium">
                {pub.tipo_evento?.toUpperCase()}
              </p>
              <p className="text-sm text-gray-700">{pub.contenido}</p>
              <div className="text-xs text-gray-600 mt-1">
                {pub.invernadero?.nombre || pub.id_invernadero} |{" "}
                {pub.zona?.nombre || "N/A"}
              </div>
              <div className="text-xs text-gray-600">
                Autor: {pub.autor?.nombre_usuario || pub.autor_id}
              </div>
            </div>

            <div className="flex flex-col justify-between items-end">
              <div className="flex gap-3">
                <PencilIcon
                  onClick={() => abrirModal(pub)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <ArchiveBoxIcon
                  onClick={() => archivarPublicacion(pub.id_publicacion)}
                  className="w-4 h-4 text-gray-600 cursor-pointer"
                />
                <TrashIcon
                  onClick={() => eliminarPublicacion(pub.id_publicacion)}
                  className="w-4 h-4 text-red-600 cursor-pointer"
                />
              </div>
              <div className="text-xs text-gray-500 mt-2 flex gap-2">
                <span>{pub.timestamp_publicacion?.slice(0, 10)}</span>
                <span
                  className={`font-semibold px-2 py-1 rounded ${
                    pub.importancia === "alta"
                      ? "bg-red-100 text-red-600"
                      : pub.importancia === "media"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {pub.importancia.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {modalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">{editando ? "Editar" : "Nueva"} Publicación</h2>
          <input
            type="text"
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          />
          <textarea
            placeholder="Contenido"
            value={form.contenido}
            onChange={(e) => setForm({ ...form, contenido: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          />
          <select
            value={form.tipo_evento}
            onChange={(e) => setForm({ ...form, tipo_evento: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          >
            <option value="">Seleccionar tipo de evento</option>
            {tipoEventos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={form.importancia}
            onChange={(e) =>
              setForm({ ...form, importancia: e.target.value as any })
            }
            className="w-full border p-2 rounded mb-2"
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <select
            value={form.id_invernadero}
            onChange={(e) => setForm({ ...form, id_invernadero: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          >
            <option value="">Selecciona invernadero</option>
            {invernaderos.map((inv) => (
              <option key={inv.id_invernadero} value={inv.id_invernadero}>
                {inv.nombre}
              </option>
            ))}
          </select>
          <select
            value={form.id_zona}
            onChange={(e) => setForm({ ...form, id_zona: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          >
            <option value="">Selecciona zona</option>
            {zonasDisponibles.map((zona) => (
              <option key={zona.id_zona} value={zona.id_zona}>
                {zona.nombre}
              </option>
            ))}
          </select>
          <select
            value={form.autor_id}
            onChange={(e) => setForm({ ...form, autor_id: e.target.value })}
            className="w-full border p-2 rounded mb-4"
          >
            <option value="">Selecciona autor</option>
            {autoresFiltrados.map((autor) => (
              <option key={autor.id_persona} value={autor.id_persona}>
                {autor.nombre_usuario}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalOpen(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={guardarPublicacion}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    )}

    {modalConfirmar && (
      <ConfirmModal
        mensaje="¿Estás segura de realizar esta acción?"
        onConfirmar={accionConfirmar}
        onCancelar={() => setModalConfirmar(false)}
      />
    )}

    {modalMensaje && (
      <MessageModal mensaje={modalMensaje} onCerrar={() => setModalMensaje("")} />
    )}
  </main>
);

}
