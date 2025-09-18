
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/app/services/api";
import { Users, Search, PlusCircle, AlertTriangle, BadgeCheck, Loader2, Trash2, Edit, Shield, ShieldOff, UserCheck, UserX, UserCog, Camera, XCircle, User } from "lucide-react";

// --- Interfaces y Tipos ---
interface Usuario {
    id_persona: number;
    nombre_usuario: string;
    correo: string;
    rol: "admin" | "operario";
    estado: "activo" | "inactivo" | "mantenimiento";
    isVerified: boolean;
    createdAt: string;
    foto_url?: string;
    perfil?: { foto_url?: string; };
    foto?: string;
}

// --- Modales ---
const MessageModal = ({ title, message, onCerrar, success = true }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {success ? <BadgeCheck className="w-16 h-16 mx-auto text-teal-500 mb-4" /> : <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />}
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <button onClick={onCerrar} className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Entendido</button>
        </div>
    </div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition">Cancelar</button>
                <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition">Confirmar</button>
            </div>
        </div>
    </div>
);

// --- Componentes de Badges ---
const StatusBadge = ({ estado }: { estado: string }) => {
    const variants = {
        activo: "bg-teal-100 text-teal-800",
        inactivo: "bg-amber-100 text-amber-800",
        mantenimiento: "bg-slate-200 text-slate-800",
    };
    return <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${variants[estado] || variants.mantenimiento}`}>{estado === 'mantenimiento' ? 'Bloqueado' : estado}</span>;
};

const RoleBadge = ({ rol }: { rol: string }) => {
    const variants = {
        admin: "bg-indigo-100 text-indigo-800",
        operario: "bg-sky-100 text-sky-800",
    };
    return <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${variants[rol] || ''}`}>{rol}</span>;
};

// --- Componente Principal ---
export default function GestionUsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('');

    const [modal, setModal] = useState<{ type: 'create' | 'edit' | 'confirm' | 'message' | null; data?: any }>({ type: null });

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            const fetchedUsers = response.data.map((user: any) => ({
                ...user,
                foto: user.foto_url || user.perfil?.foto_url || '/images/default-avatar.png',
            }));
            setUsuarios(fetchedUsers);
        } catch (err: any) {
            setModal({ type: 'message', data: { title: "Error de Carga", message: "No se pudieron obtener los usuarios.", success: false }});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const filteredUsuarios = usuarios.filter(usuario => {
        const matchesRol = !filtroRol || usuario.rol === filtroRol;
        const matchesBusqueda = usuario.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase()) || usuario.correo.toLowerCase().includes(busqueda.toLowerCase());
        return matchesRol && matchesBusqueda;
    });

    const handleCreate = async (formData) => {
        setActionLoading(true);
        try {
            await api.post('/users', formData);
            await fetchUsuarios();
            setModal({ type: 'message', data: { title: "Éxito", message: "Usuario creado correctamente." }});
        } catch (err: any) {
             const errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || "No se pudo crear el usuario.";
             setModal({ type: 'message', data: { title: "Error al Crear", message: errorMessage, success: false }});
        } finally {
            setActionLoading(false);
        }
    }

    const handleUpdate = async (id, formData, fotoFile) => {
        setActionLoading(true);
        try {
            await api.put(`/users/${id}`, formData);
            if (fotoFile) {
                const photoFormData = new FormData();
                photoFormData.append('profile_picture', fotoFile);
                await api.post(`/users/${id}/upload-photo`, photoFormData);
            }
            await fetchUsuarios();
            setModal({ type: 'message', data: { title: "Éxito", message: "Usuario actualizado correctamente." }});
        } catch (err: any) {
             setModal({ type: 'message', data: { title: "Error al Actualizar", message: "No se pudieron guardar los cambios.", success: false }});
        } finally {
            setActionLoading(false);
        }
    }

    const handleDelete = (id) => {
        setModal({ type: 'confirm', data: {
            title: "¿Eliminar Usuario?",
            message: "Esta acción es permanente y no se puede deshacer. ¿Continuar?",
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await api.delete(`/users/${id}`);
                    await fetchUsuarios();
                    setModal({ type: 'message', data: { title: "Eliminado", message: "El usuario ha sido eliminado." }});
                } catch (err) {
                    setModal({ type: 'message', data: { title: "Error", message: "No se pudo eliminar el usuario.", success: false }});
                } finally {
                    setActionLoading(false);
                }
            }
        }});
    }

    return (
        <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <Users className="w-10 h-10 text-slate-500" />
                        <span>Gestión de Usuarios</span>
                    </h1>
                    <p className="text-lg text-slate-500 mt-1">Administra los usuarios del sistema.</p>
                </div>
                <Link
                    href="/home/admin/configuraciones/registro"
                    className="px-5 py-2.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Crear Usuario</span>
                </Link>
            </div>
            
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                         <input type="text" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full border border-slate-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="w-full sm:w-auto border border-slate-300 py-2 px-4 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Todos los Roles</option>
                        <option value="admin">Admin</option>
                        <option value="operario">Operario</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16"><Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto"/></div>
            ) : filteredUsuarios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsuarios.map(user => (
                        <div key={user.id_persona} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
                            {user.foto && user.foto !== '/images/default-avatar.png' ? (
                                <Image src={user.foto} alt={`Foto de ${user.nombre_usuario}`} width={80} height={80} className="rounded-full object-cover mb-4 border-4 border-white shadow-md"/>
                            ) : (
                                <div className="w-20 h-20 rounded-full mb-4 border-4 border-white shadow-md bg-slate-200 flex items-center justify-center">
                                    <User className="w-10 h-10 text-slate-500" />
                                </div>
                            )}
                            <h3 className="font-bold text-lg text-slate-800">{user.nombre_usuario}</h3>
                            <p className="text-sm text-slate-500 mb-4">{user.correo}</p>
                            <div className="flex flex-wrap justify-center gap-2 mb-4">
                               <RoleBadge rol={user.rol}/>
                               <StatusBadge estado={user.estado}/>
                            </div>
                             <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
                                {user.isVerified ? <BadgeCheck className="w-5 h-5 text-teal-500"/> : <XCircle className="w-5 h-5 text-slate-400"/>}
                                <span>{user.isVerified ? 'Verificado' : 'No Verificado'}</span>
                            </div>
                            <div className="flex justify-center items-center gap-2 w-full mt-auto pt-4 border-t border-slate-200">
                                <button onClick={() => setModal({ type: 'edit', data: user })} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-md" title="Editar"><Edit className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(user.id_persona)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-md" title="Eliminar"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Users className="w-12 h-12"/>
                        <p className="font-semibold text-lg">No se encontraron usuarios</p>
                        <p>Intenta ajustar la búsqueda o los filtros.</p>
                    </div>
                </div>
            )}

            {/* Renderizar Modales */}
            {modal.type === 'message' && <MessageModal {...modal.data} onCerrar={() => setModal({type: null})} />}
            {modal.type === 'confirm' && <ConfirmModal {...modal.data} onCancel={() => setModal({type: null})} />}
            {modal.type === 'create' && <CreateUserModal loading={actionLoading} onCancel={() => setModal({ type: null })} onConfirm={handleCreate} />}
            {modal.type === 'edit' && <EditUserModal loading={actionLoading} user={modal.data} onCancel={() => setModal({ type: null })} onConfirm={handleUpdate} />}
        </main>
    );
}

