"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, KeyRound, Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Interfaz para las props del Modal ---
interface MessageModalProps {
    title: string;
    message: string;
    onCerrar: () => void;
    success?: boolean; // Propiedad opcional
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

export default function RecpasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showCodeInput, setShowCodeInput] = useState<boolean>(false);
    const [modal, setModal] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });

    // MODIFICADO: Ahora hace una petición al backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setModal({ show: true, success: false, title: "Campo Vacío", message: "Por favor, ingresa tu correo electrónico." });
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/send-reset-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email }),
            });

            const data = await res.json();
            
            if (res.ok) {
                setModal({ show: true, success: true, title: "Correo Enviado", message: data.message || `Se ha enviado un código a ${email}. Por favor, ingrésalo a continuación.` });
                setShowCodeInput(true);
            } else {
                setModal({ show: true, success: false, title: "Error", message: data.error || "Ocurrió un error al enviar el código. Por favor, verifica el correo e inténtalo de nuevo." });
            }
        } catch (error) {
            console.error("Error al enviar código de recuperación:", error);
            setModal({ show: true, success: false, title: "Error de Conexión", message: "No se pudo conectar con el servidor. Inténtalo de nuevo más tarde." });
        } finally {
            setLoading(false);
        }
    };

    // MODIFICADO: Ahora hace una petición al backend y redirige
    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            setModal({ show: true, success: false, title: "Campo Vacío", message: "Por favor, ingresa el código de verificación." });
            return;
        }
        setLoading(true);
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-reset-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email, verificationCode: code }),
            });

            const data = await res.json();

            if (res.ok) {
                setModal({ show: true, success: true, title: "Código Correcto", message: "¡Código verificado! Serás redirigido para restablecer tu contraseña." });
                setTimeout(() => {
                    setModal({ ...modal, show: false });
                    router.push(`/reset-password?email=${email}&code=${code}`);
                }, 2000);
            } else {
                setModal({ show: true, success: false, title: "Error de Verificación", message: data.error || "El código ingresado es incorrecto o ha expirado. Por favor, inténtalo de nuevo." });
            }
        } catch (error) {
            console.error("Error al verificar código:", error);
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
                    <h1 className="text-3xl font-bold text-slate-800">Recuperar Contraseña</h1>
                    <p className="text-slate-500 mt-2">
                        {!showCodeInput ? "Ingresa tu correo para recibir un código." : "Revisa tu bandeja de entrada."}
                    </p>
                </div>

                {!showCodeInput ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="tu.correo@ejemplo.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition duration-300 flex items-center justify-center gap-2 disabled:bg-teal-400"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Enviando...</> : "Enviar Código"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCodeSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="code">
                                Código de Verificación
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Ej: 123456"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition duration-300 flex items-center justify-center gap-2 disabled:bg-teal-400"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Verificando...</> : "Verificar Código"}
                        </button>
                    </form>
                )}

                <div className="text-center mt-6">
                    <Link href="/login" className="inline-flex items-center gap-1 text-teal-600 hover:underline font-medium">
                        <ArrowLeft className="w-4 h-4"/> Volver a Inicio de sesión
                    </Link>
                </div>
            </div>
            {modal.show && <MessageModal title={modal.title} message={modal.message} success={modal.success} onCerrar={() => setModal({ ...modal, show: false })} />}
        </div>
    );
};
