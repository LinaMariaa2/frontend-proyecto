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

// NO MODIFICADO: Estilos ya están bien definidos
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

// NO MODIFICADO: Estilos ya están bien definidos
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

    // Se mantiene la corrección previa
    const [modalConfirm, setModalConfirm] = useState<Omit<ConfirmModal, 'confirmText'> & { show: boolean, confirmText?: string }>({
        show: false,
        onConfirm: () => {},
        onCancel: () => {}, 
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

    // --- Funciones de Renderizado (Mejoradas) ---
    const getEstadoIcono = (estado: string) => {
        switch (estado) {
            case "activo":
                // Estilo mejorado: Badge verde
                return <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1"/> Activo</span>;
            case "inactivo":
                // Estilo mejorado: Badge rojo
                return <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Inactivo</span>;
            case "mantenimiento":
                // Estilo mejorado: Badge amarillo
                return <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Wrench className="w-3 h-3 mr-1"/> Mantenimiento</span>;
            default:
                return <span className="text-slate-500 text-xs">{estado}</span>;
        }
    };

    const ResponsableDropdown = ({ invernadero }: { invernadero: Invernadero }) => {
        const isOpen = menuOpenId === invernadero.id_invernadero;

        return (
            <div className="relative inline-block text-left" ref={isOpen ? menuRef : null}>
                <button
                    onClick={() => setMenuOpenId(isOpen ? null : invernadero.id_invernadero)}
                    // Pequeña mejora de estilo en el botón de menú
                    className="inline-flex justify-center rounded-full p-2 text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                        <div className="py-1">
                            <button
                                onClick={() => { setMenuOpenId(null); abrirModal(invernadero); }}
                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-600 w-full text-left transition-colors"
                            >
                                <Pencil className="w-4 h-4 mr-2" /> Editar
                            </button>

                            {invernadero.estado !== 'activo' && (
                                <button
                                    onClick={() => cambiarEstado(invernadero.id_invernadero, 'activo')}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 hover:text-green-600 w-full text-left transition-colors"
                                >
                                    <Check className="w-4 h-4 mr-2" /> Activar
                                </button>
                            )}

                            {invernadero.estado !== 'inactivo' && (
                                <button
                                    onClick={() => cambiarEstado(invernadero.id_invernadero, 'inactivo')}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors"
                                >
                                    <CircleDot className="w-4 h-4 mr-2" /> Inactivar
                                </button>
                            )}

                            {invernadero.estado !== 'mantenimiento' && (
                                <button
                                    onClick={() => cambiarEstado(invernadero.id_invernadero, 'mantenimiento')}
                                    className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 hover:text-yellow-600 w-full text-left transition-colors"
                                >
                                    <Wrench className="w-4 h-4 mr-2" /> Mantenimiento
                                </button>
                            )}
                            
                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                                onClick={() => eliminarInvernadero(invernadero.id_invernadero)}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
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
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-2xl font-extrabold text-teal-700">
                        {editarModo ? "Editar Invernadero" : "Crear Nuevo Invernadero"}
                    </h3>
                    <button onClick={cerrarModal} className="text-slate-500 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-50">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleFormSubmit();
                        
                    }}
                    className="space-y-6"
                >
                    {/* Input: Nombre */}
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-1">Nombre del Invernadero</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 border placeholder-slate-400"
                        />
                    </div>

                    {/* Textarea: Descripción */}
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows={3}
                            required
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 border placeholder-slate-400"
                        />
                    </div>

                    {/* SECCIÓN RESPONSABLE (Estilizada) */}
                    <div className="relative p-3 border border-dashed border-teal-300 rounded-lg bg-teal-50">
                        <label htmlFor="responsable" className="block text-sm font-bold text-teal-800 mb-2">
                            Asignar Responsable
                        </label>

                        {/* Indicador de Responsable Actual */}
                        <div className={`mb-3 flex items-center p-2 rounded-lg ${responsableSeleccionado ? 'bg-teal-100 border border-teal-400' : 'bg-red-100 border border-red-400'}`}>
                            <User className={`w-5 h-5 mr-2 ${responsableSeleccionado ? 'text-teal-600' : 'text-red-600'}`} />
                            <span className={`font-semibold text-sm ${responsableSeleccionado ? 'text-teal-800' : 'text-red-800'}`}>
                                {responsableSeleccionado ? `${responsableSeleccionado.nombre_usuario} (${responsableSeleccionado.rol})` : 'Responsable no asignado'}
                            </span>
                        </div>

                        {/* Input de Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar responsable por nombre..."
                                value={busquedaResponsable}
                                onChange={(e) => setBusquedaResponsable(e.target.value)}
                                className="block w-full rounded-lg border-slate-300 shadow-inner focus:border-teal-500 focus:ring-teal-500 p-3 pl-10 border placeholder-slate-400"
                            />
                        </div>

                        {/* Dropdown de Resultados de Búsqueda */}
                        {busquedaResponsable.trim() && responsables.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-2 max-h-48 overflow-y-auto">
                                {responsables.map((resp) => (
                                    <li
                                        key={resp.id_persona}
                                        onClick={() => {
                                            setResponsableSeleccionado(resp);
                                            setForm({ ...form, responsable_id: resp.id_persona });
                                            setBusquedaResponsable("");
                                        }}
                                        className="p-3 flex items-center justify-between hover:bg-teal-50 cursor-pointer text-slate-700 text-sm border-b border-slate-100 last:border-b-0"
                                    >
                                        <span className="font-medium">{resp.nombre_usuario}</span>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{resp.rol}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex justify-end pt-6 border-t mt-6">
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
                            className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed flex items-center shadow-md hover:shadow-lg"
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

    // --- Renderizado Principal del Componente (Estilizado) ---
    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 flex items-center">
                    <Building className="w-7 h-7 mr-3 text-teal-600" /> Gestión de Invernaderos
                </h1>
                <p className="text-slate-500 mt-1">Administra la configuración y el estado de todos tus invernaderos.</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 sm:mb-0">Lista de Invernaderos ({invernaderos.length})</h2>
                    <button
                        onClick={() => abrirModal()}
                        className="flex items-center bg-teal-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg text-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Crear Invernadero
                    </button>
                </div>
                
                {/* Filtro por Responsable */}
                <div className="mb-6 flex flex-col md:flex-row items-start md:items-center">
                    <label htmlFor="filtroResponsable" className="text-sm font-semibold text-slate-700 mb-1 mr-4">Filtrar por Responsable:</label>
                    <select
                        id="filtroResponsable"
                        value={filtroResponsableId || ""}
                        onChange={(e) => setFiltroResponsableId(e.target.value === "" ? null : Number(e.target.value))}
                        // Estilo mejorado en el select
                        className="mt-1 block w-full md:max-w-xs rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 border bg-white"
                    >
                        <option value="">Mostrar todos</option>
                        {/* Aquí podrías listar dinámicamente los responsables si tuvieras esa data */}
                    </select>
                </div>


                {/* Contenido de la Tabla o Carga */}
                {cargando ? (
                    <div className="flex flex-col justify-center items-center p-10 text-teal-600 bg-teal-50 rounded-lg border border-teal-200">
                        <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                        <p className="font-medium">Cargando invernaderos...</p>
                    </div>
                ) : invernaderos.length === 0 ? (
                    <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-200">
                        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                        <p className="text-slate-600 font-bold text-lg">No se encontraron invernaderos.</p>
                        <p className="text-slate-500 mt-2">Crea uno nuevo utilizando el botón "Crear Invernadero".</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto shadow-md rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-teal-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-lg">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Responsable</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Zonas</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider rounded-tr-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {invernaderos.map((inv, index) => (
                                    <tr key={inv.id_invernadero} className="hover:bg-teal-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{inv.id_invernadero}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/dashboard/invernaderos/${inv.id_invernadero}/zonas`} className="text-teal-600 hover:text-teal-800 font-bold flex items-center group">
                                                {inv.nombre}
                                                <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {inv.encargado ? `${inv.encargado.nombre_usuario} ` : 'N/A'}
                                            {inv.encargado && <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{inv.encargado.rol}</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                                            <span className="font-bold text-teal-600">{inv.zonas_activas}</span> / {inv.zonas_totales}
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