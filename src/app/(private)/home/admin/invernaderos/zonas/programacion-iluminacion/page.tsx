import React, { useState, useEffect, Suspense, useCallback } from "react";
import { Plus, Pencil, PauseCircle, PlayCircle, Trash, X, Loader2, Info } from "lucide-react";

// ----------------------------------------------------------------------
// 1. Componente Toast (incluido para hacerlo autocontenido)
// ----------------------------------------------------------------------

// Interface simulada para compatibilidad de tipos
// Nota: Next.js ignora las interfaces TypeScript en archivos .jsx, pero ayuda a la claridad
interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // 4 segundos
    return () => clearTimeout(timer);
  }, [message, onClose]);

  // Determina si es un error basado en el contenido del mensaje
  const isError = message.includes("❌") || message.includes("⚠️");

  return (
    <div
      className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-xl transition-opacity duration-300 z-50 flex items-center gap-3 max-w-sm ${
        isError ? "bg-red-600" : "bg-teal-600"
      } text-white`}
      role="alert"
    >
      <div className="text-sm font-medium flex-1">{message}</div>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};


// ----------------------------------------------------------------------
// 2. Simulación de useSearchParams y API para entorno de archivo único
// ----------------------------------------------------------------------

// Simulación de useSearchParams para obtener el 'id' de la URL
// ¡Esta función solo debe llamarse en el cliente!
const useZonaId = () => {
  const [zonaId, setZonaId] = useState<string | null>(null);

  useEffect(() => {
    // Solo se ejecuta en el lado del cliente (browser)
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        // Devuelve el ID de la URL o '123' por defecto para hacerlo funcional en la previsualización
        setZonaId(params.get("id") || '123');
    }
  }, []);

  return zonaId;
};

// Interfaz para la programación
interface ProgramacionIluminacion {
  id_iluminacion: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  descripcion: string;
  estado: boolean; // true = activo, false = inactivo/detenido
}

// Datos simulados (Backend Mock)
let MOCK_PROGRAMACIONES: ProgramacionIluminacion[] = [
  { id_iluminacion: 101, fecha_inicio: new Date(Date.now() + 86400000).toISOString(), fecha_finalizacion: new Date(Date.now() + 172800000).toISOString(), descripcion: "Riego nocturno 1", estado: true },
  { id_iluminacion: 102, fecha_inicio: new Date(Date.now() - 3600000).toISOString(), fecha_finalizacion: new Date(Date.now() + 7200000).toISOString(), descripcion: "Iluminación de prueba (En Curso)", estado: true },
  { id_iluminacion: 103, fecha_inicio: new Date(Date.now() + 259200000).toISOString(), fecha_finalizacion: new Date(Date.now() + 345600000).toISOString(), descripcion: "Fertilización semanal (Detenida)", estado: false },
];
let nextId = 104;

// Simulación de API (reemplaza 'api' de Axios)
const mockApi = {
  get: async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia
    if (url.includes("/futuras")) {
      return { data: MOCK_PROGRAMACIONES };
    }
    throw new Error("Endpoint no simulado");
  },

  post: async (_url: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProgramacion: ProgramacionIluminacion = {
      id_iluminacion: nextId++,
      fecha_inicio: data.fecha_inicio,
      fecha_finalizacion: data.fecha_finalizacion,
      descripcion: data.descripcion,
      estado: true,
    };
    MOCK_PROGRAMACIONES.push(newProgramacion);
    return { data: newProgramacion };
  },

  put: async (url: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const id = parseInt(url.split('/').pop() || '0');
    const index = MOCK_PROGRAMACIONES.findIndex(p => p.id_iluminacion === id);
    if (index === -1) throw new Error("Programación no encontrada");

    const updatedProgramacion = {
        ...MOCK_PROGRAMACIONES[index],
        fecha_inicio: data.fecha_inicio,
        fecha_finalizacion: data.fecha_finalizacion,
        descripcion: data.descripcion,
    }

    MOCK_PROGRAMACIONES[index] = updatedProgramacion;

    return { data: { programacion: updatedProgramacion, mensaje: "Programación actualizada con éxito (Simulado)" } };
  },

  patch: async (url: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const id = parseInt(url.split('/')[2] || '0');
    const index = MOCK_PROGRAMACIONES.findIndex(p => p.id_iluminacion === id);
    if (index === -1) throw new Error("Programación no encontrada");
    
    // El API espera 'activo'
    MOCK_PROGRAMACIONES[index].estado = data.activo;
    
    return { status: 200 };
  },

  delete: async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const id = parseInt(url.split('/').pop() || '0');
    MOCK_PROGRAMACIONES = MOCK_PROGRAMACIONES.filter(p => p.id_iluminacion !== id);
    return { status: 200 };
  },
};

// ----------------------------------------------------------------------
// 3. ProgramacionIluminacionContent (Componente principal)
// ----------------------------------------------------------------------
// Este componente AHORA está anidado para garantizar que 'useZonaId' se llame SOLO en el cliente.
function ProgramacionIluminacionContent() {
  // Ahora es seguro llamar a useZonaId porque estamos en el componente del cliente
  const zonaId = useZonaId(); 

  // El estado 'estado' de la DB (true/false) se usa para inicializar 'estadosDetenidos'.
  // estadosDetenidos[id] = true significa que está detenido, que es lo contrario de p.estado (activo).
  const [estadosDetenidos, setEstadosDetenidos] = useState<Record<number, boolean>>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [programaciones, setProgramaciones] = useState<ProgramacionIluminacion[]>([]);
  const [form, setForm] = useState({ activacion: "", desactivacion: "", descripcion: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Convierte fecha ISO a formato local compatible con input datetime-local
  const convertirFechaParaInput = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    const tzOffset = fecha.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(fecha.getTime() - tzOffset);
    return fechaLocal.toISOString().slice(0, 16);
  };

  // Muestra Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Carga programaciones al montar o cambiar zona
  useEffect(() => {
    if (!zonaId) return;

    const fetchData = async () => {
      try {
        const res = await mockApi.get(`/programacionIluminacion/zona/${zonaId}/futuras`);
        const data = res.data as ProgramacionIluminacion[];
        setProgramaciones(data);

        // Inicializa el estado de detención: detenido = !activo
        const nuevosEstados: Record<number, boolean> = {};
        data.forEach((p) => {
          nuevosEstados[p.id_iluminacion] = !p.estado;
        });
        setEstadosDetenidos(nuevosEstados);
      } catch (err) {
        console.error("Error al cargar programaciones:", err);
        showToast("❌ Error al cargar programaciones");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [zonaId, showToast]);

  // Validar programación antes de guardar
  const validarProgramacion = (): boolean => {
    const inicio = new Date(form.activacion);
    const fin = new Date(form.desactivacion);
    const ahora = new Date();

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      showToast("⚠️ Debes ingresar fechas válidas.");
      return false;
    }

    if (inicio < ahora) {
      showToast("⚠️ La fecha de inicio no puede estar en el pasado.");
      return false;
    }

    if (fin <= inicio) {
      showToast("⚠️ La fecha de finalización debe ser mayor a la de inicio.");
      return false;
    }

    // Validación de solapamiento
    const solapa = programaciones.some((p) => {
      if (editandoId && p.id_iluminacion === editandoId) return false;
      const pInicio = new Date(p.fecha_inicio);
      const pFin = new Date(p.fecha_finalizacion);
      // Lógica de solapamiento: [Inicio nuevo < Fin existente] AND [Fin nuevo > Inicio existente]
      return inicio < pFin && fin > pInicio;
    });

    if (solapa) {
      showToast("⚠️ La programación se sobrepone con otra existente.");
      return false;
    }

    return true;
  };

  // Crear nueva programación
  const agregar = async () => {
    if (!form.activacion || !form.desactivacion || !form.descripcion) {
      showToast("⚠️ Por favor, completa todos los campos.");
      return;
    }

    if (!validarProgramacion()) return;

    setLoading(true);
    try {
      // Tu código original:
      const res = await mockApi.post("/programacionIluminacion", {
        fecha_inicio: new Date(form.activacion).toISOString(),
        fecha_finalizacion: new Date(form.desactivacion).toISOString(),
        descripcion: form.descripcion,
        id_zona: parseInt(zonaId as string),
      });

      setProgramaciones((prev) => [...prev, res.data]);
      setForm({ activacion: "", desactivacion: "", descripcion: "" });
      setModalOpen(false);
      showToast("✅ Programación creada con éxito");
    } catch (err: any) {
      console.error("Error al crear programación:", err);
      showToast(err.message || "❌ Hubo un error al crear la programación.");
    } finally {
      setLoading(false);
    }
  };

  // Detener / Reanudar
  const detener = async (id: number) => {
    // El estado del botón es 'detenido'. Si estaba detenido, el nuevo estado del botón es 'activo' (false)
    const estaDetenidaActual = estadosDetenidos[id];
    const nuevoEstadoDetenido = !estaDetenidaActual; // Si estaba detenido (true), ahora es reanudar (false)
    const nuevoEstadoActivoAPI = !nuevoEstadoDetenido; // Lo que se envía al API

    try {
      // Tu código original:
      await mockApi.patch(`/programacionIluminacion/${id}/estado`, { activo: nuevoEstadoActivoAPI });
      
      setEstadosDetenidos((prev) => ({ ...prev, [id]: nuevoEstadoDetenido }));
      showToast(nuevoEstadoDetenido ? "✅ Iluminación detenida" : "✅ Iluminación reanudada");
    } catch (err: any) {
      console.error("Error al cambiar estado de programación:", err);
      showToast(err.message || "❌ No se pudo actualizar el estado en el servidor");
    }
  };

  // Actualizar programación existente
  const actualizarProgramacion = async () => {
    if (!form.activacion || !form.desactivacion || !form.descripcion) {
      showToast("⚠️ Por favor, completa todos los campos.");
      return;
    }

    if (!validarProgramacion() || editandoId === null) return;

    setLoading(true);
    try {
      // Tu código original:
      const res = await mockApi.put(`/programacionIluminacion/${editandoId}`, {
        fecha_inicio: new Date(form.activacion).toISOString(),
        fecha_finalizacion: new Date(form.desactivacion).toISOString(),
        descripcion: form.descripcion,
      });

      const updatedProgramacion = res.data.programacion;

      setProgramaciones((prev) =>
        prev.map((p) =>
          p.id_iluminacion === editandoId ? updatedProgramacion : p
        )
      );
      setForm({ activacion: "", desactivacion: "", descripcion: "" });
      setEditandoId(null);
      setModalOpen(false);
      showToast(res.data.mensaje || "✅ Programación actualizada");
    } catch (err: any) {
      const backendMsg = err.message || "Hubo un error al actualizar la programación.";
      showToast("❌ " + backendMsg);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const eliminarProgramacion = async (programacion: ProgramacionIluminacion) => {
    // Reemplazado window.confirm por una alerta simple para mantener la compatibilidad del entorno
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta programación? Esta acción no se puede deshacer.")) return;
    
    try {
      // Tu código original:
      await mockApi.delete(`/programacionIluminacion/${programacion.id_iluminacion}`);
      
      setProgramaciones((prev) =>
        prev.filter((p) => p.id_iluminacion !== programacion.id_iluminacion)
      );
      showToast("🗑️ Programación eliminada correctamente");
    } catch (err: any) {
      console.error("Error al eliminar programación:", err);
      showToast(err.message || "❌ No se pudo eliminar la programación");
    }
  };

  // Mostrar indicador de carga inicial
  if (initialLoading || !zonaId) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="ml-3 text-lg text-teal-600">
                {zonaId ? "Cargando datos de la zona..." : "Esperando ID de Zona en la URL (ej: ?id=123)..."}
            </p>
        </div>
    );
  }

  // Contenido principal de la aplicación
  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8 font-['Inter']">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Programación de Iluminación - Zona {zonaId}
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
            <Info className="w-4 h-4 text-teal-500"/> ID de Zona leído de la URL: {zonaId}
          </p>
        </div>
        <button
          onClick={() => {
            setEditandoId(null);
            setForm({ activacion: "", desactivacion: "", descripcion: "" });
            setModalOpen(true);
          }}
          className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Crear Programación</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programaciones.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
                <p className="text-xl text-slate-500">No hay programaciones futuras definidas para esta zona.</p>
                <p className="text-sm text-slate-400 mt-2">Usa el botón "Crear Programación" para empezar.</p>
            </div>
        ) : (
            programaciones.map((p) => {
                const ahora = new Date();
                const inicio = new Date(p.fecha_inicio);
                const fin = new Date(p.fecha_finalizacion);
                const haIniciado = inicio <= ahora;
                const estaFinalizada = fin <= ahora;
                const estaDetenida = estadosDetenidos[p.id_iluminacion];
                
                // Puede editar/eliminar si NO ha iniciado O si ya está detenida O si ya finalizó.
                const puedeEditarEliminar = !haIniciado || estaDetenida || estaFinalizada;

                let estadoLabel = 'Pendiente';
                let estadoClasses = 'bg-blue-100 text-blue-700';

                if (estaFinalizada) {
                    estadoLabel = 'Finalizada';
                    estadoClasses = 'bg-gray-200 text-gray-700';
                } else if (haIniciado && !estaDetenida) {
                    estadoLabel = 'En Curso';
                    estadoClasses = 'bg-green-100 text-green-700';
                } else if (estaDetenida) {
                    estadoLabel = 'Detenida';
                    estadoClasses = 'bg-yellow-100 text-yellow-700';
                }


                return (
                    <div
                        key={p.id_iluminacion}
                        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col transition-shadow duration-300 hover:shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100">
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${estadoClasses}`}>
                                {estadoLabel}
                            </span>
                        </div>
                        <div className="space-y-3 flex-grow">
                            <p className="text-sm text-slate-600">
                                <span className="font-semibold text-slate-800">Activación:</span>{" "}
                                {new Date(p.fecha_inicio).toLocaleString("es-CO")}
                            </p>
                            <p className="text-sm text-slate-600">
                                <span className="font-semibold text-slate-800">Desactivación:</span>{" "}
                                {new Date(p.fecha_finalizacion).toLocaleString("es-CO")}
                            </p>
                            <p className="text-sm text-slate-600 truncate">
                                <span className="font-semibold text-slate-800">Descripción:</span>{" "}
                                {p.descripcion}
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200 flex gap-2 flex-wrap">
                            {/* Botón Detener/Reanudar (solo visible si está en curso y no finalizada) */}
                            {haIniciado && !estaFinalizada && (
                                <button
                                    onClick={() => detener(p.id_iluminacion)}
                                    className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-white transition-colors text-sm shadow-md ${
                                        estaDetenida
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-yellow-500 hover:bg-yellow-600"
                                    }`}
                                >
                                    {estaDetenida ? (
                                        <>
                                            <PlayCircle className="w-4 h-4" /> Reanudar
                                        </>
                                    ) : (
                                        <>
                                            <PauseCircle className="w-4 h-4" /> Detener
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Editar */}
                            <button
                                onClick={() => {
                                    setEditandoId(p.id_iluminacion);
                                    setForm({
                                        activacion: convertirFechaParaInput(p.fecha_inicio),
                                        desactivacion: convertirFechaParaInput(p.fecha_finalizacion),
                                        descripcion: p.descripcion,
                                    });
                                    setModalOpen(true);
                                }}
                                disabled={!puedeEditarEliminar}
                                className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition-colors text-sm shadow-md ${
                                    puedeEditarEliminar
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <Pencil className="w-4 h-4" />
                                Editar
                            </button>

                            {/* Eliminar */}
                            <button
                                onClick={() => eliminarProgramacion(p)}
                                disabled={!puedeEditarEliminar}
                                className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors text-sm shadow-md ${
                                    puedeEditarEliminar
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                title="Eliminar"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {editandoId ? "Editar Programación" : "Agregar Programación"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditandoId(null);
                  setForm({ activacion: "", desactivacion: "", descripcion: "" });
                }}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fecha y hora de activación
                </label>
                <input
                  type="datetime-local"
                  value={form.activacion}
                  onChange={(e) => setForm({ ...form, activacion: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fecha y hora de finalización
                </label>
                <input
                  type="datetime-local"
                  value={form.desactivacion}
                  onChange={(e) => setForm({ ...form, desactivacion: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                  placeholder="Ej: Iluminación de crecimiento"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditandoId(null);
                  setForm({ activacion: "", desactivacion: "", descripcion: "" });
                }}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editandoId ? actualizarProgramacion : agregar}
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white font-semibold flex items-center gap-2 shadow-md transition-all ${
                  loading ? "opacity-50 cursor-not-allowed bg-teal-500" : "bg-teal-600 hover:bg-teal-700 hover:shadow-lg"
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Procesando..." : editandoId ? "Guardar Cambios" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </main>
  );
}

// ----------------------------------------------------------------------
// 4. Componente de Exportación FINAL (Server-safe)
// ----------------------------------------------------------------------

// Este componente solo se usa para forzar la inicialización del lado del cliente.
// No tiene lógica de navegador en la primera renderización (servidor).
export default function ProgramacionIluminacionWrapper() {
  const [isClient, setIsClient] = useState(false);

  // useEffect se ejecuta SOLO en el navegador (cliente)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Si no estamos en el cliente, mostramos un loading sin depender de 'window' o la URL.
  if (!isClient) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="ml-3 text-lg text-teal-600">Preparando el panel de programación...</p>
        </div>
    );
  }

  // Una vez que sabemos que estamos en el cliente, renderizamos el componente principal.
  // Usamos Suspense para manejar cualquier otro hook de cliente que pueda haber.
  return (
    <Suspense 
        fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                <p className="ml-3 text-lg text-teal-600">Cargando la interfaz de usuario...</p>
            </div>
        }
    >
      <ProgramacionIluminacionContent />
    </Suspense>
  );
}
