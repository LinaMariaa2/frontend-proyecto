"use client";

import React, { JSX, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf, ArrowRight, Zap, Droplets, Users, BellRing, ShieldCheck, Cpu, Code, Database, CheckCircle, Info, Facebook, Instagram, Linkedin, Mail, Phone, MessageSquare, MapPin,
} from "lucide-react";

// --- Interfaces ---
interface FeatureCardProps {
  image: string;
  title: string;
  description: string;
}

interface TechStackItemProps {
  image: string;
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
        <span>Hortitech</span>
      </Link>
      <div className="flex items-center gap-6 text-slate-700 font-medium">
        <a href="#features" className="hover:text-teal-600">Características</a>
        <a href="#benefits" className="hover:text-teal-600">Beneficios</a>
        <a href="#tech" className="hover:text-teal-600">Tecnología</a>
        <a href="#about" className="hover:text-teal-600">About</a>
        <a href="#contact" className="hover:text-teal-600">Contacto</a>
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
    <div className="bg-white p-6 rounded-2xl border border-slate-200 h-full text-center shadow-md hover:shadow-xl transition-shadow duration-300">
      {/* Imagen */}
      <img
        src={image}
        alt={title}
        className="w-60 h-60 mx-auto mb-6 rounded-xl object-cover shadow-md"
      />
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-slate-500 mt-2">{description}</p>
    </div>
  </motion.div>
);

const BenefitItem = ({ children }: { children: React.ReactNode }) => (
  <motion.li
    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
    className="flex items-start gap-3"
  >
    <CheckCircle className="flex-shrink-0 w-6 h-6 text-teal-500 mt-1" />
    <span className="text-slate-600 text-lg">{children}</span>
  </motion.li>
);

const Footer = (): JSX.Element => (
  <footer className="bg-slate-900 text-slate-300 border-t border-slate-700">
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Columna 1: Logo y Descripción */}
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Leaf className="w-7 h-7 text-teal-500" />
            <span>Hortitech</span>
          </Link>
          <p className="mt-4 text-slate-400 text-sm">
            Automatización para la agricultura del futuro.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h3 className="font-semibold text-white tracking-wider uppercase">Navegación</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#features" className="hover:text-teal-400 transition-colors">Características</a></li>
            <li><a href="#benefits" className="hover:text-teal-400 transition-colors">Beneficios</a></li>
            <li><a href="#tech" className="hover:text-teal-400 transition-colors">Tecnología</a></li>
            <li><a href="/login" className="hover:text-teal-400 transition-colors">Iniciar Sesión</a></li>
          </ul>
        </div>
        
        {/* Columna 3: Contacto */}
        <div>
          <h3 className="font-semibold text-white tracking-wider uppercase">Contacto</h3>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <a href="mailto:contacto@hortitech.com" className="hover:text-teal-400">contacto@hortitech.com</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>+57 300 123 4567</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Bogotá, Colombia</span>
            </li>
          </ul>
        </div>

        {/* Columna 4: Redes Sociales */}
        <div>
           <h3 className="font-semibold text-white tracking-wider uppercase">Síguenos</h3>
           <div className="flex justify-start gap-5 mt-4">
             <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-teal-400 transition-colors"><Facebook /></a>
             <a href="#" aria-label="Instagram" className="text-slate-400 hover:text-teal-400 transition-colors"><Instagram /></a>
             <a href="#" aria-label="Linkedin" className="text-slate-400 hover:text-teal-400 transition-colors"><Linkedin /></a>
           </div>
        </div>

      </div>

      {/* Barra inferior del footer */}
      <div className="mt-12 pt-8 border-t border-slate-700 text-center text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} Hortitech. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
);

