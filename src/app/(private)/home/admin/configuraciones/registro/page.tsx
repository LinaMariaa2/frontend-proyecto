// src/app/(private)/home/admin/configuraciones/registro/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/services/api'; 

export default function RegistroUsuario() {
    const router = useRouter();

    const [nombreCompleto, setNombreCompleto] = useState('');
    const [apellidoCompleto, setApellidoCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rol, setRol] = useState('');
    const [codigo, setCodigo] = useState('');

    const [verificando, setVerificando] = useState(false);
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [expiraEn, setExpiraEn] = useState(0); // Será actualizado por el backend si envía código
    const [registrationEmail, setRegistrationEmail] = useState(''); // Para guardar el email del registro exitoso

    const [errores, setErrores] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        rol: '',
        codigo: '',
        general: ''
    });
    const [mensajeExito, setMensajeExito] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (codigoEnviado && expiraEn > 0) {
            timer = setInterval(() => setExpiraEn((prev) => prev - 1), 1000);
        } else if (expiraEn === 0 && codigoEnviado) {
            setErrores((prev) => ({ ...prev, codigo: 'El código ha expirado. Solicita uno nuevo.' }));
        }
        return () => clearInterval(timer);
    }, [codigoEnviado, expiraEn]);

    const formatearTiempo = (segundos: number) => {
        const min = Math.floor(segundos / 60);
        const sec = segundos % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const validarFormulario = (): boolean => {
        const nuevosErrores: any = {};
        let isValid = true;

        if (!nombreCompleto.trim()) { nuevosErrores.nombre = 'El nombre es obligatorio'; isValid = false; }
        if (!apellidoCompleto.trim()) { nuevosErrores.apellido = 'El apellido es obligatorio'; isValid = false; }
        if (!email.trim()) { nuevosErrores.email = 'El correo es obligatorio'; isValid = false; }
        if (!password.trim()) { nuevosErrores.password = 'La contraseña es obligatoria'; isValid = false; }
        if (!rol) { nuevosErrores.rol = 'Selecciona un rol'; isValid = false; }

        // Validación de formato de email más robusta (opcional)
        if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
            nuevosErrores.email = 'El formato del correo es inválido'; isValid = false;
        }

        if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            nuevosErrores.password = 'Debe tener al menos 10 caracteres, una mayúscula y un número';
            isValid = false;
        }

        if (password !== confirmPassword) {
            nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setErrores(nuevosErrores);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrores({
            nombre: '', apellido: '', email: '', password: '',
            confirmPassword: '', rol: '', codigo: '', general: ''
        });
        setMensajeExito('');

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                nombre_usuario: `${nombreCompleto} ${apellidoCompleto}`, // Unir nombre y apellido si tu backend espera un solo campo 'nombre_usuario'
                correo: email,
                contrasena: password,
                rol: rol,
            });

            setMensajeExito(response.data.message || 'Usuario registrado exitosamente. Se ha enviado un código de verificación a tu correo.');
            setVerificando(true);
            setCodigoEnviado(true);
            setExpiraEn(600); // Suponemos 10 minutos de expiración, el backend podría enviarlo
            setRegistrationEmail(email); // Guardar el email para la verificación
        } catch (err: any) {
            console.error('Error en el registro:', err.response?.data || err.message);
            setErrores((prev) => ({ ...prev, general: err.response?.data?.error || 'Error al registrar usuario.' }));
        } finally {
            setLoading(false);
        }
    };

    const verificarCodigo = async () => {
        setErrores((prev) => ({ ...prev, codigo: '', general: '' }));
        if (!codigo.trim()) {
            setErrores((prev) => ({ ...prev, codigo: 'El código de verificación es obligatorio.' }));
            return;
        }
        if (expiraEn <= 0) {
            setErrores((prev) => ({ ...prev, codigo: 'El código ha expirado. Solicita uno nuevo.' }));
            return;
        }

        setLoading(true);
        try {
            // Envía el correo y el código al backend para verificación
           const response = await api.post('/auth/verify-email', {
            correo: registrationEmail,
            verificationCode: codigo,
        });

            setMensajeExito(response.data.message || '¡Correo verificado correctamente! Ahora puedes iniciar sesión.');
            setVerificando(false);
            setCodigoEnviado(false);
            // Opcional: Redirigir al login o al dashboard después de la verificación exitosa
            // router.push('/login');
            // O, si es para admin, quizás mantenerlo en la lista de usuarios o mostrar un mensaje claro
            alert('¡Cuenta verificada correctamente! Ahora el usuario puede iniciar sesión.');
            // Limpiar formulario después de un registro/verificación exitosa si el admin se queda en la misma página
            setNombreCompleto('');
            setApellidoCompleto('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRol('');
            setCodigo('');
        } catch (err: any) {
            console.error('Error al verificar código:', err.response?.data || err.message);
            setErrores((prev) => ({ ...prev, general: err.response?.data?.error || 'Código inválido o expirado.' }));
        } finally {
            setLoading(false);
        }
    };

    const reenviarCodigo = async () => {
        setErrores((prev) => ({ ...prev, codigo: '', general: '' }));
        setLoading(true);
        try {
            const response = await api.post('/auth/resend-verification-code', {
                correo: registrationEmail, // Asegúrate de tener el correo del usuario registrado
            });
            setMensajeExito(response.data.message || 'Nuevo código enviado a tu correo.');
            setExpiraEn(600); // Reiniciar temporizador
            setCodigoEnviado(true);
        } catch (err: any) {
            console.error('Error al reenviar código:', err.response?.data || err.message);
            setErrores((prev) => ({ ...prev, general: err.response?.data?.error || 'Error al reenviar código. Intente de nuevo.' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen transition-all duration-300">

            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl space-y-6">
                <h1 className="text-3xl font-bold text-green-800 text-center">Registro de Usuario</h1>

                {mensajeExito && <p className="text-green-600 text-center text-sm mb-4">{mensajeExito}</p>}
                {errores.general && <p className="text-red-500 text-center text-sm mb-4">{errores.general}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Nombres</label>
                        <input
                            type="text"
                            value={nombreCompleto}
                            onChange={(e) => setNombreCompleto(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md"
                            disabled={loading || verificando}
                        />
                        {errores.nombre && <p className="text-red-500 text-sm">{errores.nombre}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Apellidos</label>
                        <input
                            type="text"
                            value={apellidoCompleto}
                            onChange={(e) => setApellidoCompleto(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md"
                            disabled={loading || verificando}
                        />
                        {errores.apellido && <p className="text-red-500 text-sm">{errores.apellido}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md"
                            disabled={loading || verificando}
                        />
                        {errores.email && <p className="text-red-500 text-sm">{errores.email}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-md"
                                disabled={loading || verificando}
                            />
                            {errores.password && <p className="text-red-500 text-sm">{errores.password}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-md"
                                disabled={loading || verificando}
                            />
                            {errores.confirmPassword && <p className="text-red-500 text-sm">{errores.confirmPassword}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Rol</label>
                        <select
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md"
                            disabled={loading || verificando}
                        >
                            <option value="">Selecciona tu rol</option>
                            <option value="admin">Administrador</option>
                            <option value="operario">Operario</option>
                        </select>
                        {errores.rol && <p className="text-red-500 text-sm">{errores.rol}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-3 rounded-md font-semibold hover:bg-green-600 transition"
                        disabled={loading || verificando}
                    >
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                {verificando && (
                    <div className="bg-green-50 p-4 border border-green-300 rounded-md space-y-3 mt-6">
                        <p className="text-sm text-gray-700">Ingresa el código de verificación enviado a tu correo. Expira en <strong>{formatearTiempo(expiraEn)}</strong>.</p>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded-md"
                            placeholder="Código de 6 dígitos"
                            disabled={loading}
                        />
                        {errores.codigo && <p className="text-red-500 text-sm">{errores.codigo}</p>}

                        <button
                            onClick={verificarCodigo}
                            className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? 'Verificando...' : 'Verificar código'}
                        </button>
                        <button
                            onClick={reenviarCodigo}
                            className="text-sm text-green-600 underline mt-2"
                            disabled={loading || expiraEn > 0} // No permitir reenviar si el temporizador está activo
                        >
                            Reenviar código
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}