"use client";

import React, { JSX } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Chatbot from './components/Chatbot';
// Importamos todos los iconos que necesitaremos de Lucide
import { 
  Leaf, ArrowRight, Target, Zap, Droplets, SlidersHorizontal, BarChart3, 
  CheckCircle, Users, BellRing, GitBranch, ShieldCheck, Cpu, Code, Database, Info
} from 'lucide-react';

// --- Interfaces de Tipos ---
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface BenefitItemProps {
  children: React.ReactNode;
}

// --- NUEVO: Interfaz para el Stack Tecnológico ---
interface TechStackItemProps {
  icon: React.ElementType;
  name: string;
}

// --- Componentes Reutilizables ---

const Header = (): JSX.Element => (
    <header className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Leaf className="w-7 h-7 text-teal-600" />
                <span>Hotitech</span>
            </Link>
            <div className="flex items-center gap-4">
                {/* --- CAMBIO: Botón de CTA principal en el header --- */}
                <Link href="/login" className="hidden sm:inline-block bg-teal-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                    Iniciar Sesión
                </Link>
            </div>
        </nav>
    </header>
);

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps): JSX.Element => (
    <motion.div
        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        whileHover={{ y: -5, scale: 1.02 }} // --- CAMBIO: Micro-interacción en hover
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
      className="flex items-start gap-3">
        <CheckCircle className="flex-shrink-0 w-6 h-6 text-teal-500 mt-1" />
        <span className="text-slate-600 text-lg">{children}</span>
    </motion.li>
);

const Footer = (): JSX.Element => (
    <footer className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-6 py-8 text-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} Hotitech. Automatización para la agricultura del futuro.</p>
        </div>
    </footer>
);

