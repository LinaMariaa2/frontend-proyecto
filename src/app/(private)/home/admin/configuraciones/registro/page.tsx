"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import  api  from '@/app/services/api'; 
import { UserPlus, Mail, KeyRound, User, UserCog, Loader2, Send, ShieldCheck, Eye, EyeOff, AlertTriangle, BadgeCheck } from 'lucide-react';

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

export default function RegistroUsuarioPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        nombre_usuario: '',
        correo: '',
        contrasena: '',
        confirmPassword: '',
        rol: 'operario',
    });
    const [codigo, setCodigo] = useState('');
    
    const [verificando, setVerificando] = useState(false);
    const [expiraEn, setExpiraEn] = useState(0); 
    const [registrationEmail, setRegistrationEmail] = useState(''); 
    
    const [errores, setErrores] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [modal, setModal] = useState<{ show: boolean; title: string; message: string; success: boolean }>({ show: false, title: '', message: '', success: true });

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (verificando && expiraEn > 0) {
            timer = setInterval(() => setExpiraEn((prev) => prev - 1), 1000);
        } else if (expiraEn === 0 && verificando) {
            setErrores((prev) => ({ ...prev, codigo: 'El código ha expirado. Solicita uno nuevo.' }));
        }
        return () => clearInterval(timer);
    }, [verificando, expiraEn]);

    const formatearTiempo = (segundos: number) => {
        const min = Math.floor(segundos / 60);
        const sec = segundos % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const validarFormulario = (): boolean => {
        const nuevosErrores: { [key: string]: string } = {};
        if (!form.nombre_usuario.trim()) nuevosErrores.nombre_usuario = 'El nombre de usuario es obligatorio';
        if (!form.correo.trim()) nuevosErrores.correo = 'El correo es obligatorio';
        else if (!/\S+@\S+\.\S+/.test(form.correo)) nuevosErrores.correo = 'El formato del correo es inválido';
        if (!form.contrasena) nuevosErrores.contrasena = 'La contraseña es obligatoria';
        else if (form.contrasena.length < 10 || !/[A-Z]/.test(form.contrasena) || !/[0-9]/.test(form.contrasena)) {
            nuevosErrores.contrasena = 'Debe tener al menos 10 caracteres, una mayúscula y un número';
        }
        if (form.contrasena !== form.confirmPassword) nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        setLoading(true);
        try {
            await api.post('/auth/register', { ...form, nombre_usuario: form.nombre_usuario.trim() });
            setModal({ show: true, success: true, title: "Registro Exitoso", message: "Se ha enviado un código de verificación a tu correo." });
            setVerificando(true);
            setExpiraEn(600);
            setRegistrationEmail(form.correo);
        } catch (err: any) {
            const message = err.response?.data?.error || 'No se pudo completar el registro.';
            setModal({ show: true, success: false, title: "Error de Registro", message });
        } finally {
            setLoading(false);
        }
    };
    
    const verificarCodigo = async () => {
        if (!codigo.trim() || expiraEn <= 0) {
            setErrores({ codigo: !codigo.trim() ? 'El código es obligatorio.' : 'El código ha expirado.' });
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/verify-email', { correo: registrationEmail, verificationCode: codigo });
            setModal({ show: true, success: true, title: "¡Cuenta Verificada!", message: "Tu correo ha sido verificado. Ahora puedes iniciar sesión."});
            // Reset state
            setVerificando(false);
            setForm({ nombre_usuario: '', correo: '', contrasena: '', confirmPassword: '', rol: 'operario' });
            setCodigo('');
        } catch (err: any) {
             setModal({ show: true, success: false, title: "Error de Verificación", message: err.response?.data?.error || 'Código inválido o expirado.'});
        } finally {
            setLoading(false);
        }
    };

    const reenviarCodigo = async () => {
        setLoading(true);
        try {
            await api.post('/auth/resend-verification-code', { correo: registrationEmail });
            setModal({ show: true, success: true, title: "Código Reenviado", message: "Se ha enviado un nuevo código a tu correo."});
            setExpiraEn(600);
        } catch (err: any) {
            setModal({ show: true, success: false, title: "Error", message: "No se pudo reenviar el código. Intenta de nuevo."});
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="w-full bg-slate-50 min-h-screen flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-6 border border-slate-200">
                <div className="text-center">
                    <UserPlus className="w-12 h-12 mx-auto text-teal-500 mb-2"/>
                    <h1 className="text-3xl font-bold text-slate-800">Crear Nueva Cuenta</h1>
                    <p className="text-slate-500 mt-1">Registra un nuevo usuario en el sistema.</p>
                </div>

                {!verificando ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de Usuario</label>
                            <input type="text" value={form.nombre_usuario} onChange={(e) => setForm({...form, nombre_usuario: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}/>
                            {errores.nombre_usuario && <p className="text-red-500 text-sm mt-1">{errores.nombre_usuario}</p>}
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                            <input type="email" value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}/>
                            {errores.correo && <p className="text-red-500 text-sm mt-1">{errores.correo}</p>}
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={form.contrasena} onChange={(e) => setForm({...form, contrasena: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500"><Eye className="w-5 h-5"/></button>
                            </div>
                            {errores.contrasena && <p className="text-red-500 text-sm mt-1">{errores.contrasena}</p>}
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar Contraseña</label>
                            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}/>
                            {errores.confirmPassword && <p className="text-red-500 text-sm mt-1">{errores.confirmPassword}</p>}
                         </div>
                         <div>
                             <label className="block text-sm font-semibold text-slate-700 mb-2">Rol</label>
                             <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as "admin" | "operario" })} className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}>
                                 <option value="operario">Operario</option>
                                 <option value="admin">Admin</option>
                             </select>
                         </div>
                         <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:bg-teal-400" disabled={loading}>
                             {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Registrando...</> : "Crear Cuenta"}
                         </button>
                    </form>
                ) : (
                    <div className="bg-teal-50 p-6 border border-teal-200 rounded-lg space-y-4 text-center">
                        <ShieldCheck className="w-10 h-10 mx-auto text-teal-600"/>
                        <p className="text-slate-700">Ingresa el código de 6 dígitos enviado a <strong>{registrationEmail}</strong>.</p>
                        <p className="font-bold text-lg text-slate-800">Expira en: {formatearTiempo(expiraEn)}</p>
                        <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-full text-center tracking-[0.5em] font-bold text-xl border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="------" maxLength={6} disabled={loading}/>
                        {errores.codigo && <p className="text-red-500 text-sm">{errores.codigo}</p>}
                        
                        <button onClick={verificarCodigo} className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:bg-teal-400" disabled={loading}>
                             {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Verificando...</> : "Verificar Código"}
                        </button>
                        <button onClick={reenviarCodigo} className="text-sm text-teal-700 hover:underline disabled:text-slate-400" disabled={loading || expiraEn > 540}>Reenviar código</button>
                    </div>
                )}
            </div>
            {modal.show && <MessageModal title={modal.title} message={modal.message} success={modal.success} onCerrar={() => setModal({ ...modal, show: false })} />}
        </main>
    );
}