// --- Página Principal ---
export default function HomePage(): JSX.Element {
  const [form, setForm] = useState({ name: "", email: "", phone:"", company:"", message: "" });
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Enviando...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("✅ Mensaje enviado correctamente");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("❌ Error al enviar el mensaje");
      }
    } catch (error) {
      setStatus("❌ Error de conexión");
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
    <div className="bg-slate-50 font-sans">
      <Header />

      <main>
        {/* Hero */}
        <section
          className="relative text-center py-32 px-6 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/img/hero-greenhouse.jpg')" }}
        >
          {/* Overlay degradado */}
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


        {/* Features */}
        <section id="features" className="py-24 bg-white border-y border-slate-200">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Una Plataforma Diseñada para Crecer</h2>
              <p className="mt-4 text-lg text-slate-600">Desde el control remoto hasta la analítica avanzada.</p>
            </div>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-12 gap-8 mt-16">
              {mainFeatures.map((feature) => (<FeatureCard key={feature.title} {...feature} />))}
            </motion.div>
          </div>
        </section>

        {/* Beneficios */}
        <section id="benefits" className="py-24 bg-slate-50">
          <motion.div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              {/* Columna Izquierda: Imagen */}
              <div className="relative">
                <img
                  src="/img/benefits-crops.png"
                  alt="Cultivos en invernadero"
                  className="rounded-2xl shadow-lg object-cover w-full h-[400px]"
                />
                {/* Overlay sutil */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Columna Derecha: Texto + Lista */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Beneficios que se Cosechan
                </h2>
                <ul className="space-y-5 mt-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="flex-shrink-0 w-6 h-6 text-teal-500 mt-1" />
                    <span className="text-lg text-slate-700">
                      Aumento en la productividad agrícola.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="flex-shrink-0 w-6 h-6 text-teal-500 mt-1" />
                    <span className="text-lg text-slate-700">
                      Reducción del consumo de agua y energía.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="flex-shrink-0 w-6 h-6 text-teal-500 mt-1" />
                    <span className="text-lg text-slate-700">
                      Mayor precisión en el cuidado del cultivo.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="flex-shrink-0 w-6 h-6 text-teal-500 mt-1" />
                    <span className="text-lg text-slate-700">
                      Acceso remoto desde cualquier dispositivo.
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </motion.div>
        </section>


        {/* Stack */}
        <section id="tech" className="py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Construido con Tecnología Confiable</h2>
            <motion.div className="flex flex-wrap justify-center gap-x-16 gap-y-12 mt-16">
              {techStack.map((tech) => (
                <motion.div
                  key={tech.name}
                  className="flex flex-col items-center gap-3 text-slate-600 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 w-48"
                >
                  <img
                    src={tech.image}
                    alt={tech.name}
                    className="w-20 h-20 object-contain"
                  />
                  <span className="font-semibold text-lg">{tech.name}</span>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </section>

        {/* About */}
        <section id="about" className="py-24 bg-white border-y border-slate-200">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              {/* Columna Izquierda: Imagen */}
              <div className="relative">
                <img
                  src="/img/about-team.png"
                  alt="Equipo de Hortitech trabajando"
                  className="rounded-2xl shadow-lg object-cover w-full h-[400px]"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent" />
              </div>

              {/* Columna Derecha: Texto */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Sobre Nosotros
                </h2>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                  En <span className="font-semibold text-teal-600">HortiTech</span> 
                  trabajamos para transformar la agricultura mediante soluciones 
                  tecnológicas innovadoras que permiten el control eficiente y sostenible 
                  de los invernaderos.
                </p>
                <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                  Nuestro equipo multidisciplinario combina experiencia en ingeniería, 
                  desarrollo de software e innovación agrícola para brindar herramientas 
                  confiables que potencian la productividad y promueven la sostenibilidad.
                </p>
              </div>

            </div>
          </div>
        </section>


        {/* Contact */}
        <section id="contact" className="py-24 bg-slate-50">
          <motion.div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Contáctanos
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                ¿Listo para revolucionar tu invernadero? Estamos aquí para ayudarte 🚀
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              
              {/* Columna Izquierda: Info + Mapa */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    Información de contacto
                  </h3>
                  <ul className="space-y-4 text-slate-600">
                    <li className="flex items-center gap-3">
                      <Mail className="w-6 h-6 text-teal-600" />
                      <span>contacto@hortitech.com</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-teal-600" />
                      <span>+57 300 123 4567</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-teal-600" />
                      <span>Bogotá, Colombia</span>
                    </li>
                  </ul>
                </div>

                {/* Google Maps Embed */}
                <div className="overflow-hidden rounded-xl shadow-lg h-[250px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.984467770008!2d-74.08175!3d4.60971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99a6a6a6a6a%3A0x1234567890abcdef!2sBogotá%2C%20Colombia!5e0!3m2!1ses!2sco!4v1690000000000!5m2!1ses!2sco"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Columna Derecha: Formulario */}
              <motion.div>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
                >
                  {/* Nombre */}
                  <div>
                    <label className="block mb-2 font-medium">Nombre completo</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Correo */}
                  <div>
                    <label className="block mb-2 font-medium">Correo</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Celular */}
                  <div>
                    <label className="block mb-2 font-medium">Celular</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block mb-2 font-medium">Empresa</label>
                    <input
                      type="text"
                      name="company"
                      value={form.company || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Mensaje (opcional) */}
                  <div>
                    <label className="block mb-2 font-medium">Mensaje (opcional)</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Escribe tu mensaje..."
                    />
                  </div>

                  {/* Botón */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white py-3 px-6 rounded-lg hover:from-teal-600 hover:to-green-600 shadow-md transition"
                  >
                    Enviar mensaje
                  </button>

                  {status && (
                    <p className="text-center mt-2 text-sm text-slate-600">{status}</p>
                  )}
                </form>
              </motion.div>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
