// src/app/(private)/home/admin/configuraciones/perfil/page.tsx (Tu código actual, verificado)
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/app/services/api";

interface Perfil {
    id_persona: number;
    nombre_usuario: string;
    correo: string;
    rol: "admin" | "operario";
    estado: "activo" | "inactivo" | "mantenimiento";
    isVerified: boolean;
    foto_url?: string;
    createdAt: string;
    updatedAt: string;
    perfil?: {
        foto_url?: string;
    };
}

const buttonBaseClasses = "px-6 py-2 rounded-full text-base font-semibold transition transform duration-200 ease-in-out shadow-md bg-green-600 hover:bg-green-700 text-white";

type AlertDialogProps = {
    message: string;
    onClose: () => void;
};

function CustomAlertDialog({ message, onClose }: AlertDialogProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
                <p className="text-lg text-gray-800 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className={buttonBaseClasses}
                >
                    Aceptar
                </button>
            </div>
        </div>
    );
}

export default function PerfilPage() {
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        nombre_usuario: "",
        correo: "",
        contrasena: "",
    });
    const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);

    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchPerfil();
    }, []);

    const fetchPerfil = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            console.log('DEBUG (Frontend): Token en localStorage al cargar perfil:', token ? token.substring(0, 30) + '...' : 'No token');

            const response = await api.get('/perfil');
            const fetchedPerfil: Perfil = response.data;

            const fotoUrl = fetchedPerfil.perfil?.foto_url || fetchedPerfil.foto_url || "/images/default-avatar.png";

            setPerfil({ ...fetchedPerfil, foto_url: fotoUrl });
            setEditForm({
                nombre_usuario: fetchedPerfil.nombre_usuario,
                correo: fetchedPerfil.correo,
                contrasena: "",
            });
        } catch (err: any) {
            console.error("Error al cargar perfil:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Error al cargar el perfil.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async () => {
        if (!perfil) return;
        setLoading(true);
        setError(null);

        try {
            const { nombre_usuario, correo, contrasena } = editForm;

            const updateData: { nombre_usuario?: string; correo?: string; contrasena?: string } = {};
            if (nombre_usuario !== perfil.nombre_usuario) updateData.nombre_usuario = nombre_usuario;
            if (correo !== perfil.correo) updateData.correo = correo;
            if (contrasena) updateData.contrasena = contrasena;

            await api.put("/perfil/update", updateData);

            if (fotoArchivo && perfil.id_persona) {
                const formData = new FormData();
                formData.append('profile_picture', fotoArchivo);

                await api.post(`/users/${perfil.id_persona}/upload-photo`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            await fetchPerfil();
            setAlertMessage("Perfil actualizado correctamente.");
            setEditForm({ ...editForm, contrasena: "" });
            setFotoArchivo(null);
        } catch (err: any) {
            console.error("Error al actualizar perfil:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Hubo un error al guardar los cambios.");
        } finally {
            setLoading(false);
        }
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoArchivo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPerfil(prev => prev ? { ...prev, foto_url: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <p className="text-center mt-10 text-gray-600">Cargando perfil...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
    if (!perfil) return <p className="text-center mt-10 text-gray-600">No se pudo cargar el perfil.</p>;

    return (
        <main className="max-w-3xl mx-auto py-10 px-6 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-4xl font-bold text-green-800 mb-8 text-center md:text-left">
                Mi Perfil (Admin)
            </h1>

            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-gray-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-md">
                        <Image
                            src={perfil.foto_url || "/images/default-avatar.png"}
                            alt="Foto de perfil"
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="w-full max-w-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition"
                    />
                </div>

                <div>
                    <label htmlFor="nombre_usuario" className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                    <input
                        id="nombre_usuario"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-green-500 focus:border-green-500 transition"
                        value={editForm.nombre_usuario}
                        onChange={(e) =>
                            setEditForm({ ...editForm, nombre_usuario: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                        id="correo"
                        type="email"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-green-500 focus:border-green-500 transition"
                        value={editForm.correo}
                        onChange={(e) =>
                            setEditForm({ ...editForm, correo: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                    <input
                        id="contrasena"
                        type="password"
                        placeholder="••••••••••"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-green-500 focus:border-green-500 transition"
                        value={editForm.contrasena}
                        onChange={(e) =>
                            setEditForm({ ...editForm, contrasena: e.target.value })
                        }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Déjalo vacío si no deseas cambiarla.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-gray-700 pt-4 border-t border-gray-100">
                    <p>
                        <strong>Rol:</strong> <span className="capitalize text-green-800 font-medium">{perfil.rol}</span>
                    </p>
                    <p>
                        <strong>Estado:</strong> <span className={`capitalize font-medium ${perfil.estado === 'activo' ? 'text-green-600' : perfil.estado === 'inactivo' ? 'text-orange-500' : 'text-red-600'}`}>
                            {perfil.estado === 'mantenimiento' ? 'Bloqueado' : perfil.estado}
                        </span>
                    </p>
                    <p>
                        <strong>Verificado:</strong> <span className={`font-medium ${perfil.isVerified ? 'text-green-600' : 'text-red-500'}`}>{perfil.isVerified ? "Sí" : "No"}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        <strong>Creado en:</strong>{" "}
                        {new Date(perfil.createdAt).toLocaleString("es-CO", {
                            dateStyle: "short",
                            timeStyle: "medium",
                        })}
                    </p>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleGuardar}
                        className={buttonBaseClasses}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {alertMessage && <CustomAlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />}
        </main>
    );
}