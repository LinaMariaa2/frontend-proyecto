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
  Info,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
} from "lucide-react";

// --- Interfaces ---
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
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

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
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
  const [form, setForm] = useState({ name: "", email: "", message: "" });
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
    { icon: Zap, title: "Iluminación Automatizada", description: "Programa horarios de luz precisos para potenciar el crecimiento." },
    { icon: Droplets, title: "Riego Inteligente", description: "Asegura hidratación y ahorra agua con sensores inteligentes." },
    { icon: Users, title: "Gestión de Roles", description: "Permisos para administradores y operarios." },
    { icon: BellRing, title: "Alertas y Notificaciones", description: "Avisos de fallos o falta de agua." },
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
        {/* Hero */}
        <section className="text-center py-24 md:py-32 px-6 overflow-hidden">
          <motion.div className="container mx-auto">
            <motion.h1 className="text-4xl md:text-6xl font-extrabold text-slate-900">
              La Revolución Inteligente <br /> para tus{" "}
              <span className="text-teal-600">Invernaderos</span>
            </motion.h1>
            <motion.p className="max-w-3xl mx-auto mt-6 text-lg text-slate-600">
              HortiTech es una plataforma tecnológica enfocada en la automatización y gestión inteligente de invernaderos.
            </motion.p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="#features" className="font-semibold text-slate-700 flex items-center gap-2 group py-3 px-6">
                <span>Conocer más</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              {mainFeatures.map((feature) => (<FeatureCard key={feature.title} {...feature} />))}
            </motion.div>
          </div>
        </section>

        {/* Beneficios */}
        <section id="benefits" className="py-24">
          <motion.div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Beneficios que se Cosechan</h2>
                <ul className="space-y-4 mt-8">
                  <BenefitItem>Aumento en la productividad agrícola.</BenefitItem>
                  <BenefitItem>Reducción del consumo de agua y energía.</BenefitItem>
                  <BenefitItem>Mayor precisión en el cuidado del cultivo.</BenefitItem>
                  <BenefitItem>Acceso remoto desde cualquier dispositivo.</BenefitItem>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stack */}
        <section id="tech" className="py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Construido con Tecnología Confiable</h2>
            <motion.div className="flex flex-wrap justify-center gap-x-12 gap-y-8 mt-12">
              {techStack.map((tech) => (
                <motion.div key={tech.name} className="flex flex-col items-center gap-3 text-slate-600">
                  <tech.icon className="w-12 h-12" strokeWidth={1.5} />
                  <span className="font-semibold">{tech.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-24 bg-white border-y border-slate-200">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Sobre Nosotros</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              En Hortitech trabajamos para transformar la agricultura mediante soluciones tecnológicas innovadoras que permiten el control eficiente y sostenible de los invernaderos.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-24">
          <motion.div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Contáctanos</h2>
              <p className="mt-4 text-lg text-slate-600">¿Listo para revolucionar tu invernadero? Estamos aquí para ayudarte</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Info */}
              <div className="space-y-8">
                <div className="flex items-start gap-4"><Mail className="w-6 h-6 text-teal-600" /><div><h3>Email</h3><p>contacto@hortitech.com</p></div></div>
                <div className="flex items-start gap-4"><Phone className="w-6 h-6 text-teal-600" /><div><h3>Teléfono</h3><p>+57 300 123 4567</p></div></div>
                <div className="flex items-start gap-4"><MessageSquare className="w-6 h-6 text-teal-600" /><div><h3>WhatsApp</h3><a href="https://wa.me/573001234567" target="_blank" className="text-teal-600 hover:underline">Enviar mensaje</a></div></div>
                <div className="flex items-start gap-4"><MapPin className="w-6 h-6 text-teal-600" /><div><h3>Ubicación</h3><p>Bogotá, Colombia</p></div></div>
              </div>

              {/* Form */}
              <motion.div>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                  <div><label className="block mb-2">Nombre completo</label><input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" /></div>
                  <div><label className="block mb-2">Email</label><input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" /></div>
                  <div><label className="block mb-2">Mensaje</label><textarea name="message" value={form.message} onChange={handleChange} rows={5} required className="w-full px-4 py-3 border rounded-lg resize-none" /></div>
                  <button type="submit" className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition">Enviar mensaje</button>
                  {status && <p className="text-center mt-2 text-sm">{status}</p>}
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
