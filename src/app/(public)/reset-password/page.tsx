"use client";
export const dynamic = "force-dynamic";
import React, { useState, Suspense } from 'react'; // Importamos Suspense
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- Interfaz para las props del Modal ---
interface MessageModalProps {
    title: string;
    message: string;
    onCerrar: () => void;
    success?: boolean;
}

// --- Componente de Modal de Mensaje ---
const MessageModal: React.FC<MessageModalProps> = ({ title, message, onCerrar, success = true }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {success ? <CheckCircle2 className="w-16 h-16 mx-auto text-teal-500 mb-4" /> : <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />}
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <button onClick={onCerrar} className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Entendido</button>
        </div>
    </div>
);

// --- Componente principal con la lógica del formulario ---
function ResetPasswordFormWrapper() { // Renombramos la función para que no coincida con el default export
    const router = useRouter();
    const searchParams = useSearchParams();
    // La lectura de searchParams ocurre aquí, dentro del componente cliente.
    const email = searchParams.get('email');
    const code = searchParams.get('code');

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [modal, setModal] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });

    if (!email || !code) {
        // Redirige al usuario si falta el email o el código
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-3xl font-bold text-slate-800">Acceso Denegado</h1>
                    <p className="text-slate-500 mt-2">No se puede acceder a esta página directamente. Por favor, inicia el proceso de recuperación de contraseña desde el inicio de sesión.</p>
                    <Link href="/login" className="inline-flex items-center gap-1 text-teal-600 hover:underline font-medium mt-4">
                        <ArrowLeft className="w-4 h-4"/> Volver a Inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... (Tu lógica de validación y fetch, sin cambios)
        if (password.length < 8) {
            setModal({ show: true, success: false, title: "Contraseña Inválida", message: "La contraseña debe tener al menos 8 caracteres." });
            return;
        }
        if (password !== confirmPassword) {
            setModal({ show: true, success: false, title: "Error", message: "Las contraseñas no coinciden. Por favor, verifícalas." });
            return;
        }

        setLoading(true);

        try {
            // Asegúrate de usar la URL de tu backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, verificationCode: code, newPassword: password }),
            });

            const data = await res.json();
            
            if (res.ok) {
                setModal({ show: true, success: true, title: "¡Éxito!", message: "Tu contraseña ha sido restablecida. Ya puedes iniciar sesión con tu nueva contraseña." });
                setTimeout(() => {
                    setModal({ ...modal, show: false });
                    router.push('/login');
                }, 3000);
            } else {
                setModal({ show: true, success: false, title: "Error", message: data.error || "Ocurrió un error al intentar restablecer la contraseña." });
            }
        } catch (error) {
            console.error("Error al restablecer contraseña:", error);
            setModal({ show: true, success: false, title: "Error de Conexión", message: "No se pudo conectar con el servidor. Inténtalo de nuevo más tarde." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                <div className="text-center mb-8">
                    <Link href="/">
                        <Image src="/images/logo-black-3.svg" alt="Logo de Hotitech" width={150} height={40} className="mx-auto mb-4" />
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800">Nueva Contraseña</h1>
                    <p className="text-slate-500 mt-2">Ingresa tu nueva contraseña para acceder a tu cuenta.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 pl-10 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Ingresa tu nueva contraseña"
                            />
                            <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="confirm-password">
                            Confirmar Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full p-3 pl-10 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Confirma tu nueva contraseña"
                            />
                            <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition duration-300 flex items-center justify-center gap-2 disabled:bg-teal-400"
                    >
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Guardando...</> : "Guardar Contraseña"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link href="/login" className="inline-flex items-center gap-1 text-teal-600 hover:underline font-medium">
                        <ArrowLeft className="w-4 h-4"/> Volver a Inicio de sesión
                    </Link>
                </div>
            </div>
            {modal.show && <MessageModal title={modal.title} message={modal.message} success={modal.success} onCerrar={() => setModal({ ...modal, show: false })} />}
        </div>
    );
}

// --- Componente que se exporta y añade el Suspense Boundary ---
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordFormWrapper />
        </Suspense>
    );
}
