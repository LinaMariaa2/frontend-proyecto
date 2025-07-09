"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

 const autores = [
    { id: 101, nombre: "Carlos Pérez", rol: "admin", activo: true },
    { id: 102, nombre: "Laura Gómez", rol: "operario", activo: true },
    { id: 103, nombre: "Ana Torres", rol: "admin", activo: false },
    { id: 104, nombre: "Pedro Díaz", rol: "operario", activo: true },
  ]

const invernaderos = [
  { id: 1, nombre: "Invernadero A" },
  { id: 2, nombre: "Invernadero B" },
];

const zonasPorInvernadero = {
  1: [
    { id: 101, nombre: "Zona Norte" },
    { id: 102, nombre: "Zona Sur" },
  ],
  2: [
    { id: 201, nombre: "Zona 1" },
    { id: 202, nombre: "Zona 2" },
  ],
};

const tiposEvento = ["riego", "iluminación", "temperatura", "humedad"];
const importancias = ["alta", "media", "baja"];

export default function BitacoraPage() {
  const [publicaciones, setPublicaciones] = useState([
    {
      id: 1,
      titulo: "Revisión de sensores",
      contenido: "Se verificaron los sensores.",
      tipo_evento: "temperatura",
      importancia: "media",
      id_invernadero: 1,
      id_zona: 101,
      autor_id: 1,
      autor_nombre: "María López",
      estado: "activo",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [form, setForm] = useState({
    id: null,
    titulo: "",
    contenido: "",
    tipo_evento: "",
    importancia: "media",
    id_invernadero: "",
    id_zona: "",
    autor_id: "",
  });

  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const autoresFiltrados = autores.filter(
    (a) =>
      a.activo &&
      (a.rol === "admin" || a.rol === "operario") &&
      a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    if (form.id_invernadero) {
      setZonasDisponibles(zonasPorInvernadero[form.id_invernadero] || []);
    }
  }, [form.id_invernadero]);

  const abrirModal = (pub = null) => {
    if (pub) {
      setForm(pub);
      setEditando(true);
    } else {
      setForm({
        id: null,
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

  const guardarPublicacion = () => {
    if (
      !form.titulo ||
      !form.contenido ||
      !form.tipo_evento ||
      !form.id_invernadero ||
      !form.id_zona ||
      !form.autor_id
    ) {
      alert("Completa todos los campos.");
      return;
    }

    const autor = autores.find((a) => a.id == form.autor_id);
    const nuevaPub = {
      ...form,
      autor_nombre: autor?.nombre || "Desconocido",
      id: form.id ?? Date.now(),
      timestamp: new Date().toISOString(),
      estado: form.estado ?? "activo",
    };

    if (editando) {
      setPublicaciones((prev) =>
        prev.map((pub) => (pub.id === form.id ? nuevaPub : pub))
      );
    } else {
      setPublicaciones((prev) => [nuevaPub, ...prev]);
    }

    setModalOpen(false);
    setEditando(false);
  };

  const cambiarEstado = (id) => {
    setPublicaciones((prev) =>
      prev.map((pub) =>
        pub.id === id
          ? { ...pub, estado: pub.estado === "activo" ? "inactivo" : "activo" }
          : pub
      )
    );
  };

  const eliminarPublicacion = (id) => {
    if (confirm("¿Deseas eliminar esta nota?")) {
      setPublicaciones((prev) => prev.filter((pub) => pub.id !== id));
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">Bitácora</h1>
        <button
          onClick={() => abrirModal()}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Publicación
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
        <input
          type="text"
          placeholder="Buscar autor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 p-2 rounded w-64"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicaciones.map((pub) => (
          <div
            key={pub.id}
            className="bg-white shadow rounded-lg p-5 border border-gray-200 flex flex-col gap-2 relative"
          >
            <h2 className="text-xl font-semibold text-green-700">{pub.titulo}</h2>
            <p className="text-sm text-gray-600">{pub.contenido}</p>
            <div className="text-sm text-gray-500">
              <p>Autor: <span className="text-gray-700">{pub.autor_nombre}</span></p>
              <p>Evento: <span className="capitalize">{pub.tipo_evento}</span></p>
              <p>Importancia: <span className="capitalize">{pub.importancia}</span></p>
              <p>Zona ID: {pub.id_zona}</p>
              <p>Invernadero ID: {pub.id_invernadero}</p>
              <p>Estado: <span className="font-semibold">{pub.estado}</span></p>
            </div>
            <div className="absolute top-3 right-3 space-x-2 flex">
              <button
                onClick={() => cambiarEstado(pub.id)}
                className="text-gray-600 hover:text-green-600"
                title="Archivar"
              >
                <ArchiveBoxIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => abrirModal(pub)}
                className="text-gray-600 hover:text-yellow-500"
                title="Editar"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => eliminarPublicacion(pub.id)}
                className="text-gray-600 hover:text-red-500"
                title="Eliminar"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold text-green-700">
              {editando ? "Editar Publicación" : "Nueva Publicación"}
            </h2>

            <input
              placeholder="Título"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <textarea
              placeholder="Contenido"
              value={form.contenido}
              onChange={(e) => setForm({ ...form, contenido: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <select
              value={form.tipo_evento}
              onChange={(e) => setForm({ ...form, tipo_evento: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Tipo de evento</option>
              {tiposEvento.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <select
              value={form.importancia}
              onChange={(e) => setForm({ ...form, importancia: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded"
            >
              {importancias.map((imp) => (
                <option key={imp} value={imp}>
                  {imp}
                </option>
              ))}
            </select>
            <select
              value={form.id_invernadero}
              onChange={(e) =>
                setForm({ ...form, id_invernadero: e.target.value, id_zona: "" })
              }
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Seleccionar Invernadero</option>
              {invernaderos.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.nombre}
                </option>
              ))}
            </select>
            <select
              value={form.id_zona}
              onChange={(e) => setForm({ ...form, id_zona: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded"
              disabled={!form.id_invernadero}
            >
              <option value="">Seleccionar Zona</option>
              {zonasDisponibles.map((zona) => (
                <option key={zona.id} value={zona.id}>
                  {zona.nombre}
                </option>
              ))}
            </select>
            
            {/* Buscador de autor */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Buscar Autor
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar autor por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300 rounded"
                />
              </div>
              {busqueda && (
                <ul className="border mt-1 rounded shadow-sm max-h-40 overflow-y-auto bg-white">
                  {autoresFiltrados.length > 0 ? (
                    autoresFiltrados.map((autor) => (
                      <li
                        key={autor.id}
                        className={`px-4 py-2 hover:bg-green-100 cursor-pointer ${
                          form.autor_id == autor.id ? "bg-green-50 font-semibold" : ""
                        }`}
                        onClick={() => {
                          setForm({
                            ...form,
                            autor_id: autor.id,
                            autor_nombre: autor.nombre,
                          });
                          setBusqueda(autor.nombre);
                        }}
                      >
                        {autor.nombre}{" "}
                        <span className="text-xs text-gray-500">({autor.rol})</span>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500">No encontrado</li>
                  )}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditando(false);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPublicacion}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {editando ? "Guardar Cambios" : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
