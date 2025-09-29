"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/app/services/api"; // Asumiendo que 'api' es tu instancia de Axios configurada
import { UserCircle, Camera, BadgeCheck, XCircle, AlertTriangle, Loader2, Save, Eye, EyeOff } from "lucide-react";
import axios from "axios"; // Asegúrate de importar axios para usar axios.isAxiosError

// --- Interfaces y Tipos ---

// Interfaz para el perfil de usuario (se mantiene como la definiste)
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
    perfil?: { // Esto parece redundante, un Perfil ya tiene foto_url
        foto_url?: string;
    };
}

// Interfaz para el formulario de edición
interface EditForm {
    nombre_usuario: string;
    correo: string;
    contrasena: string;
}

// Interfaz para el estado del modal de mensajes
interface ModalMessageState {
    show: boolean;
    title: string;
    message: string;
    success: boolean;
}

// Interfaz para las props del MessageModal
interface MessageModalProps {
    title: string;
    message: string;
    onCerrar: () => void;
    success?: boolean; // 'success' es opcional, por defecto true
}

// Interfaz para las props del StatusBadge
interface StatusBadgeProps {
    estado: Perfil['estado']; // El estado debe ser uno de los tipos definidos en Perfil
}


const formInicial: EditForm = { nombre_usuario: "", correo: "", contrasena: "" }; // Tipado para formInicial

// --- Modales Personalizados (Reutilizados) ---
// CORRECCIÓN 1: Tipado de props en MessageModal
const MessageModal = ({ title, message, onCerrar, success = true }: MessageModalProps) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {success ? <BadgeCheck className="w-16 h-16 mx-auto text-teal-500 mb-4" /> : <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />}
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <button onClick={onCerrar} className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Entendido</button>
        </div>
    </div>
);

// --- Componente de Indicador de Estado ---
// CORRECCIÓN 2: Tipado de props en StatusBadge
const StatusBadge = ({ estado }: StatusBadgeProps) => {
    const variants: Record<Perfil['estado'], string> = { // Tipado del objeto variants
        activo: "bg-teal-100 text-teal-800",
        inactivo: "bg-amber-100 text-amber-800",
        mantenimiento: "bg-slate-200 text-slate-800",
    };
    // Se usa el fallback a 'mantenimiento' si el estado no coincide con los definidos
    return <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${variants[estado] || variants.mantenimiento}`}>{estado}</span>;
};


// --- Componente Principal ---
export default function PerfilPage() {
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState<EditForm>(formInicial); // Tipado para el estado editForm
    const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    // Tipado para el estado modalMessage
    const [modalMessage, setModalMessage] = useState<ModalMessageState>({ show: false, title: '', message: '', success: true });

    // Función para cargar el perfil del usuario
    const fetchPerfil = async () => {
        try {
            const response = await api.get('/perfil');
            const fetchedPerfil: Perfil = response.data;
            // Prioriza fetchedPerfil.perfil?.foto_url (si existe y es diferente)
            const fotoUrl = fetchedPerfil.perfil?.foto_url || fetchedPerfil.foto_url || "/images/default-avatar.png";
            
            setPerfil({ ...fetchedPerfil, foto_url: fotoUrl });
            setEditForm({
                nombre_usuario: fetchedPerfil.nombre_usuario,
                correo: fetchedPerfil.correo,
                contrasena: "", // Siempre en blanco para que el usuario la introduzca si quiere cambiarla
            });
        } catch (err) { // Error tipado como 'unknown' por defecto
            let errorMessage = "No se pudo cargar la información del perfil.";
            // CORRECCIÓN 3: Usar axios.isAxiosError(err)
            if (axios.isAxiosError(err)) { 
                errorMessage = err.response?.data?.error || errorMessage;
            }
            setModalMessage({ show: true, success: false, title: "Error de Carga", message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar el perfil al montar el componente
    useEffect(() => {
        fetchPerfil();
    }, []); // Se ejecuta solo una vez al montar

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

    // CORRECCIÓN 4: Mover handleGuardar dentro del componente PerfilPage
    // para que pueda acceder a los estados (editForm, setSaving, setModalMessage, etc.)
    const handleGuardar = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Previene el comportamiento por defecto del botón si estuviera en un form
        setSaving(true);
        try {
            const dataToUpdate: Partial<Perfil & { contrasena?: string }> = {
                nombre_usuario: editForm.nombre_usuario,
                correo: editForm.correo,
            };

            // Solo incluye la contraseña si el usuario la ha introducido
            if (editForm.contrasena) {
                dataToUpdate.contrasena = editForm.contrasena;
            }

            // Realiza la petición de actualización del perfil
            await api.put('/perfil', dataToUpdate);

            // Si hay un archivo de foto, súbelo
            if (fotoArchivo) {
                const formData = new FormData();
                formData.append('foto', fotoArchivo);
                // Asumiendo que tu API tiene un endpoint para subir fotos de perfil
                await api.post('/perfil/foto', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            // Vuelve a cargar el perfil para reflejar los cambios (incluida la foto si se subió)
            await fetchPerfil(); 
            setModalMessage({ show: true, success: true, title: "Éxito", message: "Perfil actualizado correctamente." });

        } catch (err) {
            let errorMessage = "Error al actualizar el perfil.";
            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.error || errorMessage;
            }
            setModalMessage({ show: true, success: false, title: "Error de Actualización", message: errorMessage });
        } finally {
            setSaving(false);
        }
    };


    // --- Renderizado Condicional al Principio (Buenas prácticas de React) ---
    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
                <p className="text-slate-500 mt-4">Cargando perfil...</p>
            </div>
        );
    }
    
    if (!perfil) return null; // Si no hay perfil y no está cargando, no se renderiza nada

    // CORRECCIÓN 5: Eliminado el '}' errante que cerraba la función principal
    // La llave estaba incorrectamente ubicada después de `if (!perfil) return null;`
    // y antes de la declaración de `handleGuardar`.

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
                {/* Columna de Información del Perfil */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                        <label className="relative w-24 h-24 mx-auto cursor-pointer group">
                            <Image
                                src={perfil.foto_url || "/images/default-avatar.png"}
                                alt="Foto de perfil"
                                width={96}
                                height={96}
                                className="object-cover w-full h-full rounded-full border-4 border-white shadow-md"
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

                {/* Columna del Formulario de Edición */}
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
                            {/* Conectado el handleGuardar al botón */}
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