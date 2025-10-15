"use client"; // ¡ESTA ES LA SOLUCIÓN! Marca este archivo como un Componente de Cliente.

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { Plus, Pencil, PauseCircle, PlayCircle, Trash, X, Loader2, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
// Importaciones de servicios o utilidades (asumiendo que existen)
// import { fetchGreenhouseZones, updateLightingProgram } from "@/services/api"; 

// Definición de tipos para la programación de iluminación
interface LightSchedule {
    id: string;
    start: string; // Hora de inicio (e.g., "08:00")
    end: string;   // Hora de fin (e.g., "18:00")
    active: boolean;
}

const LightingProgramPage = () => {
    // Hooks de cliente requeridos: useState y useEffect
    const searchParams = useSearchParams();
    const zoneId = searchParams.get("zoneId");
    
    const [schedules, setSchedules] = useState<LightSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Placeholder para la lógica de carga de datos
    useEffect(() => {
        if (!zoneId) {
            setError("ID de zona no encontrado.");
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            // Lógica de carga simulada o real de Firestore/API
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            
            // Datos simulados:
            setSchedules([
                { id: "1", start: "06:00", end: "10:00", active: true },
                { id: "2", start: "18:00", end: "22:00", active: false },
            ]);
            
            setIsLoading(false);
            setError(null);
        };

        loadData();
    }, [zoneId]);

    // Función para manejar la adición de una nueva programación
    const handleAddSchedule = useCallback(() => {
        const newSchedule: LightSchedule = {
            id: Date.now().toString(),
            start: "09:00",
            end: "17:00",
            active: true
        };
        setSchedules(prev => [...prev, newSchedule]);
    }, []);

    // Función para guardar los cambios (simulada)
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // await updateLightingProgram(zoneId, schedules); // Llamada real al servicio
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación de API
            // console.log("Programación guardada:", schedules);
            alert("Programación guardada exitosamente.");
        } catch (e) {
            setError("Error al guardar la programación.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[300px]">
                <Loader2 className="animate-spin mr-2" size={32} />
                <p>Cargando programación...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <h2 className="font-bold">Error de Carga</h2>
                <p>{error}</p>
                <p className="mt-2 text-sm">Asegúrate de que la zona es válida o vuelve a intentarlo.</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Programación de Iluminación
                </h1>
                <p className="text-gray-500">Configuración para la Zona: {zoneId || 'Desconocida'}</p>
            </header>

            <main className="max-w-4xl mx-auto">
                {schedules.map((schedule, index) => (
                    <div 
                        key={schedule.id} 
                        className="flex items-center justify-between p-4 mb-3 bg-white shadow-md rounded-xl border border-gray-200 transition duration-150 ease-in-out hover:shadow-lg"
                    >
                        {/* Ejemplo de un elemento de programación */}
                        <div className="flex items-center space-x-4">
                            {schedule.active ? (
                                <PlayCircle className="text-green-500" size={24} />
                            ) : (
                                <PauseCircle className="text-yellow-500" size={24} />
                            )}
                            <div>
                                <p className="font-semibold text-lg">Horario {index + 1}</p>
                                <p className="text-sm text-gray-600">
                                    De {schedule.start} a {schedule.end}
                                </p>
                            </div>
                        </div>

                        {/* Controles */}
                        <div className="flex space-x-2">
                            <button
                                title="Editar"
                                className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition"
                            >
                                <Pencil size={20} />
                            </button>
                            <button
                                title="Eliminar"
                                className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition"
                                onClick={() => alert('Función de eliminación no implementada')}
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddSchedule}
                    className="mt-4 flex items-center justify-center w-full py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 hover:shadow-xl font-medium"
                >
                    <Plus className="mr-2" size={20} />
                    Agregar Nueva Programación
                </button>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`w-full py-3 text-white rounded-xl font-bold transition duration-200 ${
                            isSaving 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 shadow-lg'
                        }`}
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="animate-spin mr-2" size={20} />
                                Guardando...
                            </span>
                        ) : (
                            "Guardar Cambios"
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

// Next.js requiere que las páginas sean exportadas por defecto.
export default LightingProgramPage;
