"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/app/services/api";
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import { UserCircle, Mail, KeyRound, Camera, BadgeCheck, XCircle, AlertTriangle, Loader2, Save, Eye, EyeOff } from "lucide-react";

// --- Interfaces y Tipos ---
interface Perfil {
    id_persona: number;
    nombre_usuario: string;
    correo: string;
    rol: "admin" | "operario";
    estado: "activo" | "inactivo" | "mantenimiento";
    isVerified?: boolean;
    foto_url?: string;
    createdAt: string;
    updatedAt: string;
    perfil?: {
        foto_url?: string;
    };
}

const formInicial = { nombre_usuario: "", correo: "", contrasena: "" };

// --- Componentes de UI ---
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

const StatusBadge = ({ estado }: { estado: string }) => {
    const variants = {
        activo: "bg-teal-100 text-teal-800",
        inactivo: "bg-amber-100 text-amber-800",
        mantenimiento: "bg-slate-200 text-slate-800",
    };
    return <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${variants[estado] || variants.mantenimiento}`}>{estado === 'mantenimiento' ? 'Bloqueado' : estado}</span>;
};

// --- Componente Principal ---
export default function PerfilPage() {
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState(formInicial);
    const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    const [modalMessage, setModalMessage] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });
    
    const router = useRouter();
    const { user: authUser, refreshUser, logout } = useUser();

    useEffect(() => {
        const loadPerfil = async () => {
            if (authUser) {
                const initialFotoUrl = authUser.perfil?.foto_url || authUser.foto_url || "/images/default-avatar.png";
                setPerfil({ ...authUser, foto_url: initialFotoUrl, isVerified: authUser.isVerified ?? false });
                setEditForm({
                    nombre_usuario: authUser.nombre_usuario,
                    correo: authUser.correo,
                    contrasena: "",
                });
                setLoading(false);
            } else {
                setLoading(true);
                try {
                    await refreshUser();
                } catch (err: any) {
                    const errorMessage = err.response?.data?.error || "Error al cargar el perfil.";
                    setModalMessage({ show: true, success: false, title: "Error de Sesión", message: errorMessage });
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        logout();
                    }
                    setLoading(false);
                }
            }
        };
        loadPerfil();
    }, [authUser, refreshUser, logout]);

    const handleGuardar = async () => {
        if (!perfil) return;
        setSaving(true);

        try {
            const { nombre_usuario, correo, contrasena } = editForm;
            const updateData: { nombre_usuario?: string; correo?: string; contrasena?: string } = {};

            if (nombre_usuario !== perfil.nombre_usuario) updateData.nombre_usuario = nombre_usuario;
            if (correo !== perfil.correo) updateData.correo = correo;
            if (contrasena) updateData.contrasena = contrasena;

            if (Object.keys(updateData).length > 0) {
              await api.put("/perfil/update", updateData);
            }

            if (fotoArchivo && perfil.id_persona) {
                const formData = new FormData();
                formData.append('profile_picture', fotoArchivo);
                await api.post(`/users/${perfil.id_persona}/upload-photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            await refreshUser();
            setModalMessage({ show: true, success: true, title: "¡Éxito!", message: "Tu perfil ha sido actualizado correctamente." });
            setEditForm(prev => ({ ...prev, contrasena: "" }));
            setFotoArchivo(null);

        } catch (err: any) {
            setModalMessage({ show: true, success: false, title: "Error al Guardar", message: err.response?.data?.error || "No se pudieron guardar los cambios." });
        } finally {
            setSaving(false);
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

    if (loading || !perfil) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
                <p className="text-slate-500 mt-4">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <UserCircle className="w-10 h-10 text-slate-500" />
                        <span>Mi Perfil</span>
                    </h1>
                    <p className="text-lg text-slate-500 mt-1">Gestiona tu información personal y de acceso.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                        <label className="relative w-24 h-24 mx-auto cursor-pointer group">
                             <Image
                                src={perfil.foto_url || "/images/default-avatar.png"}
                                alt="Foto de perfil"
                                width={96}
                                height={96}
                                className="object-cover w-full h-full rounded-full border-4 border-white shadow-md"
                                unoptimized={true}
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white"/>
                            </div>
                            <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden"/>
                        </label>
                        <h2 className="text-2xl font-bold text-slate-800 mt-4">{perfil.nombre_usuario}</h2>
                        <p className="text-slate-500">{perfil.correo}</p>
                        
                        <div className="text-left space-y-3 mt-6 pt-6 border-t border-slate-200">
                             <p className="flex items-center justify-between"><strong className="font-semibold text-slate-600">Rol:</strong> <span className="capitalize">{perfil.rol}</span></p>
                             <p className="flex items-center justify-between"><strong className="font-semibold text-slate-600">Estado:</strong> <StatusBadge estado={perfil.estado} /></p>
                             <p className="flex items-center justify-between"><strong className="font-semibold text-slate-600">Verificado:</strong> {perfil.isVerified ? <BadgeCheck className="w-5 h-5 text-teal-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</p>
                             <p className="text-xs text-slate-400 text-center pt-4">Miembro desde {new Date(perfil.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Editar Información</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de Usuario</label>
                                <input type="text" className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={editForm.nombre_usuario} onChange={(e) => setEditForm({ ...editForm, nombre_usuario: e.target.value })} />
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                                <input type="email" className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={editForm.correo} onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })} />
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nueva Contraseña</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={editForm.contrasena} onChange={(e) => setEditForm({ ...editForm, contrasena: e.target.value })} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500">
                                        {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Déjalo vacío si no deseas cambiarla.</p>
                            </div>
                        </div>
                         <div className="flex justify-end pt-8 mt-8 border-t border-slate-200">
                            <button onClick={handleGuardar} disabled={saving} className="px-6 py-2.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:bg-teal-400">
                                {saving ? <><Loader2 className="w-5 h-5 animate-spin"/> Guardando...</> : <><Save className="w-5 h-5"/> Guardar Cambios</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {modalMessage.show && <MessageModal title={modalMessage.title} message={modalMessage.message} success={modalMessage.success} onCerrar={() => setModalMessage({ ...modalMessage, show: false })} />}
        </main>
    );
}
