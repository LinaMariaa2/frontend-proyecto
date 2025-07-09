"use client";
import Link from "next/link";
import {
  UserIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

const configuraciones = [
  {
    nombre: "Perfil",
    descripcion: "Administra tu información personal y contraseña",
    icono: <UserIcon className="h-6 w-6 text-green-700" />,
    href: "/home/operario/configuraciones/perfil",
  },

  {
    nombre: "Ayuda",
    descripcion: "Centro de soporte y preguntas frecuentes",
    icono: <QuestionMarkCircleIcon className="h-6 w-6 text-green-700" />,
    href: "/home/operario/configuraciones/ayuda",
  },
  
  {
    nombre: "Cerrar Sesión",
    descripcion: "Salir del sistema de manera segura",
    icono: <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-600" />,
    href: "/login", // puedes agregar aquí lógica para limpiar sesión
  },
];

export default function ConfiguracionesPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-darkGreen-900 mb-8">Configuraciones</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configuraciones.map((item) => (
          <Link
            key={item.nombre}
            href={item.href}
            className="bg-white rounded-2xl shadow hover:shadow-md p-6 flex items-start gap-4 transition"
          >
            <div className="bg-green-100 rounded-full p-2">
              {item.icono}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-900">{item.nombre}</h2>
              <p className="text-gray-600 text-sm">{item.descripcion}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
