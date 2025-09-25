"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '@/app/services/api';
import { useUser } from '@/app/context/UserContext';
import { Mail, Lock, LogIn, LoaderCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login: authLogin } = useUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setEmailError('');
        setPasswordError('');
        setGeneralError('');
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

        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                correo: email,
                contrasena: password,
            });

            const { token, user } = response.data;
            authLogin(token, user);

            if (user.rol === 'admin') {
                router.push('/home/admin');
            } else if (user.rol === 'operario') {
                router.push('/home/operario');
            } else {
                setGeneralError('Rol de usuario no reconocido. Contacte al administrador.');
            }

        } catch (error: any) {
            console.error('Error en el login:', error.response?.data || error.message);
            setGeneralError(error.response?.data?.error || 'Credenciales incorrectas. Verifique su correo y contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    {/* El logo se invertirá en modo oscuro. Funciona bien para logos de un solo color. */}
                    <Image
                        src="/img/logo.png"
                        //src="/images/logo-black-3.svg"
                        alt="Logo de Hotitech"
                        width={150}
                        height={40}
                        className="mx-auto mb-4 dark:invert"
                    />
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Ingresa para gestionar tus cultivos.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {generalError && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0"/>
                            <span className="text-sm">{generalError}</span>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                            <input
                                id="email"
                                type="email"
                                placeholder="tu.correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        {emailError && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{emailError}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {passwordError && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{passwordError}</p>}
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href="/recpassword" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-500 dark:hover:text-teal-400 hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed dark:disabled:bg-teal-800"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="animate-spin w-5 h-5" />
                                <span>Verificando...</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                <span>Iniciar Sesión</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}