// Archivo: /app/home/admin/invernaderos/zonas/page.tsx
// ESTE ES UN SERVER COMPONENT POR DEFECTO Y NO LLEVA 'use client'

import { ZonasContent } from "./ZonasContent"; // Importamos el componente cliente renombrado
import { Suspense } from 'react';
import { Loader2 } from "lucide-react";

// Este componente sirve como la entrada de la ruta.
// Usamos <Suspense> para manejar la carga inicial del componente cliente 
// y evitar el error de prerenderizado al intentar leer useSearchParams en el servidor.
export default function ZonasPageWrapper() {
    return (
        // <Suspense> muestra el 'fallback' (cargando) mientras el componente ZonasContent
        // se hidrata en el navegador y lee sus parámetros de búsqueda.
        <Suspense fallback={
            <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
                <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto text-teal-600 animate-spin" /><p className="mt-4 text-slate-500">Cargando Zonas...</p></div>
            </main>
        }>
            {/* Renderiza el componente cliente. La lógica de 'isMounted' dentro de 
                ZonasContent se encargará de cargar los datos de forma segura. */}
            <ZonasContent />
        </Suspense>
    );
}