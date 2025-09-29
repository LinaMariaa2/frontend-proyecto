"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Se mantiene por si se usa más adelante
import api from '@/app/services/api'; 
// CORRECCIÓN 1: Se eliminan imports no usados para limpiar ESLint
import { UserPlus, Loader2, ShieldCheck, Eye, EyeOff, AlertTriangle, BadgeCheck, ClipboardList } from 'lucide-react'; 
import axios from 'axios'; 

// --- Tipado para el Modal ---
interface MessageModalProps {
    title: string;
    message: string;
    onCerrar: () => void;
    success?: boolean;
}

// --- Tipado para el estado del formulario ---
interface FormState {
    nombre_usuario: string;
    correo: string;
    cedula: string;
    contrasena: string;
    confirmPassword: string;
    rol: 'operario' | 'admin'; // Definir los roles permitidos
}

// --- Tipado para el estado del modal (reutiliza MessageModalProps si son idénticos) ---
interface ModalState {
    show: boolean;
    title: string;
    message: string;
    success: boolean;
}


// --- Modales ---
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


export default function RegistroUsuarioPage() {
    // CORRECCIÓN 2: Tipado del estado 'form'
    const [form, setForm] = useState<FormState>({
        nombre_usuario: '',
        correo: '',
        cedula: '',
        contrasena: '',
        confirmPassword: '',
        rol: 'operario',
    });
    const [codigo, setCodigo] = useState('');
    
    const [verificando, setVerificando] = useState(false);
    const [expiraEn, setExpiraEn] = useState(0); 
    const [registrationEmail, setRegistrationEmail] = useState(''); 
    
    // CORRECCIÓN 3: Tipado del estado 'errores'
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [autocompleting, setAutocompleting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // CORRECCIÓN 4: Tipado del estado 'modal'
    const [modal, setModal] = useState<ModalState>({ show: false, title: '', message: '', success: true });
    
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // useRouter se asigna pero no se usa explícitamente en el código proporcionado
    // Lo mantenemos pero si sigue saliendo el warning y no lo usas, puedes eliminarlo.
    const router = useRouter(); 

    // LÓGICA DE AUTOCOMPLETADO
    const handleAutocompletar = useCallback(async (cedula: string) => {
        if (!cedula || cedula.length < 5) return;

        setAutocompleting(true);

        try {
            const response = await api.get(`/api/visita/buscar-por-identificacion/${cedula}`);
            // Asumiendo que response.data.data tiene la estructura esperada { nombre_visitante: string, correo: string }
            const payload: { nombre_visitante?: string; correo?: string } | null = response.data?.data ?? null;

            if (payload) {
                setForm((prev) => ({
                    ...prev,
                    nombre_usuario: payload.nombre_visitante || prev.nombre_usuario,
                    correo: payload.correo || prev.correo,
                }));
                setErrores({});
            } else {
                setForm((prev) => ({ ...prev, nombre_usuario: "", correo: "" }));
            }
        } catch (err) { // CORRECCIÓN 5: Eliminar ': any'
            if (axios.isAxiosError(err) && err.response?.status === 404) { // CORRECCIÓN 6: Usar axios.isAxiosError
                setForm((prev) => ({ ...prev, nombre_usuario: "", correo: "" }));
            } else {
                console.error("Error de autocompletado:", err);
                // Opcional: Mostrar un mensaje de error en el modal si el autocompletado falla por otras razones
                // setModal({ show: true, success: false, title: "Error", message: "Error al buscar datos de autocompletado." });
            }
        } finally {
            setAutocompleting(false);
        }
    }, []);

    // Maneja el cambio del campo de Cédula con debounce
    const handleChangeCedula = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo dígitos
        setForm((prev) => ({ ...prev, cedula: value }));
        
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.length >= 5) {
            debounceRef.current = setTimeout(() => {
                handleAutocompletar(value);
            }, 500);
        } else {
            setForm((prev) => ({
                ...prev,
                nombre_usuario: '',
                correo: '',
            }));
        }
    };
    // FIN LÓGICA DE AUTOCOMPLETADO
    
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined; // Tipado para timer
        if (verificando && expiraEn > 0) {
            timer = setInterval(() => setExpiraEn((prev) => prev - 1), 1000);
        } else if (expiraEn === 0 && verificando) {
            setErrores((prev) => ({ ...prev, codigo: 'El código ha expirado. Solicita uno nuevo.' }));
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [verificando, expiraEn]);

    const formatearTiempo = (segundos: number) => {
        const min = Math.floor(segundos / 60);
        const sec = segundos % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {}; // Tipado para nuevosErrores
        
        if (!form.cedula.trim()) nuevosErrores.cedula = 'La cédula es obligatoria';
        else if (!/^\d+$/.test(form.cedula)) nuevosErrores.cedula = 'La cédula solo debe contener números';
        else if (form.cedula.trim().length < 5) nuevosErrores.cedula = 'La cédula debe tener al menos 5 dígitos';

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
            await api.post('/auth/register', { 
                ...form, 
                nombre_usuario: form.nombre_usuario.trim(), 
                cedula: form.cedula.trim() 
            });
            setModal({ show: true, success: true, title: "Registro Exitoso", message: "Se ha enviado un código de verificación a tu correo." });
            setVerificando(true);
            setExpiraEn(600);
            setRegistrationEmail(form.correo);
        } catch (err) { // CORRECCIÓN 7: Eliminar ': any'
            let message = 'No se pudo completar el registro.';
            if (axios.isAxiosError(err)) { // CORRECCIÓN 8: Usar axios.isAxiosError
                message = err.response?.data?.error || message;
            }
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
            setVerificando(false);
            // CORRECCIÓN 9: Reiniciar el formulario con el tipo correcto (FormState)
            setForm({ nombre_usuario: '', correo: '', cedula: '', contrasena: '', confirmPassword: '', rol: 'operario' });
            setCodigo('');
            // router.push('/login'); // Podrías redirigir aquí si es deseado
        } catch (err) { // CORRECCIÓN 10: Eliminar ': any'
            let message = 'Código inválido o expirado.';
            if (axios.isAxiosError(err)) { // CORRECCIÓN 11: Usar axios.isAxiosError
                message = err.response?.data?.error || message;
            }
            setModal({ show: true, success: false, title: "Error de Verificación", message });
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
        } catch (err) { // CORRECCIÓN 12: Eliminar ': any'
            let message = "No se pudo reenviar el código. Intenta de nuevo.";
            if (axios.isAxiosError(err)) { // CORRECCIÓN 13: Usar axios.isAxiosError
                message = err.response?.data?.error || message;
            }
            setModal({ show: true, success: false, title: "Error", message });
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
                        
                        {/* CAMPO Cédula (con autocompletado) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Cédula / Identificación</label>
                            <div className="relative">
                                <ClipboardList className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                                <input 
                                    type="text" 
                                    value={form.cedula} 
                                    onChange={handleChangeCedula}
                                    className="w-full border border-slate-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                    placeholder="Ej: 1012345678"
                                    disabled={loading || autocompleting}
                                />
                                {autocompleting && <Loader2 className="w-5 h-5 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 text-teal-500"/>}
                            </div>
                            {errores.cedula && <p className="text-red-500 text-sm mt-1">{errores.cedula}</p>}
                        </div>

                        {/* CAMPO Nombre de Usuario (se autocompleta) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de Usuario</label>
                            <input type="text" value={form.nombre_usuario} onChange={(e) => setForm({...form, nombre_usuario: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}/>
                            {errores.nombre_usuario && <p className="text-red-500 text-sm mt-1">{errores.nombre_usuario}</p>}
                        </div>

                        {/* CAMPO Correo (se autocompleta) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                            <input type="email" value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}/>
                            {errores.correo && <p className="text-red-500 text-sm mt-1">{errores.correo}</p>}
                        </div>

                        {/* ... (Resto del formulario: Contraseña, Confirmar Contraseña, Rol) ... */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={form.contrasena} onChange={(e) => setForm({...form, contrasena: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500">
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
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
                            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as FormState['rol'] })} className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={loading}>
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