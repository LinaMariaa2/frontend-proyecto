
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/app/services/api";

interface Usuario {
    id_persona: number;
    nombre_usuario: string;
    correo: string;
    rol: "admin" | "operario";
    estado: "activo" | "inactivo" | "mantenimiento";
    isVerified: boolean;
    createdAt: string;
    foto_url?: string; 
    perfil?: {
        foto_url?: string;
    };
    foto?: string;
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


const buttonBaseClasses = "px-4 py-2 rounded-full text-sm font-semibold transition transform duration-200 ease-in-out shadow-md bg-green-600 hover:bg-green-700 text-white";
const iconButtonClasses = "p-1 rounded-full hover:bg-gray-200 transition duration-150 ease-in-out";

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

type EditUserModalProps = {
    form: EditForm;
    setForm: (value: EditForm) => void;
    onCancel: () => void;
    onConfirm: () => void;
    handleImagenChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading: boolean;
};

function EditUserModal({ form, setForm, onCancel, onConfirm, handleImagenChange, loading }: EditUserModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Editar Usuario</h2>

                <div className="flex flex-col items-center mb-4">
                    <Image
                        src={form.foto || '/images/default-avatar.png'}
                        alt="Foto de perfil"
                        width={100}
                        height={100}
                        className="rounded-full border-2 border-green-400 object-cover shadow-sm mb-4"
                    />
                    <label htmlFor="upload-photo" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-full transition duration-200">
                        Cambiar Foto
                        <input
                            id="upload-photo"
                            type="file"
                            accept="image/*"
                            onChange={handleImagenChange}
                            className="hidden"
                            disabled={loading}
                        />
                    </label>
                </div>

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
                    <option value="mantenimiento">Bloqueado</option>
                </select>
                <div className="flex items-center justify-between mb-6">
                    <label htmlFor="isVerified" className="text-gray-700 font-medium">Verificado:</label>
                    <input
                        id="isVerified"
                        type="checkbox"
                        checked={form.isVerified}
                        onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                        className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                        disabled={loading}
                    />
                </div>

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
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
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
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('nombre_usuario'); // Default filter

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

    const [editForm, setEditForm] = useState<EditForm>({
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
        setEditForm({
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
                nombre_usuario: editForm.nombre_usuario,
                correo: editForm.correo,
                rol: editForm.rol,
                estado: editForm.estado,
                isVerified: editForm.isVerified,
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
            reader.onloadend = () => setEditForm({ ...editForm, foto: reader.result as string });
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

    const filteredUsuarios = usuarios.filter(usuario => {
        const searchValue = busqueda.toLowerCase();
        if (filtroActivo === 'nombre_usuario') {
            return usuario.nombre_usuario.toLowerCase().includes(searchValue);
        }
        if (filtroActivo === 'correo') {
            return usuario.correo.toLowerCase().includes(searchValue);
        }
        if (filtroActivo === 'rol') {
            return usuario.rol.toLowerCase().includes(searchValue);
        }
        if (filtroActivo === 'estado') {
            const estadoDisplay = usuario.estado === 'mantenimiento' ? 'bloqueado' : usuario.estado;
            return estadoDisplay.toLowerCase().includes(searchValue);
        }
        return true;
    });

    if (loading && usuarios.length === 0 && !error) return <p className="text-center mt-10 text-gray-600">Cargando usuarios...</p>;
    if (error && !loading) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

    return (
        <main className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen transition-all duration-300">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-green-700">Gestión de Usuarios</h1>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-700 transition duration-200"
                >
                    Crear Nuevo Usuario
                </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder={`Buscar por ${filtroActivo === 'nombre_usuario' ? 'nombre de usuario' : filtroActivo === 'correo' ? 'correo' : filtroActivo === 'rol' ? 'rol' : 'estado'}`}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full border border-gray-300 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500"
                >
                    <option value="nombre_usuario">Nombre de Usuario</option>
                    <option value="correo">Correo</option>
                    <option value="rol">Rol</option>
                    <option value="estado">Estado</option>
                </select>
            </div>

            {filteredUsuarios.length === 0 && !loading && !error && (
                <p className="text-center text-gray-500 text-lg mt-10">No se encontraron usuarios con los filtros aplicados.</p>
            )}

            <div className="flex flex-col gap-3">
                {filteredUsuarios.map((usuario) => (
                    <div
                        key={usuario.id_persona}
                        className="bg-white shadow rounded-lg px-4 py-3 border-l-4 border-green-500 flex justify-between items-center transition-all duration-200 hover:shadow-md hover:border-green-600"
                    >
                        <div className="flex items-center gap-4">
                            <Image
                                src={usuario.foto || '/images/default-avatar.png'}
                                alt={`Foto de perfil de ${usuario.nombre_usuario}`}
                                width={50}
                                height={50}
                                className="rounded-full object-cover border border-gray-200"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-green-800">{usuario.nombre_usuario}</h3>
                                <p className="text-sm text-gray-600">{usuario.correo}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                                        {usuario.rol}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        usuario.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                        usuario.estado === 'inactivo' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    } capitalize`}>
                                        {usuario.estado === 'mantenimiento' ? 'Bloqueado' : usuario.estado}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        usuario.isVerified ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {usuario.isVerified ? "Verificado" : "No Verificado"}
                                    </span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        Creado: {new Date(usuario.createdAt).toLocaleDateString("es-CO", {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1">
                            {/* Icono de Editar */}
                            <button
                                onClick={() => handleEditar(usuario)}
                                className={iconButtonClasses}
                                title="Editar"
                                disabled={loading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 18.07a4.5 4.5 0 0 1-1.897 1.13L6 20l1.123-3.723a4.5 4.5 0 0 1 1.13-1.897l8.205-8.205Zm1.652 1.652 1.104-1.104" />
                                </svg>
                            </button>

                            {/* Icono de Eliminar */}
                            <button
                                onClick={() => eliminarUsuario(usuario.id_persona)}
                                className={iconButtonClasses}
                                title="Eliminar"
                                disabled={loading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.924a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m-1.022.165 4.125 4.125m-6.68 1.968c-.604 0-1.2-.107-1.75-.32M8.88 5.79h6.24L12 2l-3.12 3.79Z" />
                                </svg>
                            </button>

                            {/* Botones de Cambio de Estado */}
                            {usuario.estado === 'activo' && (
                                <button
                                    onClick={() => handleCambiarEstado(usuario.id_persona, 'inactivo')}
                                    className={iconButtonClasses}
                                    title="Inactivar"
                                    disabled={loading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-orange-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 12 3a9 9 0 0 0-6.364 15.364M18.364 18.364L12 12m6.364 6.364l-6.364-6.364M6 6l6 6m0 0l-6 6M6 6h.01M18 18h.01" />
                                    </svg>
                                </button>
                            )}
                            {usuario.estado !== 'activo' && (
                                <button
                                    onClick={() => handleCambiarEstado(usuario.id_persona, 'activo')}
                                    className={iconButtonClasses}
                                    title="Activar"
                                    disabled={loading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </button>
                            )}
                            {usuario.estado !== 'mantenimiento' && (
                                <button
                                    onClick={() => handleCambiarEstado(usuario.id_persona, 'mantenimiento')}
                                    className={iconButtonClasses}
                                    title="Bloquear"
                                    disabled={loading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 20.25 4.5H3.75A2.25 2.25 0 0 0 1.5 6.75v11.25A2.25 2.25 0 0 0 3.75 21Z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Edición */}
            {editarModalOpen && (
                <EditUserModal
                    form={editForm}
                    setForm={setEditForm}
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