// --- Componente Principal de la Página de Inicio ---
export default function HomePage(): JSX.Element {
  
  const mainFeatures: FeatureCardProps[] = [
    { icon: Zap, title: "Iluminación Automatizada", description: "Programa horarios de luz precisos para potenciar el crecimiento de tus cultivos." },
    { icon: Droplets, title: "Riego Inteligente", description: "Asegura la hidratación perfecta y ahorra agua con riego basado en datos de sensores." },
    { icon: Users, title: "Gestión de Roles", description: "Asigna permisos específicos para administradores y operarios para un control seguro." },
    { icon: BellRing, title: "Alertas y Notificaciones", description: "Recibe avisos de eventos críticos como fallos de sensores o falta de agua." },
  ];

  // --- NUEVO: Datos para la sección de Stack Tecnológico ---
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
          <motion.div className="container mx-auto" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
            <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tighter">
              La Revolución Inteligente <br /> para tus <span className="text-teal-600">Invernaderos</span>
            </motion.h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="max-w-3xl mx-auto mt-6 text-lg text-slate-600">
              HortiTech es una plataforma tecnológica enfocada en la automatización y gestión inteligente de invernaderos, diseñada para optimizar el cultivo de flores y otros tipos de cultivos.
            </motion.p>
            {/* --- CAMBIO: Botones de CTA más claros --- */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="#features" 
                className="font-semibold text-slate-700 flex items-center gap-2 group py-3 px-6"
              >
                <span>Conocer más</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1"/>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Sección de Objetivo --- */}
        <section className="py-24">
            <motion.div className="container mx-auto px-6 text-center" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block bg-teal-50 text-teal-700 font-semibold px-4 py-1 rounded-full text-sm mb-4">Nuestro Objetivo</motion.div>
                <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-2xl md:text-3xl font-medium text-slate-700 max-w-4xl mx-auto">
                    Desarrollar una solución integral e inteligente que permita el <span className="text-teal-600 font-bold">control remoto y en tiempo real</span> de los procesos dentro de un invernadero, garantizando una mayor eficiencia y la reducción de errores humanos.
                </motion.p>
            </motion.div>
        </section>

        {/* --- Sección de Características (Features) --- */}
        <section id="features" className="py-24 bg-white border-y border-slate-200">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Una Plataforma Diseñada para Crecer</h2>
              <p className="mt-4 text-lg text-slate-600">Desde el control remoto hasta la analítica avanzada, tienes todo lo que necesitas para llevar tu producción al siguiente nivel.</p>
            </div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              {mainFeatures.map((feature) => ( <FeatureCard key={feature.title} {...feature} /> ))}
            </motion.div>
          </div>
        </section>
        
        {/* --- Sección de Beneficios Clave --- */}
        <section className="py-24">
            <motion.div className="container mx-auto px-6" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <motion.h2 variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }} className="text-3xl md:text-4xl font-bold text-slate-900">Beneficios que se Cosechan</motion.h2>
                        <motion.p variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }} className="mt-4 text-lg text-slate-600">La automatización inteligente no solo simplifica el trabajo, sino que se traduce en resultados medibles.</motion.p>
                        <ul className="space-y-4 mt-8">
                            <BenefitItem>Aumento en la productividad agrícola.</BenefitItem>
                            <BenefitItem>Reducción del consumo de agua y energía.</BenefitItem>
                            <BenefitItem>Mayor precisión en el cuidado del cultivo.</BenefitItem>
                            <BenefitItem>Acceso remoto desde cualquier dispositivo.</BenefitItem>
                            <BenefitItem>Reducción de errores humanos.</BenefitItem>
                        </ul>
                    </div>
                    {/* --- CAMBIO: Visual más atractiva que un simple icono --- */}
                    <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="relative bg-white p-6 rounded-2xl border border-slate-200 aspect-square flex items-center justify-center">
                       <div className="grid grid-cols-2 gap-4 text-teal-500">
                          <div className="flex flex-col items-center justify-center p-4 bg-teal-50 rounded-lg"><Zap size={48} /><span className="text-xs mt-2 font-semibold">Energía</span></div>
                          <div className="flex flex-col items-center justify-center p-4 bg-teal-50 rounded-lg"><Droplets size={48} /><span className="text-xs mt-2 font-semibold">Agua</span></div>
                          <div className="flex flex-col items-center justify-center p-4 bg-teal-50 rounded-lg"><BarChart3 size={48} /><span className="text-xs mt-2 font-semibold">Datos</span></div>
                          <div className="flex flex-col items-center justify-center p-4 bg-teal-50 rounded-lg"><Leaf size={48} /><span className="text-xs mt-2 font-semibold">Crecimiento</span></div>
                       </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>

        {/* --- NUEVA SECCIÓN: Stack Tecnológico --- */}
        <section className="py-24">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Construido con Tecnología Confiable</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Utilizamos un stack moderno y robusto para garantizar seguridad, escalabilidad y un rendimiento excepcional.</p>
                <motion.div 
                    className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 mt-12"
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true, amount: 0.3 }} 
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    {techStack.map(tech => (
                        <motion.div 
                            key={tech.name}
                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                            className="flex flex-col items-center gap-3 text-slate-600"
                        >
                            <tech.icon className="w-12 h-12" strokeWidth={1.5} />
                            <span className="font-semibold">{tech.name}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* --- Sección Estado del Desarrollo --- */}
        <section className="py-24 bg-white border-y border-slate-200">
            <div className="container mx-auto px-6">
                 <div className="bg-blue-50 border-2 border-blue-200/50 rounded-2xl p-8 md:p-12 text-center">
                       <Info className="mx-auto w-12 h-12 text-blue-500 mb-4" />
                       <h2 className="text-2xl font-bold text-blue-900">Estado Actual: Prototipo Funcional</h2>
                       <p className="text-blue-800/80 mt-2 max-w-3xl mx-auto">
                           Actualmente, HortiTech está en etapa de desarrollo de prototipo. Ya están funcionando la creación de invernaderos, zonas, gestión de cultivos y la programación de riego e iluminación con una interfaz adaptada al entorno agrícola.
                       </p>
                 </div>
            </div>
        </section>
      </main>
      <Chatbot/>
      <Footer />
    </div>
  );
};