"use client";
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/app/services/api"; 

import {
    Search,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    X,
    User,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    Building,
    Check,
    CircleDot,
    Wrench,
    ChevronRight
} from "lucide-react";
import axios from 'axios';

// --- Interfaces ---
interface Invernadero {
    id_invernadero: number;
    nombre: string;
    descripcion: string;
    responsable_id: number;
    estado: "activo" | "inactivo" | "mantenimiento";
    zonas_totales: number;
    zonas_activas: number;
    encargado?: Responsable;
}

interface Responsable {
    id_persona: number;
    nombre_usuario: string;
    rol: string;
    estado: string;
}

// ⭐ CORRECCIÓN CLAVE: Se añade 'onCancel' a la interfaz
interface ConfirmModal {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void; // ✅ Propiedad faltante añadida
    confirmText?: string;
}

const formInicial = {
    id_invernadero: 0,
    nombre: "",
    descripcion: "",
    responsable_id: 0,
    estado: "activo" as "activo" | "inactivo" | "mantenimiento",
    zonas_totales: 0,
    zonas_activas: 0,
};

interface MessageModalProps {
    title: string;
    message: string;
    onCerrar: () => void;
    success?: boolean;
}

// --- Modales Personalizados (Componentes) ---
const ConfirmModal: React.FC<ConfirmModal> = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
}) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
                        confirmText === "Eliminar"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-teal-600 hover:bg-teal-700"
                    }`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);

const MessageModal: React.FC<MessageModalProps> = ({
    title,
    message,
    onCerrar,
    success = true,
}) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            {success ? (
                <CheckCircle2 className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            ) : (
                <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            )}
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <button
                onClick={onCerrar}
                className="w-full px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
            >
                Entendido
            </button>
        </div>
    </div>
);

// --- Componente Principal ---

export default function InvernaderosPage() {
    const [invernaderos, setInvernaderos] = useState<Invernadero[]>([]);
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [busquedaResponsable, setBusquedaResponsable] = useState("");
    const [responsableSeleccionado, setResponsableSeleccionado] = useState<Responsable | null>(null);
    const [filtroResponsableId, setFiltroResponsableId] = useState<number | null>(null);
    const [form, setForm] = useState(formInicial);
    const [modalOpen, setModalOpen] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [editarModo, setEditarModo] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // ⭐ CORRECCIÓN CLAVE: Se añade 'onCancel' a la inicialización del estado
    const [modalConfirm, setModalConfirm] = useState<Omit<ConfirmModal, 'confirmText'> & { show: boolean, confirmText?: string }>({
        show: false,
        onConfirm: () => {},
        onCancel: () => {}, // ✅ Propiedad faltante añadida
        title: "",
        message: "",
        confirmText: "Confirmar",
    });
    
    const [modalMessage, setModalMessage] = useState({
        show: false,
        title: "",
        message: "",
        success: true,
    });

    // ⭐ FUNCIÓN CLAVE: Obtener Invernaderos
    const obtenerInvernaderos = async (responsableId: number | null = filtroResponsableId) => {
        setCargando(true);
        try {
            let url = "/invernadero"; 
            
            if (responsableId && responsableId !== 0) {
                url = `/invernadero/operario/${responsableId}`;
            }

            console.log(`DEBUG: API Call URL: ${url}`);
            const response = await api.get(url);
            
            if (Array.isArray(response.data)) {
                setInvernaderos(response.data);
            } else {
                 console.error("Respuesta inesperada de la API (no es un array):", response.data);
                 setInvernaderos([]); 
            }
        } catch (error: any) {
            console.error("Error al obtener invernaderos:", error);
            setModalMessage({
                show: true,
                title: "Error de Carga",
                message: error.response?.data?.error || "No se pudieron obtener los datos de los invernaderos. Revisa la consola y tu backend.",
                success: false,
            });
            setInvernaderos([]);
        } finally {
            setCargando(false);
        }
    };

    // ⭐ useEffect CLAVE: Se ejecuta al montar y cuando el filtro cambia
    useEffect(() => {
        obtenerInvernaderos(filtroResponsableId);
    }, [filtroResponsableId]);

    // ✅ Búsqueda de responsables (Mantengo tu lógica original)
    useEffect(() => {
        if (!busquedaResponsable.trim()) {
            setResponsables([]);
            return;
        }

        const controller = new AbortController();
        const debounce = setTimeout(async () => {
            try {
                const response = await api.get(`/persona?filtro=${encodeURIComponent(busquedaResponsable)}`, {
                    signal: controller.signal,
                });
                setResponsables(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                if (!axios.isCancel(error)) console.error("Error al obtener responsables:", error);
            }
        }, 400);

        return () => {
            controller.abort();
            clearTimeout(debounce);
        };
    }, [busquedaResponsable]);

    // ✅ Manejo de click fuera para el menú de acciones
    useEffect(() => {
        const manejarClickFuera = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener("mousedown", manejarClickFuera);
        return () => document.removeEventListener("mousedown", manejarClickFuera);
    }, []);

    const abrirModal = (inv: Invernadero | null = null) => {
        if (inv) {
            setEditarModo(inv.id_invernadero);
            setForm({ ...inv, responsable_id: inv.responsable_id || 0 });
            if (inv.encargado) setResponsableSeleccionado(inv.encargado);
        } else {
            setEditarModo(null);
            setForm(formInicial);
            setResponsableSeleccionado(null);
        }
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setBusquedaResponsable("");
        setResponsables([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // ✅ Crear o actualizar invernadero
    const handleFormSubmit = async () => {
        if (!form.nombre.trim() || !form.descripcion.trim() || !form.responsable_id) {
            setModalMessage({
                show: true,
                title: "Campos Incompletos",
                message: "Por favor, completa el nombre, la descripción y asigna un responsable.",
                success: false,
            });
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                nombre: form.nombre,
                descripcion: form.descripcion,
                responsable_id: form.responsable_id,
            };
            if (editarModo) {
                await api.put(`/invernadero/${editarModo}`, payload);
            } else {
                await api.post("/invernadero", { ...payload, estado: "activo" });
            }
            await obtenerInvernaderos();
            cerrarModal();
            setModalMessage({
                show: true,
                title: "Éxito",
                message: `El invernadero "${payload.nombre}" se ha guardado correctamente.`,
                success: true,
            });
        } catch (error: any) {
            const mensaje =
                error.response?.data?.error ||
                `Error al ${editarModo ? "actualizar" : "crear"} el invernadero.`;
            setModalMessage({ show: true, title: "Error", message: mensaje, success: false });
        } finally {
            setGuardando(false);
        }
    };

    // ✅ Cambiar estado
    const cambiarEstado = (id: number, nuevoEstado: string) => {
        const onConfirm = async () => {
            try {
                const ruta = {
                    activo: "activar",
                    inactivo: "inactivar",
                    mantenimiento: "mantenimiento",
                }[nuevoEstado];
                await api.patch(`/invernadero/${ruta}/${id}`);
                await obtenerInvernaderos();
                setModalMessage({
                    show: true,
                    title: "Estado Actualizado",
                    message: "El estado del invernadero ha sido actualizado.",
                    success: true,
                });
            } catch (error: any) {
                setModalMessage({
                    show: true,
                    title: "Error",
                    message: error.response?.data?.error || "No se pudo cambiar el estado.",
                    success: false,
                });
            } finally {
                setModalConfirm({ ...modalConfirm, show: false });
                setMenuOpenId(null);
            }
        };
        // Línea 339
        setModalConfirm({
            show: true,
            title: `Cambiar Estado a ${nuevoEstado.toUpperCase()}`,
            message: `¿Estás seguro de que quieres cambiar el estado de este invernadero a ${nuevoEstado}?`,
            confirmText: "Confirmar",
            onConfirm,
            onCancel: () => setModalConfirm({ ...modalConfirm, show: false }) 
        });
    };

    // ✅ Eliminar invernadero
    const eliminarInvernadero = (id: number) => {
        setModalConfirm({
            show: true,
            title: "Eliminar Invernadero",
            message: "Esta acción es permanente y solo se puede realizar si está Inactivo. ¿Continuar?",
            confirmText: "Eliminar",
            onConfirm: async () => {
                try {
                    await api.delete(`/invernadero/${id}`);
                    await obtenerInvernaderos();
                    setModalMessage({
                        show: true,
                        title: "Eliminado",
                        message: "El invernadero ha sido eliminado.",
                        success: true,
                    });
                } catch (error: any) {
                    setModalMessage({
                        show: true,
                        title: "Error",
                        message:
                            error.response?.data?.error || "No se pudo eliminar el invernadero.",
                        success: false,
                    });
                } finally {
                    setModalConfirm({ ...modalConfirm, show: false });
                    setMenuOpenId(null);
                }
            },
            // Línea 373
            onCancel: () => setModalConfirm({ ...modalConfirm, show: false }) 
        });
    };

    // --- Funciones de Renderizado ---
    const getEstadoIcono = (estado: string) => {
        switch (estado) {
            case "activo":
                return <span className="flex items-center text-green-600 font-semibold text-sm"><Check className="w-4 h-4 mr-1"/> Activo</span>;
            case "inactivo":
                return <span className="flex items-center text-red-600 font-semibold text-sm"><XCircle className="w-4 h-4 mr-1"/> Inactivo</span>;
            case "mantenimiento":
                return <span className="flex items-center text-yellow-600 font-semibold text-sm"><Wrench className="w-4 h-4 mr-1"/> Mantenimiento</span>;
            default:
                return <span className="text-slate-500 text-sm">{estado}</span>;
        }
    };

    const ResponsableDropdown = ({ invernadero }: { invernadero: Invernadero }) => {
        const isOpen = menuOpenId === invernadero.id_invernadero;

        return (
            <div className="relative inline-block text-left" ref={isOpen ? menuRef : null}>
                <button
                    onClick={() => setMenuOpenId(isOpen ? null : invernadero.id_invernadero)}
                    className="inline-flex justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1">
                            <button
                                onClick={() => { setMenuOpenId(null); abrirModal(invernadero); }}
                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
                            >
                                <Pencil className="w-4 h-4 mr-2" /> Editar
                            </button>

                            {invernadero.estado !== 'activo' && (
                                <button
                                    onClick={() => cambiarEstado(invernadero.id_invernadero, 'activo')}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-slate-100 w-full text-left"
                                >
                                    <Check className="w-4 h-4 mr-2" /> Activar
                                </button>
                            )}

                            {invernadero.estado !== 'inactivo' && (
                                <button
                                    onClick={() => cambiarEstado(invernadero.id_invernadero, 'inactivo')}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-slate-100 w-full text-left"
                                >
                                    <CircleDot className="w-4 h-4 mr-2" /> Inactivar
                                </button>
                            )}

                            {invernadero.estado !== 'mantenimiento' && (
                                <button
                                    onClick={() => cambiarEstado(invernadero.id_invernadero, 'mantenimiento')}
                                    className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-slate-100 w-full text-left"
                                >
                                    <Wrench className="w-4 h-4 mr-2" /> Mantenimiento
                                </button>
                            )}
                            
                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                                onClick={() => eliminarInvernadero(invernadero.id_invernadero)}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- Lógica de Modales ---

    const ModalCrearEditar = () => (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-teal-700">
                        {editarModo ? "Editar Invernadero" : "Crear Nuevo Invernadero"}
                    </h3>
                    <button onClick={cerrarModal} className="text-slate-500 hover:text-slate-800 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleFormSubmit();
                        
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows={3}
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 border"
                        />
                    </div>

                    {/* SECCIÓN RESPONSABLE */}
                    <div className="relative">
                        <label htmlFor="responsable" className="block text-sm font-medium text-slate-700 mb-1">
                            Responsable Asignado:
                            {responsableSeleccionado ? (
                                <span className="text-teal-600 font-semibold ml-2">
                                    {responsableSeleccionado.nombre_usuario}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">No asignado</span>
                            )}
                        </label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar responsable por nombre..."
                                value={busquedaResponsable}
                                onChange={(e) => setBusquedaResponsable(e.target.value)}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 pl-10 border"
                            />
                        </div>

                        {busquedaResponsable.trim() && responsables.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                {responsables.map((resp) => (
                                    <li
                                        key={resp.id_persona}
                                        onClick={() => {
                                            setResponsableSeleccionado(resp);
                                            setForm({ ...form, responsable_id: resp.id_persona });
                                            setBusquedaResponsable("");
                                        }}
                                        className="p-2 flex items-center justify-between hover:bg-teal-50 cursor-pointer text-slate-700 text-sm"
                                    >
                                        <span>{resp.nombre_usuario} ({resp.rol})</span>
                                        <User className="w-4 h-4 text-slate-400" />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={cerrarModal}
                            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors mr-3"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:bg-teal-400 flex items-center"
                        >
                            {guardando ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...
                                </>
                            ) : (
                                <>{editarModo ? "Guardar Cambios" : "Crear Invernadero"}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // --- Renderizado Principal del Componente ---
    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 flex items-center">
                    <Building className="w-7 h-7 mr-3 text-teal-600" /> Gestión de Invernaderos
                </h1>
                <p className="text-slate-500 mt-1">Administra la configuración y el estado de todos tus invernaderos.</p>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                {/* Toolbar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-700">Invernaderos Registrados ({invernaderos.length})</h2>
                    <button
                        onClick={() => abrirModal()}
                        className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Crear Invernadero
                    </button>
                </div>
                
                {/* Filtro por Responsable */}
                <div className="mb-6">
                    <label htmlFor="filtroResponsable" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por Responsable:</label>
                    <select
                        id="filtroResponsable"
                        value={filtroResponsableId || ""}
                        onChange={(e) => setFiltroResponsableId(e.target.value === "" ? null : Number(e.target.value))}
                        className="mt-1 block w-full max-w-xs rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 border"
                    >
                        <option value="">Mostrar todos</option>
                        {/* Aquí podrías listar dinámicamente los responsables si tuvieras esa data */}
                    </select>
                </div>


                {/* Contenido de la Tabla o Carga */}
                {cargando ? (
                    <div className="flex justify-center items-center p-10 text-teal-600">
                        <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                        Cargando invernaderos...
                    </div>
                ) : invernaderos.length === 0 ? (
                    <div className="text-center p-10 bg-slate-50 rounded-lg">
                        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                        <p className="text-slate-600 font-semibold">No se encontraron invernaderos.</p>
                        <p className="text-slate-500 text-sm">Crea uno nuevo para empezar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Responsable</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Zonas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {invernaderos.map((inv) => (
                                    <tr key={inv.id_invernadero} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{inv.id_invernadero}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/dashboard/invernaderos/${inv.id_invernadero}/zonas`} className="text-teal-600 hover:text-teal-800 font-semibold flex items-center">
                                                {inv.nombre}
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {inv.encargado ? `${inv.encargado.nombre_usuario} (${inv.encargado.rol})` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {inv.zonas_activas} / {inv.zonas_totales} (Activas/Totales)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getEstadoIcono(inv.estado)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <ResponsableDropdown invernadero={inv} />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && <ModalCrearEditar />}
            {modalConfirm.show && (
                <ConfirmModal
                    title={modalConfirm.title}
                    message={modalConfirm.message}
                    onConfirm={modalConfirm.onConfirm}
                    onCancel={modalConfirm.onCancel} // Uso de la propiedad corregida
                    confirmText={modalConfirm.confirmText}
                />
            )}
            {modalMessage.show && (
                <MessageModal
                    title={modalMessage.title}
                    message={modalMessage.message}
                    onCerrar={() => setModalMessage({ ...modalMessage, show: false })}
                    success={modalMessage.success}
                />
            )}
        </div>
    );
}