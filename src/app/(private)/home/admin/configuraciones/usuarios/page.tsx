// src/app/(private)/home/admin/configuraciones/usuarios/page.tsx (Tu código actual, verificado)
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/app/services/api";

// --- INTERFACES UNIFICADAS CON EL BACKEND ---
interface Usuario {
    id_persona: number;
    nombre_usuario: string;
    correo: string;
    rol: "admin" | "operario";
    estado: "activo" | "inactivo" | "mantenimiento";
    isVerified: boolean;
    createdAt: string;
    foto_url?: string; // Propiedad que viene del backend (directamente)
    perfil?: { // Propiedad que viene del backend (anidada)
        foto_url?: string;
    };
    foto?: string; // Propiedad para el frontend que usará el Image component (mapeada)
}

interface EditForm {
    nombre_usuario: string;
    correo: string;
    rol: "admin" | "operario";
    estado: "activo" | "inactivo" | "mantenimiento";
    isVerified: boolean;
    foto?: string;
}

interface CreateForm {
    nombre_usuario: string;
    correo: string;
    contrasena: string;
    rol: "admin" | "operario";
}

// --- COMPONENTES DE MODALES PERSONALIZADOS ---
const buttonBaseClasses = "px-4 py-2 rounded-full text-sm font-semibold transition transform duration-200 ease-in-out shadow-md bg-green-600 hover:bg-green-700 text-white";

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

