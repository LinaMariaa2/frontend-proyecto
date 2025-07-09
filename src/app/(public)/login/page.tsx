"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // Rol por defecto

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

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

    // Simulación de login
    setTimeout(() => {
      if (role === 'admin') {
        router.push('/home/admin');
      } else {
        router.push('/home/operario');
      }
    }, 500);
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

          {/* Rol (Admin u Operario) */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuario
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="admin">Administrador</option>
              <option value="operario">Operario</option>
            </select>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-md font-semibold hover:bg-green-600 transition"
          >
            Iniciar Sesión
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
