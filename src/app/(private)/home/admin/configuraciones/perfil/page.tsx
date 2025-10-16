"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/app/services/api"; 
import { 
  UserCircle, Camera, BadgeCheck, XCircle, 
  AlertTriangle, Loader2, Save, Eye, EyeOff 
} from "lucide-react";
import axios from "axios";

// --- Interfaces y Tipos ---
interface Perfil {
  id_persona: number;
  nombre_usuario: string;
  correo: string;
  rol: "admin" | "operario";
  estado: "activo" | "inactivo" | "mantenimiento";
  isVerified: boolean;
  foto_url?: string;
  createdAt: string;
  updatedAt: string;
  perfil?: { foto_url?: string };
}

interface EditForm {
  nombre_usuario: string;
  correo: string;
  contrasena: string;
}

interface ModalMessageState {
  show: boolean;
  title: string;
  message: string;
  success: boolean;
}

interface MessageModalProps {
  title: string;
  message: string;
  onCerrar: () => void;
  success?: boolean;
}

interface StatusBadgeProps {
  estado: Perfil["estado"];
}

const formInicial: EditForm = { nombre_usuario: "", correo: "", contrasena: "" };

// --- Componentes auxiliares ---
const MessageModal = ({ title, message, onCerrar, success = true }: MessageModalProps) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      {success ? (
        <BadgeCheck className="w-16 h-16 mx-auto text-teal-500 mb-4" />
      ) : (
        <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
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

const StatusBadge = ({ estado }: StatusBadgeProps) => {
  const variants: Record<Perfil["estado"], string> = {
    activo: "bg-teal-100 text-teal-800",
    inactivo: "bg-amber-100 text-amber-800",
    mantenimiento: "bg-slate-200 text-slate-800",
  };
  return (
    <span
      className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${
        variants[estado] || variants.mantenimiento
      }`}
    >
      {estado}
    </span>
  );
};

// --- Componente Principal ---
export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(formInicial);
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState<ModalMessageState>({
    show: false,
    title: "",
    message: "",
    success: true,
  });

  // Cargar perfil
  const fetchPerfil = async () => {
    try {
      const response = await api.get("/perfil");
      const fetchedPerfil: Perfil = response.data;
      const fotoUrl =
        fetchedPerfil.perfil?.foto_url ||
        fetchedPerfil.foto_url ||
        "/images/default-avatar.png";

      setPerfil({ ...fetchedPerfil, foto_url: fotoUrl });
      setEditForm({
        nombre_usuario: fetchedPerfil.nombre_usuario,
        correo: fetchedPerfil.correo,
        contrasena: "",
      });
    } catch (err) {
      let errorMessage = "No se pudo cargar la información del perfil.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || errorMessage;
      }
      setModalMessage({
        show: true,
        success: false,
        title: "Error de Carga",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoArchivo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPerfil((prev) => (prev ? { ...prev, foto_url: reader.result as string } : null));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardar = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const dataToUpdate: Partial<Perfil & { contrasena?: string }> = {
        nombre_usuario: editForm.nombre_usuario,
        correo: editForm.correo,
      };
      if (editForm.contrasena) {
        dataToUpdate.contrasena = editForm.contrasena;
      }

      await api.put("/perfil", dataToUpdate);

      if (fotoArchivo) {
        const formData = new FormData();
        formData.append("foto", fotoArchivo);
        await api.post("/perfil/foto", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await fetchPerfil();
      setModalMessage({
        show: true,
        success: true,
        title: "Éxito",
        message: "Perfil actualizado correctamente.",
      });
    } catch (err) {
      let errorMessage = "Error al actualizar el perfil.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || errorMessage;
      }
      setModalMessage({
        show: true,
        success: false,
        title: "Error de Actualización",
        message: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <p className="text-slate-500 mt-4">Cargando perfil...</p>
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <main className="w-full bg-slate-50 min-h-screen p-6 sm:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <UserCircle className="w-10 h-10 text-slate-500" />
            <span>Mi Perfil</span>
          </h1>
          <p className="text-lg text-slate-500 mt-1">
            Gestiona tu información personal y de acceso.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <label className="relative w-24 h-24 mx-auto cursor-pointer group">
              <Image
                src={perfil.foto_url || "/images/default-avatar.png"}
                alt="Foto de perfil"
                width={96}
                height={96}
                className="object-cover w-full h-full rounded-full border-4 border-white shadow-md"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
            </label>
            <h2 className="text-2xl font-bold text-slate-800 mt-4">{perfil.nombre_usuario}</h2>
            <p className="text-slate-500">{perfil.correo}</p>

            <div className="text-left space-y-3 mt-6 pt-6 border-t border-slate-200">
              <p className="flex items-center justify-between">
                <strong className="font-semibold text-slate-600">Rol:</strong>{" "}
                <span className="capitalize">{perfil.rol}</span>
              </p>
              <p className="flex items-center justify-between">
                <strong className="font-semibold text-slate-600">Estado:</strong>{" "}
                <StatusBadge estado={perfil.estado} />
              </p>
              <p className="flex items-center justify-between">
                <strong className="font-semibold text-slate-600">Verificado:</strong>{" "}
                {perfil.isVerified ? (
                  <BadgeCheck className="w-5 h-5 text-teal-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </p>
              <p className="text-xs text-slate-400 text-center pt-4">
                Miembro desde{" "}
                {new Date(perfil.createdAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Editar Información</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={editForm.nombre_usuario}
                  onChange={(e) => setEditForm({ ...editForm, nombre_usuario: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={editForm.correo}
                  onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={editForm.contrasena}
                    onChange={(e) => setEditForm({ ...editForm, contrasena: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Déjalo vacío si no deseas cambiarla.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-8 mt-8 border-t border-slate-200">
              <button
                onClick={handleGuardar}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:bg-teal-400"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalMessage.show && (
        <MessageModal
          title={modalMessage.title}
          message={modalMessage.message}
          success={modalMessage.success}
          onCerrar={() => setModalMessage({ ...modalMessage, show: false })}
        />
      )}
    </main>
  );
}
