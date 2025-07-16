"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface Invernadero {
  id_invernadero: number;
  nombre: string;
  descripcion: string;
  responsable_id: number;
  estado: string;
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
  estado: "activo",
  zonas_totales: 0,
  zonas_activas: 0,
};

export default function InvernaderosPage() {
  const [invernaderos, setInvernaderos] = useState<Invernadero[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [responsableSeleccionado, setResponsableSeleccionado] = useState<Responsable | null>(null);
  const [busquedaResponsable, setBusquedaResponsable] = useState("");
  const [form, setForm] = useState(formInicial);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [editarModo, setEditarModo] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const obtenerInvernaderos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/invernadero");
      setInvernaderos(response.data);
    } catch (error) {
      console.error("Error al obtener invernaderos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerInvernaderos();
  }, []);

  useEffect(() => {
    const obtenerResponsables = async () => {
      try {
        let url = "http://localhost:4000/api/persona";
        if (busquedaResponsable.trim()) {
          url += `?filtro=${encodeURIComponent(busquedaResponsable)}`;
        }
        const response = await axios.get(url);
        setResponsables(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error al obtener responsables:", error);
      }
    };
    obtenerResponsables();
  }, [busquedaResponsable]);

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, []);

  const crearInvernadero = async () => {
    if (!form.nombre.trim() || !form.descripcion.trim() || !form.responsable_id) {
      alert("Por favor completa todos los campos.");
      return;
    }
    if (form.zonas_totales < 0 || form.zonas_activas < 0) {
      alert("Las zonas no pueden ser negativas.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/api/invernadero", form);
      if (response.status === 201) {
        const nuevo = response.data;
        setInvernaderos((prev) => [...prev, nuevo]); // ✅ Agrega directamente el nuevo
        setForm(formInicial);
        setBusquedaResponsable("");
        setResponsables([]);
        setResponsableSeleccionado(null);
        setModalOpen(false);
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error: any) {
      console.error("❌ Error al crear:", error);
      const mensaje =
        error.response?.data?.errors?.[0]?.msg ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error desconocido";
      setErrorMensaje(mensaje);
      setErrorModalOpen(true);
    }
  };

  const actualizarInvernadero = async () => {
  try {
    if (!form.responsable_id || form.responsable_id <= 0) {
      setErrorMensaje("Debes seleccionar un responsable válido antes de actualizar.");
      setErrorModalOpen(true);
      return;
    }

    const response = await axios.put(
      `http://localhost:4000/api/invernadero/${form.id_invernadero}`,
      {
        nombre: form.nombre,
        descripcion: form.descripcion,
        responsable_id: form.responsable_id,
      }
    );

    await obtenerInvernaderos();
    setEditarModo(null);
    setForm(formInicial);
    setModalOpen(false);
    setResponsableSeleccionado(null);
  } catch (error: any) {
    const mensaje =
      error.response?.data?.errors?.[0]?.msg ||
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Error al actualizar el invernadero";

    setErrorMensaje(mensaje);
    setErrorModalOpen(true);
  }
};


  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const url = `http://localhost:4000/api/invernadero/${getRutaEstado(nuevoEstado)}/${id}`;
      await axios.patch(url, { estado: nuevoEstado });
      await obtenerInvernaderos();
      setMenuOpenId(null);
    } catch (error: any) {
      const mensaje = error.response?.data?.error || "Error al cambiar el estado del invernadero";
      setErrorMensaje(mensaje);
      setErrorModalOpen(true);
    }
  };

  const eliminarInvernadero = async (id: number) => {
    const confirmar = confirm("¿Eliminar este invernadero? Esto no se puede deshacer.");
    if (!confirmar) return;
    try {
      await axios.delete(`http://localhost:4000/api/invernadero/${id}`);
      await obtenerInvernaderos();
      setMenuOpenId(null);
    } catch (error: any) {
      const mensaje = error.response?.data?.error || "Error al eliminar";
      alert(mensaje);
    }
  };

  const getRutaEstado = (estado: string) => {
    switch (estado) {
      case "activo": return "activar";
      case "inactivo": return "inactivar";
      case "mantenimiento": return "mantenimiento";
      default: return "";
    }
  };

  const obtenerNombreResponsable = (invernadero: Invernadero) => {
    return invernadero.encargado?.nombre_usuario || `ID ${invernadero.responsable_id}`;
  };

  
  return (
   <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
    
    <div className="flex justify-between items-center mb-10">
  <h1 className="text-4xl font-bold text-green-900">Invernaderos</h1>
  <button
    onClick={() => setModalOpen(true)}
    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all"
  >
    + Crear Invernadero
  </button>
</div>


    {loading ? (
  <div className="flex justify-center items-center h-64">
    <p className="text-gray-500 text-lg">Cargando invernaderos...</p>
  </div>
) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {invernaderos.map((inv) => (
          <div
            key={inv.id_invernadero}
            className="bg-white rounded-xl shadow-md p-3 flex flex-col gap-2 relative transition-all duration-300 hover:shadow-lg hover:scale-[1.03] hover:border-green-300"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-green-800">{inv.nombre}</h2>
              <div className="relative">
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      setForm(inv);
                      setEditarModo(inv.id_invernadero);
                      setModalOpen(true);
                    }}
                    className="text-green-600 hover:text-green-800"
                    title="Editar"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setMenuOpenId((prev) =>
                        prev === inv.id_invernadero ? null : inv.id_invernadero
                      )
                    }
                    className="text-gray-600 hover:text-gray-800"
                    title="Opciones"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                </div>

                {menuOpenId === inv.id_invernadero && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md z-50"
                  >
                    <button
                      type="button"
                      onClick={() => cambiarEstado(inv.id_invernadero, "activo")}
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      Activar
                    </button>
                    <button
                      type="button"
                      onClick={() => cambiarEstado(inv.id_invernadero, "inactivo")}
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      Inactivar
                    </button>
                    <button
                      type="button"
                      onClick={() => cambiarEstado(inv.id_invernadero, "mantenimiento")}
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      Mantenimiento
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarInvernadero(inv.id_invernadero)}
                      className="block px-4 py-2 hover:bg-red-100 text-red-600 w-full text-left"
                    >
                      Eliminar <TrashIcon className="inline w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-500 text-sm">{inv.descripcion}</p>
            <p className="text-sm font-medium">
              Responsable: <span className="text-gray-800">{obtenerNombreResponsable(inv)}</span>
            </p>
            <p className="text-sm font-medium">
              Estado: <span className="uppercase font-semibold text-green-600">{inv.estado}</span>
            </p>
            <p className="text-sm text-gray-600">Zonas totales: {inv.zonas_totales}</p>
            <p className="text-sm text-gray-600 mb-4">Zonas activas: {inv.zonas_activas}</p>

            <Link
              href={`/home/admin/invernaderos/zonas?id_invernadero=${inv.id_invernadero}`}
              className="text-green-500 hover:text-green-800 font-semibold mt-auto"
            >
              Ver zonas
            </Link>
          </div>

        ))}
      </div>
    )}

    {modalOpen && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow p-8 w-full max-w-xl">
      <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">
        {editarModo !== null ? "Editar Invernadero" : "Nuevo Invernadero"}
      </h2>

      <input
        className="w-full p-3 mb-3 border border-gray-300 rounded"
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />
      <input
        className="w-full p-3 mb-3 border border-gray-300 rounded"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
      />

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Buscar Responsable
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar responsable..."
            value={busquedaResponsable}
            onChange={(e) => setBusquedaResponsable(e.target.value)}
            className="w-full pl-10 p-3 border border-gray-300 rounded"
          />
        </div>

        {busquedaResponsable && (
          <ul className="border mt-1 rounded shadow-sm max-h-40 overflow-y-auto bg-white z-10 relative">
            {responsables.length > 0 ? (
              responsables.map((r) => (
                <li
                  key={r.id_persona}
                  className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                  onClick={() => {
                    setForm({ ...form, responsable_id: r.id_persona });
                    setResponsableSeleccionado(r);
                    setBusquedaResponsable("");
                    setResponsables([]);
                  }}
                >
                  {r.nombre_usuario}{" "}
                  <span className="text-xs text-gray-500">({r.rol})</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No encontrado</li>
            )}
          </ul>
        )}

        {responsableSeleccionado && (
          <p className="text-sm mt-2 text-green-700">
            Responsable seleccionado:{" "}
            <strong>{responsableSeleccionado.nombre_usuario}</strong>
          </p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            setModalOpen(false);
            setForm(formInicial);
            setEditarModo(null);
            setResponsableSeleccionado(null);
            setBusquedaResponsable("");
            setResponsables([]);
          }}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-full"
        >
          Cancelar
        </button>
        <button
          onClick={editarModo !== null ? actualizarInvernadero : crearInvernadero}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-full"
        >
          {editarModo !== null ? "Actualizar" : "Crear"}
        </button>
      </div>
    </div>
  </div>
)}


    {errorModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Operación no permitida
          </h2>
          <p className="text-gray-700 mb-6">{errorMensaje}</p>
          <button
            onClick={() => setErrorModalOpen(false)}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            OK
          </button>
        </div>
      </div>
    )}
  </main>
);
}