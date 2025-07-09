"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistroUsuario() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [apellidoCompleto, setApellidoCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [expiraEn, setExpiraEn] = useState(600); // 10 minutos en segundos

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

  useEffect(() => {
    if (codigoEnviado && expiraEn > 0) {
      const timer = setInterval(() => setExpiraEn((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [codigoEnviado, expiraEn]);

  const formatearTiempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const generarCodigo = () => {
    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGenerado(nuevoCodigo);
    setCodigoEnviado(true);
    setExpiraEn(600);
    console.log('Código enviado (simulado):', nuevoCodigo);
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: any = {};
    let isValid = true;

    if (!nombreCompleto) { nuevosErrores.nombre = 'El nombre es obligatorio'; isValid = false; }
    if (!apellidoCompleto) { nuevosErrores.apellido = 'El apellido es obligatorio'; isValid = false; }
    if (!email) { nuevosErrores.email = 'El correo es obligatorio'; isValid = false; }
    if (!password) { nuevosErrores.password = 'La contraseña es obligatoria'; isValid = false; }
    if (!rol) { nuevosErrores.rol = 'Selecciona un rol'; isValid = false; }

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
    if (!validarFormulario()) return;
    generarCodigo();
    setVerificando(true);
  };

  const verificarCodigo = () => {
    if (codigo === codigoGenerado && expiraEn > 0) {
      alert('¡Cuenta verificada correctamente!');
      router.push('/');
    } else {
      setErrores((prev) => ({ ...prev, codigo: 'Código inválido o expirado' }));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-green-800 text-center">Registro de Usuario</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombres</label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md"
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
          >
            Crear Cuenta
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
            />
            {errores.codigo && <p className="text-red-500 text-sm">{errores.codigo}</p>}

            <button
              onClick={verificarCodigo}
              className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
            >
              Verificar código
            </button>
            <button
              onClick={generarCodigo}
              className="text-sm text-sweetGreen-600 underline mt-2"
            >
              Reenviar código
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
