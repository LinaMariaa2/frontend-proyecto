"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/app/services/api";
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext'; // Importa useUser

// --- INTERFACES UNIFICADAS CON EL BACKEND ---
// Esta interfaz define la estructura de los datos de perfil que el frontend espera.
// Es CRUCIAL que tu backend envíe los datos en un formato que coincida con esto.
interface Perfil {
    id_persona: number;
    nombre_usuario: string;
    correo: string;
    rol: "admin" | "operario";
    estado: "activo" | "inactivo" | "mantenimiento";
    isVerified?: boolean; // Hacemos isVerified opcional
    foto_url?: string; // Propiedad para la URL de la foto si está directamente en el objeto principal
    createdAt: string;
    updatedAt: string;
    // Si tu backend devuelve el perfil anidado (ej. por una relación Sequelize),
    // debe estar estructurado así:
    perfil?: {
        foto_url?: string; // Propiedad para la URL de la foto si está anidada
    };
}

// --- COMPONENTES DE MODALES PERSONALIZADOS ---
const buttonBaseClasses = "px-6 py-2 rounded-full text-base font-semibold transition transform duration-200 ease-in-out shadow-md bg-green-600 hover:bg-green-700 text-white";

type AlertDialogProps = {
    message: string;
    onClose: () => void;
};

function CustomAlertDialog({ message, onClose }: AlertDialogProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center rounded-md">
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

// --- COMPONENTE PRINCIPAL DE PERFIL ---

export default function PerfilPage() {
    // Usamos el estado local 'perfil' para el formulario y la visualización en esta página,
    // pero lo inicializamos y lo actualizamos a partir del contexto global del usuario.
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
    const router = useRouter();
    const { user: authUser, refreshUser, logout } = useUser(); // Obtén el usuario del contexto y la función refreshUser

    useEffect(() => {
        if (authUser) {
            // Si ya hay un usuario en el contexto, inicializa el estado local con esos datos
            // Aseguramos que isVerified esté presente, incluso si es undefined, para el tipo Perfil
            const initialFotoUrl = authUser.perfil?.foto_url || authUser.foto_url || "/img/user.jpg";
            setPerfil({ ...authUser, foto_url: initialFotoUrl, isVerified: authUser.isVerified ?? false }); // Usamos nullish coalescing para un valor por defecto
            setEditForm({
                nombre_usuario: authUser.nombre_usuario,
                correo: authUser.correo,
                contrasena: "",
            });
            setLoading(false);
        } else {
            // Si no hay usuario en el contexto (ej. recarga de página directa sin token válido),
            // intenta cargarlo del backend. El refreshUser del contexto se encargará de esto si hay token.
            // Si no hay token, el contexto ya debería haber redirigido o marcado como no logeado.
            // Aquí podemos hacer una llamada explícita si el contexto no lo ha hecho aún.
            fetchPerfilFromBackend();
        }
    }, [authUser]); // Dependencia del efecto en authUser para reaccionar a cambios del contexto

    // Esta función se encarga de obtener los datos más recientes del perfil desde el backend.
    // Es llamada al inicio si no hay usuario en el contexto, y después de guardar cambios.
    const fetchPerfilFromBackend = async () => {
        if (!authUser && !localStorage.getItem('token')) {
            // Si no hay usuario en el contexto y no hay token, no podemos hacer la llamada
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            router.push('/login');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // La función refreshUser del contexto ya hace esta llamada y actualiza el estado global
            await refreshUser();
            // Después de refreshUser, authUser debería estar actualizado, lo que disparará el useEffect
            // para actualizar el estado local 'perfil'.
        } catch (err: any) {
            console.error("Error al cargar perfil desde el backend:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Error al cargar el perfil.");
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout(); // Forzar logout si el token es inválido
            }
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

            // Después de guardar los cambios (incluyendo la foto),
            // llama a refreshUser para que el contexto global se actualice.
            await refreshUser();

            setAlertMessage("Perfil actualizado correctamente.");
            setEditForm({ ...editForm, contrasena: "" });
            setFotoArchivo(null);

            // Redirige al menú principal del operario después de un breve retraso
            setTimeout(() => {
                router.push('/home/operario');
            }, 1500);

        } catch (err: any) {
            console.error("Error al actualizar perfil (Operario):", err.response?.data || err.message);
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
                // Previsualizar la imagen inmediatamente en el frontend
                setPerfil(prev => prev ? { ...prev, foto_url: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading && !perfil) return <p className="text-center mt-10 text-gray-600">Cargando perfil...</p>;
    if (error && !perfil) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
    if (!perfil) return <p className="text-center mt-10 text-gray-600">No se pudo cargar el perfil.</p>;

    return (
        <main className="max-w-3xl mx-auto py-10 px-6 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-4xl font-bold text-green-800 mb-8 text-center md:text-left">
                Mi Perfil (Operario)
            </h1>

            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-gray-200">
                {/* Imagen de perfil */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-md">
                        <Image
                            src={perfil.foto_url || "/img/user.jpg"} // Usa /img/user.jpg como fallback consistente
                            alt="Foto de perfil"
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    {/* Input para cambiar foto */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="w-full max-w-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition"
                    />
                </div>

                {/* Formulario */}
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