// --- Modales de Creación y Edición ---
function CreateUserModal({ onCancel, onConfirm, loading }) {
    const [form, setForm] = useState({ nombre_usuario: "", correo: "", contrasena: "", rol: "operario" });

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                 <h2 className="text-2xl font-bold text-slate-800 mb-6">Crear Nuevo Usuario</h2>
                 <div className="space-y-4">
                     <input placeholder="Nombre de usuario" value={form.nombre_usuario} onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading} />
                     <input placeholder="Correo electrónico" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading} />
                     <input placeholder="Contraseña" type="password" value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading} />
                     <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as "admin" | "operario" })} className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}>
                         <option value="operario">Operario</option>
                         <option value="admin">Admin</option>
                     </select>
                 </div>
                 <div className="flex justify-end gap-4 mt-8">
                     <button onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition" disabled={loading}>Cancelar</button>
                     <button onClick={() => onConfirm(form)} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition flex items-center gap-2 disabled:bg-teal-400" disabled={loading}>
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Creando...</> : "Crear"}
                    </button>
                 </div>
            </div>
        </div>
    );
}

function EditUserModal({ user, onCancel, onConfirm, loading }) {
    const [form, setForm] = useState({ ...user, foto_url: user.foto });
    const [fotoFile, setFotoFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setForm(prev => ({ ...prev, foto_url: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                 <h2 className="text-2xl font-bold text-slate-800 mb-6">Editar Usuario</h2>
                 <div className="flex flex-col items-center mb-6">
                    <label className="relative w-24 h-24 cursor-pointer group">
                        {form.foto_url && form.foto_url !== '/images/default-avatar.png' ? (
                            <Image src={form.foto_url} alt="Foto de perfil" width={96} height={96} className="rounded-full object-cover border-4 border-white shadow-md"/>
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-slate-200 flex items-center justify-center">
                                <User className="w-12 h-12 text-slate-500" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white"/>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
                    </label>
                 </div>
                 <div className="space-y-4">
                     <input placeholder="Nombre de usuario" value={form.nombre_usuario} onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading} />
                     <input placeholder="Correo electrónico" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading} />
                     <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as "admin" | "operario" })} className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}>
                         <option value="operario">Operario</option>
                         <option value="admin">Admin</option>
                     </select>
                     <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as "activo" | "inactivo" | "mantenimiento" })} className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}>
                         <option value="activo">Activo</option>
                         <option value="inactivo">Inactivo</option>
                         <option value="mantenimiento">Bloqueado</option>
                     </select>
                     <div className="flex items-center justify-between p-3 border border-slate-300 rounded-lg">
                        <label className="text-slate-700 font-semibold">Verificado:</label>
                        <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} className="h-5 w-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"/>
                     </div>
                 </div>
                 <div className="flex justify-end gap-4 mt-8">
                     <button onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition" disabled={loading}>Cancelar</button>
                     <button onClick={() => onConfirm(user.id_persona, form, fotoFile)} className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition flex items-center gap-2 disabled:bg-teal-400" disabled={loading}>
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Guardando...</> : "Guardar"}
                    </button>
                 </div>
             </div>
        </div>
    )
}
