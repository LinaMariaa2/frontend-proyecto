// src/app/(public)/login/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '@/app/services/api'; 

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin'); // Rol por defecto, aunque el backend debería verificarlo
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState(''); // Para errores de login (credenciales, etc.)
    const [loading, setLoading] = useState(false); // Estado de carga

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setEmailError('');
        setPasswordError('');
        setGeneralError(''); // Limpiar errores anteriores
        let isValid = true;

        if (!email.trim()) {
            setEmailError('El correo electrónico es obligatorio.');
            isValid = false;
        }

        if (!password.trim()) {
            setPasswordError('La contraseña es obligatoria.');
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true); // Iniciar carga

        try {
            // Envía solo correo y contraseña al backend para el login
            const response = await api.post('/auth/login', {
                correo: email,
                contrasena: password,
            });

            const { token, user } = response.data; // Tu backend debe devolver el token y datos del usuario
            // Ejemplo de 'user' si tu backend lo devuelve: { id_persona: 1, nombre_usuario: "...", correo: "...", rol: "admin", ... }

            // Almacenar el token y la información del usuario en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(response.data.user));


            // Redirige según el rol del usuario devuelto por el backend
            // Es crucial que el rol venga del backend y no del select, por seguridad.
            if (user.rol === 'admin') {
                router.push('/home/admin');
            } else if (user.rol === 'operario') {
                router.push('/home/operario');
            } else {
                setGeneralError('Rol de usuario no reconocido. Contacte al administrador.');
                // Opcional: limpiar token si el rol es inválido
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }

        } catch (error: any) {
            console.error('Error en el login:', error.response?.data || error.message);
            // Mostrar error específico del backend
            setGeneralError(error.response?.data?.error || 'Error al iniciar sesión. Inténtelo de nuevo.');
        } finally {
            setLoading(false); // Finalizar carga
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
            <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <Image
                        src="/images/logo-black-3.svg"
                        alt="Logo de Hotitech"
                        width={150}
                        height={40}
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-green-800">Iniciar Sesión</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {generalError && <p className="text-red-500 text-center text-sm mb-4">{generalError}</p>}
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="tu.correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                    </div>

                    {/* Rol (Admin u Operario) - Este select solo para UX, el rol final viene del backend */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Usuario (para simulación de ruta)
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                            disabled={loading} // Deshabilitar durante la carga
                        >
                            <option value="admin">Administrador</option>
                            <option value="operario">Operario</option>
                        </select>
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-3 rounded-md font-semibold hover:bg-green-600 transition"
                        disabled={loading} // Deshabilitar durante la carga
                    >
                        {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    ¿Olvidó su contraseña?{' '}
                    <Link href="/recpassword" className="text-green-600 hover:underline">
                        Recuperar
                    </Link>
                </p>
            </div>
        </div>
    );
}