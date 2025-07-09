"use client";
import React from "react";

const preguntasFrecuentes = [
  {
    pregunta: "¿Cómo creo un nuevo invernadero?",
    respuesta:
      "Ve a la sección de 'Invernaderos' y haz clic en el botón 'Crear Invernadero'. Llena el formulario con los datos requeridos y guarda.",
  },
  {
    pregunta: "¿Cómo asigno un cultivo a una zona?",
    respuesta:
      "Dirígete a la sección de Zonas dentro de un invernadero. Luego crea o edita una zona y selecciona el cultivo deseado.",
  },
  {
    pregunta: "¿Quiénes pueden acceder a la gestión de usuarios?",
    respuesta:
      "Solo los usuarios con rol 'superadmin' pueden ver y modificar la sección de gestión de usuarios.",
  },
  {
    pregunta: "¿Cómo cierro sesión de forma segura?",
    respuesta:
      "Ve a Configuraciones > Cerrar Sesión. Esto te llevará de vuelta al login y limpiará tu sesión.",
  },
  {
    pregunta: "¿Puedo cambiar mi contraseña?",
    respuesta:
      "Sí. Ve a Configuraciones > Perfil, y desde allí puedes modificar tus datos personales y la contraseña.",
  },
];

export default function AyudaPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Centro de Ayuda</h1>

      <div className="space-y-4">
        {preguntasFrecuentes.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow border">
            <h2 className="text-lg font-semibold text-green-700 mb-1">
              {item.pregunta}
            </h2>
            <p className="text-gray-600 text-sm">{item.respuesta}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-sm text-gray-500 text-center">
        ¿Necesitas más ayuda? Contáctanos al correo:{" "}
        <a
          href="mailto:soporte@hortitech.com"
          className="text-green-600 underline"
        >
          soporte@hortitech.com
        </a>
      </div>
    </main>
  );
}
