"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Persona {
  id_persona: number;
  nombre_usuario: string;
  correo: string;
  contrasena: string;
  rol: "admin" | "operario" | "superadmin";
  estado: "activo" | "inactivo";
  autenticado: boolean;
  created_at: string;
  updated_at: string;
  foto?: string;
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Persona | null>(null);
  const [editForm, setEditForm] = useState({
    nombre_usuario: "",
    correo: "",
    contrasena: "",
  });
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);

  useEffect(() => {
    // Simula datos desde backend
    const data: Persona = {
      id_persona: 1,
      nombre_usuario: "juliansamboni",
      correo: "julian@hortitech.com",
      contrasena: "",
      rol: "admin",
      estado: "activo",
      autenticado: true,
      created_at: "2025-05-01T12:00:00Z",
      updated_at: "2025-06-01T18:30:00Z",
      foto: "/images/default-avatar.png", // imagen inicial
    };
    setUsuario(data);
    setEditForm({
      nombre_usuario: data.nombre_usuario,
      correo: data.correo,
      contrasena: "",
    });
    setFotoPreview(data.foto || null);
  }, []);

  const handleGuardar = () => {
    if (!editForm.nombre_usuario || !editForm.correo) {
      alert("Nombre y correo son obligatorios.");
      return;
    }

    // Aquí iría la lógica para enviar la imagen y datos al backend
    console.log("Guardando cambios:", {
      ...editForm,
      foto: fotoArchivo,
    });

    alert("Cambios guardados correctamente.");
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoArchivo(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!usuario) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <main className="max-w-3xl mx-auto py-10 px-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-darkGreen-900 mb-8 text-center md:text-left">
        Mi Perfil
      </h1>

      <div className="bg-white rounded-3xl shadow p-8 space-y-6">
        {/* Imagen de perfil */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow">
            {fotoPreview ? (
              <Image
                src={fotoPreview}
                alt="Foto de perfil"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="bg-gray-200 w-full h-full" />
            )}
          </div>
          <label className="text-sm text-green-700 font-medium cursor-pointer hover:underline">
            Cambiar Foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagenChange}
            />
          </label>
        </div>

        {/* Datos del perfil */}
        <div>
          <label className="text-sm font-medium text-gray-600">Nombre de Usuario</label>
          <input
            className="w-full mt-1 border border-gray-300 p-3 rounded-md"
            value={editForm.nombre_usuario}
            onChange={(e) => setEditForm({ ...editForm, nombre_usuario: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
          <input
            type="email"
            className="w-full mt-1 border border-gray-300 p-3 rounded-md"
            value={editForm.correo}
            onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Contraseña Nueva</label>
          <input
            type="password"
            placeholder="••••••••••"
            className="w-full mt-1 border border-gray-300 p-3 rounded-md"
            value={editForm.contrasena}
            onChange={(e) => setEditForm({ ...editForm, contrasena: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">Déjalo vacío si no deseas cambiarla.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 pt-4 border-t border-gray-100">
          <p><strong>Rol:</strong> {usuario.rol}</p>
          <p><strong>Estado:</strong> {usuario.estado}</p>
          <p><strong>Autenticado:</strong> {usuario.autenticado ? "Sí" : "No"}</p>
          <p><strong>Creado en:</strong> {new Date(usuario.created_at).toLocaleString()}</p>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={handleGuardar}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full transition"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </main>
  );
}
