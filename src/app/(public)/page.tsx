"use client";

import React, { JSX, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Chatbot from './components/Chatbot';
// Importamos todos los iconos que necesitaremos de Lucide
import { 
  Leaf, ArrowRight, Target, Zap, Droplets, SlidersHorizontal, BarChart3, 
  CheckCircle, Users, BellRing, GitBranch, ShieldCheck, Cpu, Code, Database, Info, XCircle, Facebook, Instagram, Linkedin, Mail, Phone, MessageSquare, MapPin,
} from 'lucide-react';

interface FeatureCardProps {
  image: string;
  title: string;
  description: string;
}

interface BenefitItemProps {
  children: React.ReactNode;
}

interface TechStackItemProps {
  image: string;
  name: string;
}

// --- Componentes Reutilizables ---
const Header = (): JSX.Element => (
  <header className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
    <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white"
      >
        <Leaf className="w-7 h-7 text-teal-600 dark:text-teal-500" />
        <span>Hortitech</span>
      </Link>
      <div className="flex items-center gap-6 text-slate-700 dark:text-slate-300 font-medium">
        <a href="#features" className="hover:text-teal-600 dark:hover:text-teal-400">Características</a>
        <a href="#benefits" className="hover:text-teal-600 dark:hover:text-teal-400">Beneficios</a>
        <a href="#tech" className="hover:text-teal-600 dark:hover:text-teal-400">Tecnología</a>
        <a href="#about" className="hover:text-teal-600 dark:hover:text-teal-400">About</a>
        <a href="#contact" className="hover:text-teal-600 dark:hover:text-teal-400">Contacto</a>
        <Link
          href="/login"
          className="bg-teal-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    </nav>
  </header>
);

const FeatureCard = ({ image, title, description }: FeatureCardProps) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
    whileHover={{ y: -5, scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-full text-center shadow-md hover:shadow-xl dark:shadow-teal-900/20 dark:hover:shadow-teal-800/30 transition-shadow duration-300">
      {/* Imagen */}
      <img
        src={image}
        alt={title}
        className="w-60 h-60 mx-auto mb-6 rounded-xl object-cover shadow-md"
      />
      <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mt-2">{description}</p>
    </div>
  </motion.div>
);

const BenefitItem = ({ children }: { children: React.ReactNode }) => (
  <motion.li
    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
    className="flex items-start gap-3"
  >
    <CheckCircle className="flex-shrink-0 w-6 h-6 text-teal-500 mt-1" />
    <span className="text-slate-600 dark:text-slate-300 text-lg">{children}</span>
  </motion.li>
);

const Footer = (): JSX.Element => (
  <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300">
    <div className="container mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Columna 1: Logo y Descripción */}
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold text-white"
          >
            <Leaf className="w-8 h-8 text-teal-500" />
            <span>Hortitech</span>
          </Link>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            Automatización para la agricultura del futuro.  
            Tecnología que potencia la productividad y cuida el planeta 🌱
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h3 className="font-semibold text-white tracking-wider uppercase mb-4">
            Navegación
          </h3>
          <ul className="space-y-3">
            <li><a href="#features" className="hover:text-teal-400 transition">Características</a></li>
            <li><a href="#benefits" className="hover:text-teal-400 transition">Beneficios</a></li>
            <li><a href="#tech" className="hover:text-teal-400 transition">Tecnología</a></li>
            <li><a href="#about" className="hover:text-teal-400 transition">Sobre Nosotros</a></li>
            <li><a href="#contact" className="hover:text-teal-400 transition">Contacto</a></li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h3 className="font-semibold text-white tracking-wider uppercase mb-4">
            Contacto
          </h3>
          <ul className="space-y-3 text-slate-400">
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-teal-400" />
              <a href="mailto:contacto@hortitech.com" className="hover:text-teal-300">
                contacto@hortitech.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-teal-400" />
              <span>+57 300 123 4567</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-teal-400" />
              <span>Popayán, Colombia</span>
            </li>
          </ul>
        </div>

        {/* Columna 4: Redes Sociales */}
        <div>
          <h3 className="font-semibold text-white tracking-wider uppercase mb-4">
            Síguenos
          </h3>
          <div className="flex gap-6 mt-4">
            <a
              href="#"
              aria-label="Facebook"
              className="text-slate-400 hover:text-blue-500 transition text-2xl"
            >
              <Facebook />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="text-slate-400 hover:text-pink-500 transition text-2xl"
            >
              <Instagram />
            </a>
            <a
              href="#"
              aria-label="Linkedin"
              className="text-slate-400 hover:text-sky-500 transition text-2xl"
            >
              <Linkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="mt-12 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Hortitech. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>

);

// --- Página Principal ---
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
      image: "/img/feature-lighting.png",
      title: "Iluminación Automatizada",
      description: "Programa horarios de luz precisos para potenciar el crecimiento."
    },
    {
      image: "/img/feature-irrigation.png",
      title: "Riego Inteligente",
      description: "Asegura hidratación y ahorra agua con sensores inteligentes."
    },
    {
      image: "/img/feature-team.png",
      title: "Gestión de Roles",
      description: "Permisos para administradores y operarios."
    },
    {
      image: "/img/feature-alerts.png",
      title: "Alertas y Notificaciones",
      description: "Avisos de fallos o falta de agua."
    }
  ];

  const techStack: TechStackItemProps[] = [
    { image: "/img/tech/react.png", name: "React & Next.js" },
    { image: "/img/tech/postgresql.png", name: "PostgreSQL" },
    { image: "/img/tech/esp32.png", name: "ESP32" },
    { image: "/img/tech/security.png", name: "Auth & Security" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />

      <main>
        {/* Hero */}
        <section
          className="relative text-center py-32 px-6 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/img/hero-greenhouse.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

          <motion.div
            className="relative container mx-auto text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold drop-shadow-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              La Revolución Inteligente <br /> para tus{" "}
              <span className="text-teal-400">Invernaderos</span>
            </motion.h1>

            <motion.p
              className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-slate-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              HortiTech es una plataforma tecnológica enfocada en la automatización
              y gestión inteligente de invernaderos.
            </motion.p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="#features"
                className="font-semibold flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-lg transition-transform hover:scale-105"
              >
                <span>Conocer más</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
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

        {/* Contact */}
        <section id="contact" className="py-24 bg-white dark:bg-slate-900">
          <motion.div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Contáctanos
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                ¿Listo para revolucionar tu invernadero? Estamos aquí para ayudarte 🚀
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                    Información de contacto
                  </h3>
                  <ul className="space-y-4 text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-3">
                      <Mail className="w-6 h-6 text-teal-600 dark:text-teal-500" />
                      <span>contacto@hortitech.com</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-teal-600 dark:text-teal-500" />
                      <span>+57 300 123 4567</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-teal-600 dark:text-teal-500" />
                      <span>Popayán, Colombia</span>
                    </li>
                  </ul>
                </div>

                <div className="overflow-hidden rounded-xl shadow-lg h-[250px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15944.328222115579!2d-76.5603823!3d2.47978365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e300410eb607c65%3A0x614545787e90bea6!2sSENA!5e0!3m2!1ses-419!2sco!4v1758063107090!5m2!1ses-419!2sco"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                  />
                </div>
              </div>

              <motion.div>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
                >
                  
                  <div>
                    <label className="block mb-2 font-medium text-slate-800 dark:text-slate-200">Nombre completo</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-slate-800 dark:text-slate-200">Correo</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-slate-800 dark:text-slate-200">Celular</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-slate-800 dark:text-slate-200">Empresa</label>
                    <input
                      type="text"
                      name="company"
                      value={form.company || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-slate-800 dark:text-slate-200">Mensaje (opcional)</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg resize-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Escribe tu mensaje..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-teal-600 hover:to-green-600 shadow-md transition"
                  >
                    Enviar mensaje
                  </button>

                  {status && (
                    <p className="text-center mt-2 text-sm text-slate-600 dark:text-slate-400">{status}</p>
                  )}
                </form>
              </motion.div>
            </div>
          </motion.div>
        </section>

      </main>
      <Chatbot/>
      <Footer />
    </div>
  );
}