"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function CultivosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);

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

  useEffect(() => {
    axios.get("http://localhost:4000/api/cultivos").then((res) => setCultivos(res.data));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menu = document.querySelector(".menu-opciones");
      if (menu && !menu.contains(target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const abrirModalParaEditar = (cultivo: any) => {
    setForm({
      nombre_cultivo: cultivo.nombre_cultivo,
      descripcion: cultivo.descripcion,
      temp_min: cultivo.temp_min,
      temp_max: cultivo.temp_max,
      humedad_min: cultivo.humedad_min,
      humedad_max: cultivo.humedad_max,
      fecha_inicio: cultivo.fecha_inicio.slice(0, 10),
      fecha_fin: cultivo.fecha_fin ? cultivo.fecha_fin.slice(0, 10) : "",
    });
    setImagenFile(null);
    setEditandoId(cultivo.id_cultivo);
    setModalOpen(true);
  };

  const agregarCultivo = async () => {
  if (
    !form.nombre_cultivo ||
    !form.descripcion ||
    !form.temp_min ||
    !form.temp_max ||
    !form.humedad_min ||
    !form.humedad_max ||
    !form.fecha_inicio
  ) {
    alert("Completa todos los campos obligatorios.");
    return;
  }

  let urlImagen = "";

  // Si hay nueva imagen, subirla
  if (imagenFile) {
    const formData = new FormData();
    formData.append("imagen", imagenFile);
    try {
      const res = await axios.post("http://localhost:4000/api/imagen/imagen-cultivo", formData);
      urlImagen = res.data.url;
    } catch (error) {
      alert("❌ Error al subir imagen.");
      return;
    }
  }

  // construir el payload
  const payload: any = {
    ...form,
    temp_min: Number(form.temp_min),
    temp_max: Number(form.temp_max),
    humedad_min: Number(form.humedad_min),
    humedad_max: Number(form.humedad_max),
    fecha_fin: form.fecha_fin || null,
    estado: "activo",
  };

  // solo agregar imagen si hay una nueva
  if (urlImagen) {
    payload.imagenes = urlImagen;
  }

  try {
    if (editandoId) {
      await axios.put(`http://localhost:4000/api/cultivos/${editandoId}`, payload);
      const actualizados = await axios.get("http://localhost:4000/api/cultivos");
      setCultivos(actualizados.data);
    } else {
      const res = await axios.post("http://localhost:4000/api/cultivos", {
        ...payload,
        imagenes: urlImagen, // en creación sí se necesita enviar imagen, así sea vacía
      });
      setCultivos((prev) => [...prev, res.data.cultivo]);
    }

    // Reset
    setForm({
      nombre_cultivo: "",
      descripcion: "",
      temp_min: "",
      temp_max: "",
      humedad_min: "",
      humedad_max: "",
      fecha_inicio: "",
      fecha_fin: "",
    });
    setImagenFile(null);
    setModalOpen(false);
    setEditandoId(null);
  } catch (error) {
    console.error(error);
    alert("❌ Error al guardar el cultivo.");
  }
};


  const eliminarCultivo = async (id: number) => {
    if (confirm("¿Eliminar cultivo permanentemente?")) {
      try {
        await axios.delete(`http://localhost:4000/api/cultivos/${id}`);
        setCultivos(prev => prev.filter(c => c.id_cultivo !== id));
        setMenuOpenId(null);
      } catch {
        alert("Error al eliminar cultivo.");
      }
    }
  };

  const cambiarEstado = (id: number, nuevo: string) => {
    if (confirm("¿Cambiar estado del cultivo?")) {
      axios.patch(`http://localhost:4000/api/cultivos/${id}/estado/${nuevo}`)
        .then(() => {
          setCultivos(prev => prev.map(c => c.id_cultivo === id ? { ...c, estado: nuevo } : c));
          setMenuOpenId(null);
        })
        .catch(() => alert("Error al cambiar el estado."));
    }
  };

  const cultivosFiltrados = cultivos.filter(c => c.nombre_cultivo.toLowerCase().includes(busqueda.toLowerCase()));

  return (
 <main className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen transition-all duration-300">

    <div className="flex justify-between items-center mb-6">
      <h1 className="text-4xl font-bold text-green-800">Cultivos</h1>
      <button
        onClick={() => {
          setModalOpen(true);
          setEditandoId(null);
        }}
        className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
      >
        + Crear
      </button>
    </div>

    <div className="mb-6 flex items-center gap-2">
      <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
      <input
        placeholder="Buscar cultivo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full md:max-w-sm border border-gray-300 rounded-md px-3 py-2"
      />
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cultivosFiltrados.map((c) => (
        <div
          key={c.id_cultivo}
          className="bg-white p-4 rounded-xl shadow-md border border-gray-200 relative hover:shadow-lg transition duration-300"
        >
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-bold text-green-700">{c.nombre_cultivo}</h2>
            <div className="relative flex items-center gap-1">
              <button
                onClick={() => abrirModalParaEditar(c)}
                className="text-green-600 hover:text-green-800 p-1 rounded-full"
                title="Editar"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setMenuOpenId((prev) => (prev === c.id_cultivo ? null : c.id_cultivo))
                }
                className="hover:bg-gray-100 p-1 rounded-full"
                title="Opciones"
              >
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
              </button>

              {menuOpenId === c.id_cultivo && (
                <div className="menu-opciones absolute right-0 top-8 bg-white border shadow-md rounded-md z-50 w-44">
                  <button
                    onClick={() => cambiarEstado(c.id_cultivo, "activo")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Activar
                  </button>
                  <button
                    onClick={() => cambiarEstado(c.id_cultivo, "finalizado")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Finalizar
                  </button>
                  <button
                    onClick={() => eliminarCultivo(c.id_cultivo)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>

  <div className="overflow-hidden rounded-xl mb-3 shadow-sm">
  {c.imagenes ? (
    <img
      src={c.imagenes}
      alt="Cultivo"
      className="w-full h-36 object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-105"
    />
  ) : (
    <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-sm italic rounded-xl">
      Sin imagen
    </div>
  )}
</div>






          <p className="text-sm text-gray-600 line-clamp-3 mb-2">
            {c.descripcion}
          </p>
          <div className="text-sm text-gray-700 space-y-1">
            <p>🌡️ {c.temp_min}°C - {c.temp_max}°C</p>
            <p>💧 {c.humedad_min}% - {c.humedad_max}%</p>
            <p>🗓️ {new Date(c.fecha_inicio).toLocaleDateString()} - {c.fecha_fin ? new Date(c.fecha_fin).toLocaleDateString() : "—"}</p>
            <p> <span className={`font-semibold ${c.estado === "activo" ? "text-green-600" : "text-gray-500"}`}>{c.estado.toUpperCase()}</span></p>
          </div>
        </div>
      ))}
    </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-green-700"> {editandoId ? "Editar" : "Nuevo"} Cultivo</h2>
            <div className="space-y-3">
              <input placeholder="Nombre del cultivo" value={form.nombre_cultivo} onChange={(e) => setForm({ ...form, nombre_cultivo: e.target.value })} className="w-full border px-3 py-2 rounded" />
              <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full border px-3 py-2 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Temp mín" value={form.temp_min} onChange={(e) => setForm({ ...form, temp_min: e.target.value })} className="border px-3 py-2 rounded" />
                <input type="number" placeholder="Temp máx" value={form.temp_max} onChange={(e) => setForm({ ...form, temp_max: e.target.value })} className="border px-3 py-2 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Humedad mín" value={form.humedad_min} onChange={(e) => setForm({ ...form, humedad_min: e.target.value })} className="border px-3 py-2 rounded" />
                <input type="number" placeholder="Humedad máx" value={form.humedad_max} onChange={(e) => setForm({ ...form, humedad_max: e.target.value })} className="border px-3 py-2 rounded" />
              </div>
              <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="w-full border px-3 py-2 rounded" />
              <input type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} className="w-full border px-3 py-2 rounded" />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Imagen</label>
                <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files?.[0] || null)} className="w-full" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModalOpen(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
              <button onClick={agregarCultivo} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">{editandoId ? "Guardar Cambios" : "Crear"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
