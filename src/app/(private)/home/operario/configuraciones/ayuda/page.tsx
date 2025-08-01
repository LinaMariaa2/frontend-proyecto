"use client";

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Mail } from 'lucide-react';

// --- Tipos de Datos ---
interface FaqItem {
  pregunta: string;
  respuesta: string;
}

// --- Datos de Preguntas Frecuentes ---
const preguntasFrecuentes: FaqItem[] = [
  {
    pregunta: "¿Cómo creo un nuevo invernadero?",
    respuesta: "Ve a la sección de 'Invernaderos' en el menú lateral y haz clic en el botón 'Nuevo Invernadero'. Completa el formulario con la información requerida y guarda los cambios.",
  },
  {
    pregunta: "¿Cómo asigno un cultivo a una zona?",
    respuesta: "Primero, navega a la sección de 'Invernaderos' y selecciona 'Gestionar Zonas'. Dentro de la página de zonas, puedes crear una nueva zona o editar una existente para asignarle un cultivo de la lista.",
  },
  {
    pregunta: "¿Quiénes pueden acceder a la gestión de usuarios?",
    respuesta: "Solo los usuarios con el rol de 'Administrador' tienen permiso para crear, editar y gestionar otros usuarios del sistema desde la sección de 'Configuraciones'.",
  },
  {
    pregunta: "¿Cómo cierro sesión de forma segura?",
    respuesta: "Haz clic en tu foto de perfil en la esquina superior derecha para abrir el menú de usuario y selecciona la opción 'Cerrar Sesión'. Esto finalizará tu sesión y te redirigirá a la página de inicio de sesión.",
  },
  {
    pregunta: "¿Puedo cambiar mi contraseña?",
    respuesta: "Sí. Ve a 'Configuraciones' y luego a 'Mi Perfil'. Encontrarás un campo para ingresar una nueva contraseña. Si lo dejas en blanco, tu contraseña actual no cambiará.",
  },
];

// --- Componente de Acordeón ---
const AccordionItem = ({ item, isOpen, onClick }: { item: FaqItem, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-slate-200">
            <button
                onClick={onClick}
                className="flex justify-between items-center w-full py-4 text-left"
            >
                <h3 className="text-lg font-semibold text-slate-800">{item.pregunta}</h3>
                <ChevronDown className={`w-5 h-5 text-teal-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <p className="pb-4 text-slate-600">{item.respuesta}</p>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---
export default function AyudaPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <HelpCircle className="w-10 h-10 text-slate-500"/>
            <span>Centro de Ayuda</span>
          </h1>
          <p className="text-lg text-slate-500 mt-1">Encuentra respuestas a las preguntas más comunes.</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            {preguntasFrecuentes.map((item, index) => (
              <AccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            ))}
        </div>

        <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-slate-800">¿No encontraste lo que buscabas?</h3>
            <p className="text-slate-500 mt-2">Nuestro equipo de soporte está listo para ayudarte.</p>
            <a
              href="mailto:soporte@hortitech.com"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
            >
              <Mail className="w-5 h-5"/>
              Contactar a Soporte
            </a>
        </div>
      </div>
    </main>
  );
}