type ConfirmDialogProps = {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

function CustomConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
                <p className="text-lg text-gray-800 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className={buttonBaseClasses}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={buttonBaseClasses}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

type CreateUserModalProps = {
    form: CreateForm;
    setForm: (value: CreateForm) => void;
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
    error: string;
};

function CreateUserModal({ form, setForm, onCancel, onConfirm, loading, error }: CreateUserModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Crear Nuevo Usuario</h2>

                <input
                    placeholder="Nombre de usuario"
                    value={form.nombre_usuario}
                    onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500 transition"
                    disabled={loading}
                />
                <input
                    placeholder="Correo electrónico"
                    type="email"
                    value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500 transition"
                    disabled={loading}
                />
                <input
                    placeholder="Contraseña"
                    type="password"
                    value={form.contrasena}
                    onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500 transition"
                    disabled={loading}
                />
                <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value as "admin" | "operario" })}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500 transition"
                    disabled={loading}
                >
                    <option value="operario">Operario</option>
                    <option value="admin">Admin</option>
                </select>

                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className={buttonBaseClasses}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={buttonBaseClasses}
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function GestionUsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editarModalOpen, setEditarModalOpen] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateForm>({
        nombre_usuario: "",
        correo: "",
        contrasena: "",
        rol: "operario",
    });
    const [createError, setCreateError] = useState('');

    const [form, setForm] = useState<EditForm>({
        nombre_usuario: "",
        correo: "",
        rol: "operario",
        estado: "activo",
        isVerified: false,
        foto: "",
    });
    const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);

    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/users');
            const fetchedUsers: Usuario[] = response.data.map((user: any) => ({
                id_persona: user.id_persona,
                nombre_usuario: user.nombre_usuario,
                correo: user.correo,
                rol: user.rol,
                estado: user.estado,
                isVerified: user.isVerified,
                createdAt: user.createdAt || user.created_at,
                foto: user.foto_url || user.perfil?.foto_url || '/images/default-avatar.png', // Mapear la foto_url
            }));
            setUsuarios(fetchedUsers);
        } catch (err: any) {
            console.error('Error al cargar usuarios:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Error al cargar usuarios.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (usuario: Usuario) => {
        setUsuarioEditando(usuario);
        setForm({
            nombre_usuario: usuario.nombre_usuario,
            correo: usuario.correo,
            rol: usuario.rol,
            estado: usuario.estado,
            isVerified: usuario.isVerified,
            foto: usuario.foto,
        });
        setFotoArchivo(null);
        setEditarModalOpen(true);
    };

    const handleGuardarEdicion = async () => {
        if (!usuarioEditando) return;
        setLoading(true);
        setError('');

        try {
            await api.put(`/users/${usuarioEditando.id_persona}`, {
                nombre_usuario: form.nombre_usuario,
                correo: form.correo,
                rol: form.rol,
                estado: form.estado,
                isVerified: form.isVerified,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (fotoArchivo) {
                const formData = new FormData();
                formData.append('profile_picture', fotoArchivo);

                await api.post(`/users/${usuarioEditando.id_persona}/upload-photo`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            setEditarModalOpen(false);
            setUsuarioEditando(null);
            await fetchUsuarios();
            setAlertMessage('Usuario actualizado exitosamente.');
        } catch (err: any) {
            console.error('Error al guardar edición:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Error al guardar cambios.');
        } finally {
            setLoading(false);
        }
    };

    const eliminarUsuario = async (id_persona: number) => {
        setConfirmAction({
            message: "¿Deseas eliminar este usuario de forma permanente? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                setConfirmAction(null);
                setLoading(true);
                setError('');
                try {
                    await api.delete(`/users/${id_persona}`);
                    await fetchUsuarios();
                    setAlertMessage('Usuario eliminado exitosamente.');
                } catch (err: any) {
                    console.error('Error al eliminar usuario:', err.response?.data || err.message);
                    setError(err.response?.data?.error || 'Error al eliminar usuario.');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleCambiarEstado = async (id_persona: number, nuevoEstado: 'activo' | 'inactivo' | 'mantenimiento') => {
        setConfirmAction({
            message: `¿Estás seguro de cambiar el estado de este usuario a '${nuevoEstado === 'mantenimiento' ? 'bloqueado' : nuevoEstado}'?`,
            onConfirm: async () => {
                setConfirmAction(null);
                setLoading(true);
                setError('');
                try {
                    let endpoint = '';
                    if (nuevoEstado === 'activo') {
                        endpoint = `/users/activar/${id_persona}`;
                    } else if (nuevoEstado === 'inactivo') {
                        endpoint = `/users/inactivar/${id_persona}`;
                    } else if (nuevoEstado === 'mantenimiento') {
                        endpoint = `/users/bloquear/${id_persona}`;
                    }

                    if (endpoint) {
                        await api.put(endpoint);
                        await fetchUsuarios();
                        setAlertMessage(`Estado del usuario cambiado a '${nuevoEstado === 'mantenimiento' ? 'bloqueado' : nuevoEstado}' exitosamente.`);
                    } else {
                        setError('Estado inválido para la actualización.');
                    }
                } catch (err: any) {
                    console.error('Error al cambiar estado del usuario:', err.response?.data || err.message);
                    setError(err.response?.data?.error || 'Error al cambiar estado del usuario.');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoArchivo(file);
            const reader = new FileReader();
            reader.onloadend = () => setForm({ ...form, foto: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleCreateUser = async () => {
        setCreateError('');
        setLoading(true);
        try {
            await api.post('/users', createForm);
            setCreateModalOpen(false);
            setCreateForm({ nombre_usuario: "", correo: "", contrasena: "", rol: "operario" });
            await fetchUsuarios();
            setAlertMessage('Usuario creado exitosamente.');
        } catch (err: any) {
            console.error('Error al crear usuario:', err.response?.data || err.message);
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                setCreateError(err.response.data.errors.map((e: any) => e.msg).join(', '));
            } else {
                setCreateError(err.response?.data?.error || 'Error al crear usuario.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && usuarios.length === 0 && !error) return <p className="text-center mt-10 text-gray-600">Cargando usuarios...</p>;
    if (error && !loading) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

    return (
        <main className="min-h-screen p-6 bg-gray-50 font-sans">
            <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Gestión de Usuarios</h1>

            {usuarios.length === 0 && !loading && !error && (
                <p className="text-center text-gray-500 text-lg mt-10">No hay usuarios registrados.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {usuarios.map((usuario) => (
                    <div key={usuario.id_persona} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                        <div className="flex flex-col items-center gap-4 mb-4">
                            <Image
                                src={usuario.foto || '/images/default-avatar.png'}
                                alt={`Foto de perfil de ${usuario.nombre_usuario}`}
                                width={80}
                                height={80}
                                className="rounded-full border-2 border-green-400 object-cover shadow-sm"
                            />
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-green-700 mb-1">{usuario.nombre_usuario}</h2>
                                <p className="text-sm text-gray-600">{usuario.correo}</p>
                            </div>
                        </div>

                        <div className="text-gray-700 space-y-2 mb-4">
                            <p><strong>Rol:</strong> <span className="capitalize text-green-800 font-medium">{usuario.rol}</span></p>
                            <p><strong>Estado:</strong> <span className={`capitalize font-medium ${usuario.estado === 'activo' ? 'text-green-600' : usuario.estado === 'inactivo' ? 'text-orange-500' : 'text-red-600'}`}>
                                {usuario.estado === 'mantenimiento' ? 'Bloqueado' : usuario.estado}
                            </span></p>
                            <p><strong>Verificado:</strong> <span className={`font-medium ${usuario.isVerified ? 'text-green-600' : 'text-red-500'}`}>{usuario.isVerified ? "Sí" : "No"}</span></p>
                            <p className="text-xs text-gray-500 pt-2 border-t border-gray-100 mt-2">
                                <strong>Creado en:</strong>{" "}
                                {new Date(usuario.createdAt).toLocaleString("es-CO", {
                                    dateStyle: "short",
                                    timeStyle: "medium",
                                })}
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <button
                                onClick={() => handleEditar(usuario)}
                                className={buttonBaseClasses}
                                disabled={loading}
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => eliminarUsuario(usuario.id_persona)}
                                className={buttonBaseClasses}
                                disabled={loading}
                            >
                                Eliminar
                            </button>
                            {usuario.estado === 'activo' && (
                                <button
                                    onClick={() => handleCambiarEstado(usuario.id_persona, 'inactivo')}
                                    className={buttonBaseClasses}
                                    disabled={loading}
                                >
                                    Inactivar
                                </button>
                            )}
                            {usuario.estado !== 'activo' && (
                                <button
                                    onClick={() => handleCambiarEstado(usuario.id_persona, 'activo')}
                                    className={buttonBaseClasses}
                                    disabled={loading}
                                >
                                    Activar
                                </button>
                            )}
                            {usuario.estado !== 'mantenimiento' && (
                                <button
                                    onClick={() => handleCambiarEstado(usuario.id_persona, 'mantenimiento')}
                                    className={buttonBaseClasses}
                                    disabled={loading}
                                >
                                    Bloquear
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Edición */}
            {editarModalOpen && (
                <Modal
                    form={form}
                    setForm={setForm}
                    onCancel={() => setEditarModalOpen(false)}
                    onConfirm={handleGuardarEdicion}
                    handleImagenChange={handleImagenChange}
                    loading={loading}
                />
            )}

            {/* Modal para Crear Nuevo Usuario */}
            {createModalOpen && (
                <CreateUserModal
                    form={createForm}
                    setForm={setCreateForm}
                    onCancel={() => { setCreateModalOpen(false); setCreateError(''); }}
                    onConfirm={handleCreateUser}
                    loading={loading}
                    error={createError}
                />
            )}

            {/* Modales de Alerta y Confirmación Personalizados */}
            {alertMessage && <CustomAlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />}
            {confirmAction && (
                <CustomConfirmDialog
                    message={confirmAction.message}
                    onConfirm={confirmAction.onConfirm}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </main>
    );
}

type ModalProps = {
    form: EditForm;
    setForm: (value: EditForm) => void;
    onCancel: () => void;
    onConfirm: () => void;
    handleImagenChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading: boolean;
};

function Modal({ form, setForm, onCancel, onConfirm, handleImagenChange, loading }: ModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Editar Usuario</h2>

                <input
                    placeholder="Nombre de usuario"
                    value={form.nombre_usuario}
                    onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500 transition"
                    disabled={loading}
                />
                <input
                    placeholder="Correo electrónico"
                    value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500 transition"
                    disabled={loading}
                />
                <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value as "admin" | "operario" })}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500 transition"
                    disabled={loading}
                >
                    <option value="operario">Operario</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value as "activo" | "inactivo" | "mantenimiento" })}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500 transition"
                    disabled={loading}
                >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="mantenimiento">Bloqueado (Mantenimiento)</option>
                </select>

                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        id="isVerifiedModal"
                        checked={form.isVerified}
                        onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        disabled={loading}
                    />
                    <label htmlFor="isVerifiedModal" className="text-gray-700">Usuario Verificado</label>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cambiar Foto de Perfil</label>
                    {form.foto && (
                        <Image
                            src={form.foto}
                            alt="Previsualización"
                            width={100}
                            height={100}
                            className="rounded-full object-cover mb-3 border-2 border-gray-200 shadow-sm"
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImagenChange}
                        className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition"
                        disabled={loading}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className={buttonBaseClasses}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={buttonBaseClasses}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}