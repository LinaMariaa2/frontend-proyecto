import React from 'react';
import Link from 'next/link';

/**
 * Componente HeaderHome
 * Define la estructura del encabezado de la página.
 * Se ha eliminado el enlace de "Registro".
 */
const HeaderHome = () => {
  return (
    <header className="bg-gray-800 text-white py-4 shadow-md">
      <nav className="container mx-auto flex flex-wrap items-center justify-between px-6">
        <div className="text-2xl font-bold">
          <Link href="/" className="hover:text-gray-300">
            Hotitech
          </Link>
        </div>
        <ul className="flex space-x-6 text-lg">
          {/* El enlace de "Registro" ha sido eliminado */}
          <li>
            <Link href="/login" className="hover:text-gray-300 transition duration-200">
              Iniciar Sesión
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

/**
 * Componente FooterHome
 * Define la estructura del pie de página.
 */
const FooterHome = () => {
  return (
    <footer className="bg-gray-900 text-white text-center py-4">
      <p className="m-0">&copy; 2025 Hotitech. Todos los derechos reservados.</p>
    </footer>
  );
};

/**
 * Componente de la Página Principal (Home)
 * Este es el componente principal que se exporta y renderiza toda la página.
 * Incluye el Header (modificado), las secciones de contenido y el Footer.
 */
const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderHome />

      <main className="flex-grow container mx-auto px-6 py-12">
        {/* Sección: Acerca de Nosotros */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-green-700 mb-4">Acerca de Nosotros</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            HorTitech es una solución tecnológica que permite controlar de forma remota los sistemas de luz y agua. Ideal para la
            agricultura moderna y el manejo eficiente de recursos en edificios e industrias.
          </p>
        </section>

        {/* Sección: Características Principales */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-green-700 mb-8">Características principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Característica 1 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-green-800 mb-3">Control Remoto</h3>
              <p className="text-gray-700">
                Activa o desactiva los sistemas de luz y agua desde cualquier lugar.
              </p>
            </div>
            {/* Característica 2 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-green-800 mb-3">Optimización de Recursos</h3>
              <p className="text-gray-700">
                Maximiza el uso eficiente del agua y la electricidad con programación inteligente.
              </p>
            </div>
            {/* Característica 3 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-green-800 mb-3">Fácil Integración</h3>
              <p className="text-gray-700">
                Compatible con diferentes tipos de instalaciones, adaptable a tus necesidades.
              </p>
            </div>
          </div>
        </section>

        {/* Sección: ¿Quieres saber más? (CTA) */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Quieres saber más?</h2>
          <a
            href="#" // Puedes cambiar esto a un enlace real, como una página de contacto o un formulario
            className="bg-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition duration-300 shadow-xl"
          >
            Solicitar Información
          </a>
        </section>

        {/* Sección: Lo que dicen nuestros clientes */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-green-700 mb-8">Lo que dicen nuestros clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonio 1 */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md border-t-4 border-green-300">
              <p className="text-lg italic text-gray-700 mb-4">
                HorTitech transformó nuestra manera de trabajar. Ahora ahorramos recursos y mejoramos la productividad.
              </p>
              <p className="text-md font-semibold text-gray-800">- Ana Martínez, Agricultora</p>
            </div>
            {/* Testimonio 2 */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md border-t-4 border-green-300">
              <p className="text-lg italic text-gray-700 mb-4">
                La instalación fue rápida y sencilla, y los beneficios han sido increíbles. ¡100% recomendado!
              </p>
              <p className="text-md font-semibold text-gray-800">- Juan Pérez, Ingeniero</p>
            </div>
          </div>
        </section>
      </main>

      <FooterHome />
    </div>
  );
};

export default HomePage;