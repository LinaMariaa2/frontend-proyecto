"use client";

import React, { JSX, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf,
  ArrowRight,
  Zap,
  Droplets,
  Users,
  BellRing,
  ShieldCheck,
  Cpu,
  Code,
  Database,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface BenefitItemProps {
  children: React.ReactNode;
}

interface TechStackItemProps {
  icon: React.ElementType;
  name: string;
}

// --- Componentes Reutilizables ---
const Header = (): JSX.Element => (
  <header className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
    <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-bold text-slate-900"
      >
        <Leaf className="w-7 h-7 text-teal-600" />
        <span>Hotitech</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden sm:inline-block bg-teal-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    </nav>
  </header>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: FeatureCardProps): JSX.Element => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="bg-white p-6 rounded-2xl border border-slate-200 h-full text-center sm:text-left shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="bg-teal-50 text-teal-600 rounded-lg w-fit p-3 mb-4 inline-block">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-slate-500 mt-2">{description}</p>
    </div>
  </motion.div>
);

const BenefitItem = ({ children }: BenefitItemProps): JSX.Element => (
  <motion.li
    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
    className="flex items-start gap-3"
  >
    <CheckCircle className="flex-shrink-0 w-6 h-6 text-teal-500 mt-1" />
    <span className="text-slate-600 text-lg">{children}</span>
  </motion.li>
);

const Footer = (): JSX.Element => (
  <footer className="bg-white border-t border-slate-200">
    <div className="container mx-auto px-6 py-8 text-center text-slate-500">
      <p>
        &copy; {new Date().getFullYear()} Hotitech. Automatización para la
        agricultura del futuro.
      </p>
    </div>
  </footer>
);

// --- Componente Principal de la Página de Inicio ---
export default function HomePage(): JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("http://localhost:4000/api/visita/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setModalMessage("Solicitud de visita enviada con éxito.");
        setModalType("success");
        setShowForm(false);
      } else {
        const errorData = await res.json();
        setModalMessage(errorData.message || "Error al enviar la solicitud.");
        setModalType("error");
      }
    } catch (error) {
      console.error(error);
      setModalMessage("Error de conexión con el servidor. Intenta de nuevo más tarde.");
      setModalType("error");
    }
  };

  const mainFeatures: FeatureCardProps[] = [
    {
      icon: Zap,
      title: "Iluminación Automatizada",
      description:
        "Programa horarios de luz precisos para potenciar el crecimiento de tus cultivos.",
    },
    {
      icon: Droplets,
      title: "Riego Inteligente",
      description:
        "Asegura la hidratación perfecta y ahorra agua con riego basado en datos de sensores.",
    },
    {
      icon: Users,
      title: "Gestión de Roles",
      description:
        "Asigna permisos específicos para administradores y operarios para un control seguro.",
    },
    {
      icon: BellRing,
      title: "Alertas y Notificaciones",
      description:
        "Recibe avisos de eventos críticos como fallos de sensores o falta de agua.",
    },
  ];

  const techStack: TechStackItemProps[] = [
    { icon: Code, name: "React & Next.js" },
    { icon: Database, name: "PostgreSQL" },
    { icon: Cpu, name: "ESP32" },
    { icon: ShieldCheck, name: "Auth & Security" },
  ];

  return (
    <div className="bg-slate-50 font-sans">
      <Header />

      <main>
        {/* --- Sección Hero --- */}
        <section className="text-center py-24 md:py-32 px-6 overflow-hidden">
          <motion.div
            className="container mx-auto"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tighter"
            >
              La Revolución Inteligente <br /> para tus{" "}
              <span className="text-teal-600">Invernaderos</span>
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="max-w-3xl mx-auto mt-6 text-lg text-slate-600"
            >
              HortiTech es una plataforma tecnológica enfocada en la automatización y gestión
              inteligente de invernaderos, diseñada para optimizar el cultivo de flores y otros
              tipos de cultivos.
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <Link
                href="#features"
                className="font-semibold text-slate-700 flex items-center gap-2 group py-3 px-6"
              >
                <span>Conocer más</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Sección de Objetivo --- */}
        <section className="py-24">
          <motion.div
            className="container mx-auto px-6 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="inline-block bg-teal-50 text-teal-700 font-semibold px-4 py-1 rounded-full text-sm mb-4"
            >
              Nuestro Objetivo
            </motion.div>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-2xl md:text-3xl font-medium text-slate-700 max-w-4xl mx-auto"
            >
              Desarrollar una solución integral e inteligente que permita el{" "}
              <span className="text-teal-600 font-bold">control remoto y en tiempo real</span> de
              los procesos dentro de un invernadero, garantizando una mayor eficiencia y la
              reducción de errores humanos.
            </motion.p>
          </motion.div>
        </section>

        {/* --- Botón Programa tu Visita --- */}
        <section className="py-12 text-center">
          <button
            onClick={() => setShowForm(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Programa tu visita
          </button>
        </section>

        {/* --- Modal con Formulario --- */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Agendar Visita</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="nombre_visitante"
                  placeholder="Nombre completo"
                  required
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico"
                  required
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="identificacion"
                  placeholder="Identificación"
                  required
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  required
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Ciudad"
                  required
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="date"
                  name="fecha_visita"
                  required
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  name="motivo"
                  placeholder="Motivo de la visita"
                  required
                  className="w-full p-3 border rounded-lg"
                ></textarea>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- Modal de Alerta Personalizada --- */}
        {modalMessage && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full relative text-center">
              <button
                onClick={() => {
                  setModalMessage("");
                  setModalType(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <div className={`mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full ${modalType === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {modalType === "success" ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
              </div>
              <p className="text-lg font-semibold text-slate-800">{modalMessage}</p>
              <button
                onClick={() => {
                  setModalMessage("");
                  setModalType(null);
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* --- Sección de Características --- */}
        <section id="features" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Características Principales</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              HortiTech te ofrece un control total y una visión clara de tus operaciones agrícolas.
            </p>
          </div>
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {mainFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </motion.div>
        </section>

        {/* --- Sección de Beneficios --- */}
        <section className="py-24 bg-slate-100">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-extrabold text-slate-800 leading-tight mb-4">
                  Transforma tus cultivos con nuestros beneficios clave.
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Nuestra plataforma está diseñada para impulsar la productividad y sostenibilidad.
                </p>
                <ul className="space-y-4">
                  <BenefitItem>Aumento de la productividad y rendimiento de los cultivos.</BenefitItem>
                  <BenefitItem>Reducción del consumo de agua y energía.</BenefitItem>
                  <BenefitItem>Mejora en la calidad y salud de las plantas.</BenefitItem>
                  <BenefitItem>Monitoreo constante y alertas en tiempo real.</BenefitItem>
                </ul>
              </motion.div>
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <img
                    src="https://via.placeholder.com/600x400.png?text=Invernadero+Inteligente"
                    alt="Invernadero inteligente"
                    className="rounded-lg w-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- Sección de Tecnologías --- */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
              Tecnología de Vanguardia
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
              Construido con las herramientas más confiables para un rendimiento óptimo.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {techStack.map((tech, index) => (
                <div key={index} className="flex items-center gap-3">
                  <tech.icon className="w-8 h-8 text-slate-600" />
                  <span className="text-lg font-medium text-slate-800">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}