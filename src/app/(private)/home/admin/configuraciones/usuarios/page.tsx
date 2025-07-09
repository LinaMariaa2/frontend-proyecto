"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: "Julian Samboni",
      correo: "julian@example.com",
      rol: "admin",
      estado: "activo",
      autenticado: true,
      created_at: new Date("2025-05-01T07:00:00"),
      foto: "/images/perfil1.png",
    },
    {
      id: 2,
      nombre: "Laura Martínez",
      correo: "laura@example.com",
      rol: "operario",
      estado: "inactivo",
      autenticado: false,
      created_at: new Date("2025-04-28T09:30:00"),
      foto: "/images/perfil2.png",
    },
  ]);

  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    rol: "operario",
    estado: "activo",
    autenticado: true,
    foto: "",
  });

  const handleEditar = (usuario: any) => {
    setUsuarioEditando(usuario);
    setForm({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      autenticado: usuario.autenticado,
      foto: usuario.foto,
    });
    setEditarModalOpen(true);
  };

  const handleGuardarEdicion = () => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioEditando.id ? { ...u, ...form } : u
      )
    );
    setEditarModalOpen(false);
    setUsuarioEditando(null);
  };

  const eliminarUsuario = (id: number) => {
    if (confirm("¿Deseas eliminar este usuario?")) {
      setUsuarios(usuarios.filter((u) => u.id !== id));
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-4xl font-bold text-green-800 mb-8">Gestión de Usuarios</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <div className="flex items-center gap-4 mb-3">
              <Image
                src={usuario.foto}
                alt="Foto de perfil"
                width={60}
                height={60}
                className="rounded-full border object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-green-700">{usuario.nombre}</h2>
                <p className="text-sm text-gray-500">{usuario.correo}</p>
              </div>
            </div>

            <p><strong>Rol:</strong> {usuario.rol}</p>
            <p><strong>Estado:</strong> {usuario.estado}</p>
            <p><strong>Autenticado:</strong> {usuario.autenticado ? "Sí" : "No"}</p>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Creado en:</strong>{" "}
              {usuario.created_at.toLocaleString("es-CO", {
                dateStyle: "short",
                timeStyle: "medium",
              })}
            </p>

            <div className="flex justify-between gap-2 mt-4">
              <button
                onClick={() => handleEditar(usuario)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarUsuario(usuario.id)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-1 rounded-full text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {editarModalOpen && (
        <Modal
          form={form}
          setForm={setForm}
          onCancel={() => setEditarModalOpen(false)}
          onConfirm={handleGuardarEdicion}
        />
      )}
    </main>
  );
}

type ModalProps = {
  form: any;
  setForm: (value: any) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function Modal({ form, setForm, onCancel, onConfirm }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Editar Usuario</h2>

        <input
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded mb-3"
        />
        <input
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded mb-3"
        />
        <select
          value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded mb-3"
        >
          <option value="operario">Operario</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded mb-3"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select
          value={form.autenticado ? "true" : "false"}
          onChange={(e) => setForm({ ...form, autenticado: e.target.value === "true" })}
          className="w-full border border-gray-300 p-2 rounded mb-3"
        >
          <option value="true">Autenticado: Sí</option>
          <option value="false">Autenticado: No</option>
        </select>

        <input
          type="text"
          placeholder="URL de la nueva foto de perfil"
          value={form.foto}
          onChange={(e) => setForm({ ...form, foto: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
