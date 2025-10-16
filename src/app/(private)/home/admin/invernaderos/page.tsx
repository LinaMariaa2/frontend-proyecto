"use client";
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/app/services/api"; // ✅ Importamos nuestro cliente configurado

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

interface ConfirmModal {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
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

// --- Modales Personalizados ---
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

    const [modalConfirm, setModalConfirm] = useState({
        show: false,
        onConfirm: () => {},
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

    // ✅ Obtener Invernaderos (usa api.ts)
    const obtenerInvernaderos = async (responsableId: number | null = filtroResponsableId) => {
        setCargando(true);
        try {
            let url = "/api/invernadero";
            if (responsableId) {
                url = `/api/invernadero/operario/${responsableId}`;
            }
            const response = await api.get(url);
            setInvernaderos(response.data);
        } catch (error) {
            console.error("Error al obtener invernaderos:", error);
            setModalMessage({
                show: true,
                title: "Error de Carga",
                message: "No se pudieron obtener los datos de los invernaderos.",
                success: false,
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerInvernaderos(filtroResponsableId);
    }, [filtroResponsableId]);

    // ✅ Búsqueda de responsables
    useEffect(() => {
        if (!busquedaResponsable.trim()) {
            setResponsables([]);
            return;
        }

        const controller = new AbortController();
        const debounce = setTimeout(async () => {
            try {
                const response = await api.get(`/api/persona?filtro=${encodeURIComponent(busquedaResponsable)}`, {
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
                await api.put(`/api/invernadero/${editarModo}`, payload);
            } else {
                await api.post("/api/invernadero", { ...payload, estado: "activo" });
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
                await api.patch(`/api/invernadero/${ruta}/${id}`);
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
            title: `Cambiar Estado a ${nuevoEstado}`,
            message: `¿Estás seguro de que quieres cambiar el estado de este invernadero?`,
            confirmText: "Confirmar",
            onConfirm,
        });
    };

    // ✅ Eliminar invernadero
    const eliminarInvernadero = (id: number) => {
        setModalConfirm({
            show: true,
            title: "Eliminar Invernadero",
            message: "Esta acción es permanente y no se puede deshacer. ¿Continuar?",
            confirmText: "Eliminar",
            onConfirm: async () => {
                try {
                    await api.delete(`/api/invernadero/${id}`);
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
        });
    };
}
