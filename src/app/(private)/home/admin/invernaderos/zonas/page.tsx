"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useRef } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

interface Zona {
  id_zona: number;
  nombre: string;
  descripciones_add: string;
  estado: string;
  id_cultivo?: string | null;
}

interface Cultivo {
  id_cultivo: number;
  nombre_cultivo: string;
}

export default function ZonasPage() {
  const searchParams = useSearchParams();
  const id_invernadero = searchParams.get("id_invernadero") || "1";

  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaEditando, setZonaEditando] = useState<Zona | null>(null);
  const [zonaAEliminar, setZonaAEliminar] = useState<Zona | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    descripciones_add: "",
    id_cultivo: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [cultivosDisponibles, setCultivosDisponibles] = useState<Cultivo[]>([]);
  const [alertaZonaActiva, setAlertaZonaActiva] = useState(false);
  const [zonaBloqueada, setZonaBloqueada] = useState<Zona | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case "activo":
        return "text-green-600";
      case "inactivo":
        return "text-gray-500";
      case "mantenimiento":
        return "text-yellow-600";
      default:
        return "text-gray-700";
    }
  };

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/zona/invernadero/${id_invernadero}`);
        setZonas(res.data);
      } catch (error) {
        console.error("Error al cargar zonas:", error);
      }
    };
    fetchZonas();
  }, [id_invernadero]);

  useEffect(() => {
    const fetchCultivos = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/cultivos");
        setCultivosDisponibles(res.data);
      } catch (error) {
        console.error("Error al cargar cultivos:", error);
      }
    };
    fetchCultivos();
  }, []);
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpenId(null); // Cierra el menú si haces clic fuera
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const obtenerNombreCultivo = (id_cultivo: string | null | undefined) => {
    const cultivo = cultivosDisponibles.find((c) => c.id_cultivo === Number(id_cultivo));
    return cultivo ? cultivo.nombre_cultivo : "Sin cultivo asignado";
  };

  const crearZona = async () => {
    try {
        const nueva = {
          nombre: form.nombre.trim(),
          descripciones_add: form.descripciones_add.trim(),
          id_cultivo: form.id_cultivo ? Number(form.id_cultivo) : null,
          id_invernadero: Number(id_invernadero),
          estado: "activo",
        };


      if (!nueva.nombre || !nueva.descripciones_add) {
        setErrorMensaje("Todos los campos deben estar completos.");
        setErrorModalOpen(true);
        return;
      }

      const res = await axios.post("http://localhost:4000/api/zona", nueva);
      const zonaCreada = res.data.zona;
      setZonas((prev) => [...prev, zonaCreada]);

      setForm({ nombre: "", descripciones_add: "", id_cultivo: "" });
      setModalOpen(false);
    } catch (error: any) {
      setErrorMensaje(error.response?.data?.error || "Error al crear zona.");
      setErrorModalOpen(true);
    }
  };

  const manejarError = (error: any) => {
    const mensaje = error.response?.data?.error || 'Ocurrió un error inesperado al cambiar el estado';
    setErrorMensaje(mensaje);
    setErrorModalOpen(true);
    console.error("Error al cambiar estado:", error);
  };

  const activarZona = async (id: number) => {
    try {
      await axios.patch(`http://localhost:4000/api/zona/activar/${id}`);
      setZonas((prev) => prev.map((z) => (z.id_zona === id ? { ...z, estado: "activo" } : z)));
      setMenuOpenId(null);
    } catch (error) {
      manejarError(error);
    }
  };

  const inactivarZona = async (id: number) => {
    try {
      await axios.patch(`http://localhost:4000/api/zona/inactivar/${id}`);
      setZonas((prev) => prev.map((z) => (z.id_zona === id ? { ...z, estado: "inactivo" } : z)));
      setMenuOpenId(null);
    } catch (error) {
      manejarError(error);
    }
  };

  const mantenimientoZona = async (id: number) => {
    try {
      await axios.patch(`http://localhost:4000/api/zona/mantenimiento/${id}`);
      setZonas((prev) => prev.map((z) => (z.id_zona === id ? { ...z, estado: "mantenimiento" } : z)));
      setMenuOpenId(null);
    } catch (error) {
      manejarError(error);
    }
  };

  const eliminarZonaConfirmada = async () => {
  if (!zonaAEliminar) return;

  if (zonaAEliminar.estado !== "inactivo") {
    setAlertaZonaActiva(true);
    return; // 🔴 Detiene el flujo aquí
  }

  try {
    await axios.delete(`http://localhost:4000/api/zona/${zonaAEliminar.id_zona}`);
    setZonas((prev) => prev.filter((z) => z.id_zona !== zonaAEliminar.id_zona));
    setZonaAEliminar(null);
    setMenuOpenId(null);
  } catch (error) {
    console.error("❌ Error al eliminar zona:", error);
  }
};


  const guardarEdicion = async () => {
    if (!zonaEditando) return;

    try {
      const payload = {
  nombre: zonaEditando.nombre.trim(),
  descripciones_add: zonaEditando.descripciones_add.trim(),
  estado: zonaEditando.estado,
  id_cultivo: zonaEditando.id_cultivo ? Number(zonaEditando.id_cultivo) : null,
  id_invernadero: Number(id_invernadero),
};

    

      if (!payload.nombre || !payload.descripciones_add) {
        setErrorMensaje("Todos los campos deben estar completos para guardar.");
        setErrorModalOpen(true);
        return;
      }

      const res = await axios.put(`http://localhost:4000/api/zona/${zonaEditando.id_zona}`, payload);

      setZonas((prev) =>
        prev.map((z) => (z.id_zona === zonaEditando.id_zona ? { ...zonaEditando } : z))
      );

      setZonaEditando(null);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrorMensaje(error.response.data?.error || "Datos inválidos. Revisa los campos.");
        setErrorModalOpen(true);
      } else {
        console.error("❌ Error al guardar cambios:", error);
      }
    }
  };

  const totalZonas = zonas.length;
  const zonasActivas = zonas.filter((z) => z.estado === "activo").length;

 return (
  <main className="p-6 bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-bold text-green-800 mb-4">
      Zonas del Invernadero #{id_invernadero}
    </h1>

    <p className="text-gray-600 mb-8">
      Total zonas: <strong>{totalZonas}</strong> | Zonas activas: <strong>{zonasActivas}</strong>
    </p>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {zonas.map((zona) => (
        <div
          key={zona.id_zona}
          className="bg-white rounded-xl shadow-md p-5 border border-gray-200 relative flex flex-col gap-2"
        >
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold text-green-700">{zona.nombre}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZonaEditando(zona)}
                className="text-green-600 hover:text-green-800"
                title="Editar"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setMenuOpenId((prev) => (prev === zona.id_zona ? null : zona.id_zona))
                }
                className="text-gray-600 hover:text-gray-800 text-xl"
                title="Opciones"
              >
                ⋮
              </button>
            </div>
            {menuOpenId === zona.id_zona && (
              <div
                ref={menuRef}
                className="absolute right-0 top-10 bg-white border shadow rounded-md z-50"
              >
                <button
                  onClick={() => activarZona(zona.id_zona)}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Activar
                </button>
                <button
                  onClick={() => inactivarZona(zona.id_zona)}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Inactivar
                </button>
                <button
                  onClick={() => mantenimientoZona(zona.id_zona)}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  En mantenimiento
                </button>
                <button
                  onClick={() => {
                    if (zona.estado === "inactivo") {
                      setZonaAEliminar(zona);
                    } else {
                      setZonaBloqueada(zona);
                      setAlertaZonaActiva(true);
                    }
                  }}
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600">{zona.descripciones_add}</p>
          <p className="text-sm text-gray-700">
            Estado: <span className={`font-semibold uppercase ${getColorEstado(zona.estado)}`}>{zona.estado}</span>
          </p>
          <p className="text-sm text-gray-700">
            Cultivo: <span className="italic text-gray-600">{obtenerNombreCultivo(zona.id_cultivo)}</span>
          </p>
          <p className="text-xs text-gray-500">
            ID Zona: {zona.id_zona} | Invernadero: {id_invernadero}
          </p>

          <div className="flex justify-between mt-4">
            <Link
              href={`/home/admin/invernaderos/zonas/programacion-riego?id=${zona.id_zona}`}
              className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 text-sm"
            >
              Riego
            </Link>
            <Link
              href={`/home/admin/invernaderos/zonas/programacion-iluminacion?id=${zona.id_zona}`}
              className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 text-sm"
            >
              Iluminación
            </Link>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-10 flex justify-center">
      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition"
      >
        Crear Zona
      </button>
    </div>

    {/* Modal crear zona */}
    {modalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Nueva Zona</h2>

          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded mb-3"
          />
          <textarea
            placeholder="Descripción"
            value={form.descripciones_add}
            onChange={(e) => setForm({ ...form, descripciones_add: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded mb-3"
          />
          <select
            value={form.id_cultivo}
            onChange={(e) => setForm({ ...form, id_cultivo: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded mb-4"
          >
            <option value="">-- Sin cultivo --</option>
            {cultivosDisponibles.map((cultivo) => (
              <option key={cultivo.id_cultivo} value={cultivo.id_cultivo}>
                {cultivo.nombre_cultivo}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              onClick={crearZona}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal editar zona */}
    {zonaEditando && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Editar Zona</h2>

          <input
            placeholder="Nombre"
            value={zonaEditando.nombre}
            onChange={(e) => setZonaEditando({ ...zonaEditando, nombre: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded mb-3"
          />

          <textarea
            placeholder="Descripción"
            value={zonaEditando.descripciones_add}
            onChange={(e) =>
              setZonaEditando({ ...zonaEditando, descripciones_add: e.target.value })
            }
            className="w-full border border-gray-300 p-2 rounded mb-3"
          />

          <select
            value={zonaEditando.id_cultivo || ""}
            onChange={(e) =>
              setZonaEditando({ ...zonaEditando, id_cultivo: e.target.value })
            }
            className="w-full border border-gray-300 p-2 rounded mb-4"
          >
            <option value="">-- Sin cultivo --</option>
            {cultivosDisponibles.map((cultivo) => (
              <option key={cultivo.id_cultivo} value={cultivo.id_cultivo}>
                {cultivo.nombre_cultivo}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setZonaEditando(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              onClick={guardarEdicion}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal eliminar zona */}
    {zonaAEliminar && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">¿Eliminar Zona?</h2>
          <p className="text-gray-700 mb-6">
            ¿Estás seguro que deseas eliminar la zona <strong>{zonaAEliminar.nombre}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setZonaAEliminar(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              onClick={eliminarZonaConfirmada}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal zona activa (alerta) */}
    {alertaZonaActiva && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-yellow-600 mb-4">No se puede eliminar la zona</h2>
            <p className="text-gray-700 mb-6">
              Solo puedes eliminar zonas con estado <strong>inactivo</strong>. Esta zona está en estado <strong>{zonaBloqueada?.estado}</strong>.
            </p>


          <div className="flex justify-center">
            <button
  onClick={() => {
    setAlertaZonaActiva(false);
    setZonaBloqueada(null); // Limpiar zona bloqueada al cerrar
  }}
  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
>
  Entendido
</button>


          </div>
        </div>
      </div>
    )}

    {/* Modal error */}
    {errorModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{errorMensaje}</p>
          <div className="flex justify-center">
            <button
              onClick={() => setErrorModalOpen(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
  </main>
);
}