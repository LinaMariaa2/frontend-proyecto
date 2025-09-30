'use client';

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Droplets, Leaf, AlertCircle, Sun, X, Thermometer } from "lucide-react";
import io from "socket.io-client";

// INTERFAZ PARA LOS DATOS DEL HISTORIAL DE ILUMINACIÓN
interface HistorialIluminacion {
  id_historial_iluminacion: number;
  fecha_activacion: string;
  duracion_minutos: number;
  zona: {
    id_zona: number;
    nombre: string;
    invernadero: {
      id_invernadero: number;
      nombre: string;
    };
  };
}

interface Invernadero {
  id_invernadero: number;
  nombre: string;
}

interface Zona {
  id_zona: number;
  nombre: string;
}

interface EstadisticasZonas {
  activo: number;
  inactivo: number;
  mantenimiento: number;
}

// 🔹 Nueva interfaz para tipar datos de socket
interface LecturaDHT11 {
  tipo: "dht11";
  temperatura?: number;
  humedad?: number;
  unidadTemp?: string;
  unidadHum?: string;
  timestamp: string;
}
const datosIluminacion = {
  Dia: [
    { dia: "Lun", iluminacion: 3 },
    { dia: "Mar", iluminacion: 5 },
    { dia: "Mié", iluminacion: 4 },
    { dia: "Jue", iluminacion: 6 },
    { dia: "Vie", iluminacion: 3 },
    { dia: "Sáb", iluminacion: 2 },
    { dia: "Dom", iluminacion: 5 },
  ],
  Semana: [
    { dia: "Semana 1", iluminacion: 26 },
    { dia: "Semana 2", iluminacion: 31 },
  ],
  Mes: [
    { dia: "Jul", iluminacion: 108 },
    { dia: "Jun", iluminacion: 95 },
  ],
};

const coloresPie = ["#fd8b08ff", "#f0fc4dff", "#fbbf24"];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// CARD GENERAL
function Card({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white shadow rounded-xl p-4 flex flex-col items-center text-center hover:ring-2 hover:ring-yellow-300 transition"
    >
      <div className="text-yellow-500 mb-1">{icon}</div>
      <h3 className="text-xs text-gray-500">{title}</h3>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

// SENSOR CARD
function SensorCard({
  icon,
  titulo,
  valor,
  descripcion,
}: {
  icon: React.ReactNode;
  titulo: string;
  valor: string;
  descripcion: string;
}) {
  return (
    <div className="bg-gray-100 border border-gray-200 p-4 rounded-xl shadow-sm flex gap-4 items-start">
      <div className="p-2 bg-white rounded-full shadow">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-800">{titulo}</h3>
        <p className="text-lg font-bold text-gray-700">{valor}</p>
        <p className="text-gray-500 text-xs">{descripcion}</p>
      </div>
    </div>
  );
}

interface ModalContentProps {
  title: string;
  data: Invernadero[] | Zona[];
  dataType: "invernaderos" | "zonas";
  isLoading: boolean;
}

function ModalContent({
  title,
  data,
  dataType,
  isLoading,
}: ModalContentProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-slate-800">{title}</h2>
      {isLoading ? (
        <p className="text-center text-gray-500 py-4">Cargando...</p>
      ) : data.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          {data.map((item, idx) => (
            <li key={idx} className="bg-gray-50 p-2 rounded-lg">
              {"nombre" in item ? item.nombre : "Elemento"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">
          No hay {dataType} activos.
        </p>
      )}
    </div>
  );
}

export default function EstadisticasIluminacion() {
  const [filtro, setFiltro] = useState<"Dia" | "Semana" | "Mes">("Dia");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState<Invernadero[] | Zona[]>([]);
  const [modalDataType, setModalDataType] =
    useState<"invernaderos" | "zonas">("invernaderos");
  const [isLoading, setIsLoading] = useState(false);
  const [invernaderosActivosCount, setInvernaderosActivosCount] = useState(0);
  const [zonasActivasCount, setZonasActivasCount] = useState(0);
  const [zonasEstadisticas, setZonasEstadisticas] = useState<
    { nombre: string; valor: number }[]
  >([]);

  const [historialIluminacion, setHistorialIluminacion] = useState<
    HistorialIluminacion[]
  >([]);

  // NUEVOS ESTADOS: lecturas del DHT11
  const [humedad, setHumedad] = useState<string>("-- %");
  const [temperatura, setTemperatura] = useState<string>("-- °C");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const invernaderosRes = await fetch(
          `${BACKEND_URL}/api/invernadero/datos-activos`
        );
        if (invernaderosRes.ok) {
          const invernaderos = await invernaderosRes.json();
          setInvernaderosActivosCount(invernaderos.length);
        }

        const zonasRes = await fetch(
          `${BACKEND_URL}/api/zona/datos-activos`
        );
        if (zonasRes.ok) {
          const zonas = await zonasRes.json();
          setZonasActivasCount(zonas.length);
        }
      } catch (error) {
        console.error("Error al obtener los conteos de activos:", error);
      }
    };

    const fetchEstadisticasZonas = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/zona/estadisticas`);
        if (res.ok) {
          const stats: EstadisticasZonas = await res.json();
          const formattedData = [
            { nombre: "Activas", valor: stats.activo },
            { nombre: "Inactivas", valor: stats.inactivo },
            { nombre: "Mantenimiento", valor: stats.mantenimiento },
          ].filter((data) => data.valor > 0);
          setZonasEstadisticas(formattedData);
        }
      } catch (error) {
        console.error("Error al obtener estadísticas de zonas:", error);
      }
    };

    const fetchHistorialIluminacion = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/historialIluminacion/`);
        if (res.ok) {
          const data = await res.json();
          setHistorialIluminacion(data);
        } else {
          setHistorialIluminacion([]);
        }
      } catch (error) {
        console.error("Error al obtener el historial de iluminación:", error);
        setHistorialIluminacion([]);
      }
    };

    fetchCounts();
    fetchEstadisticasZonas();
    fetchHistorialIluminacion();
  }, []);

 // 🔹 CONEXIÓN A SOCKET.IO PARA ESCUCHAR NUEVAS LECTURAS DEL DHT11
useEffect(() => {
  const socket = io("http://localhost:4000", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Conectado al servidor de sockets");
  });

  socket.on("nuevaLecturaDHT11", (data: LecturaDHT11) => {
    console.log("📡 Evento nuevaLecturaDHT11 recibido:", data);

    if (data.tipo === "dht11") {
      if (typeof data.temperatura === "number") {
        setTemperatura(`${data.temperatura.toFixed(1)} °C`);
      }
      if (typeof data.humedad === "number") {
        setHumedad(`${data.humedad.toFixed(1)} %`);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("⚠️ Desconectado del servidor de sockets");
  });

  return () => {
    socket.disconnect();
  };
}, []);




  const fetchInvernaderosActivos = async () => {
    setIsLoading(true);
    setModalTitle("Invernaderos Activos");
    setModalDataType("invernaderos");
    setShowModal(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/invernadero/datos-activos`);
      if (!res.ok) {
        throw new Error("Error al obtener los invernaderos activos");
      }
      const data: Invernadero[] = await res.json();
      setModalData(data);
    } catch (error) {
      console.error("Error al obtener invernaderos:", error);
      setModalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZonasActivas = async () => {
    setIsLoading(true);
    setModalTitle("Zonas Activas");
    setModalDataType("zonas");
    setShowModal(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/zona/datos-activos`);
      if (!res.ok) {
        throw new Error("Error al obtener las zonas activas");
      }
      const data: Zona[] = await res.json();
      setModalData(data);
    } catch (error) {
      console.error("Error al obtener zonas:", error);
      setModalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const datosFiltrados = datosIluminacion[filtro];

  return (
    <div className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen space-y-8 transition-all duration-300 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Estadísticas de Iluminación
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <Card
          icon={<Leaf size={20} />}
          title="Invernaderos Activos"
          value={invernaderosActivosCount}
          onClick={fetchInvernaderosActivos}
        />
        <Card
          icon={<Droplets size={20} />}
          title="Zonas Activas"
          value={zonasActivasCount}
          onClick={fetchZonasActivas}
        />
        <Card icon={<Sun size={20} />} title="Iluminaciones Hoy" value={4} />
        <Card icon={<AlertCircle size={20} />} title="Alertas Activas" value="0" />
      </div>

      <div className="bg-white shadow-lg rounded-xl p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-xl text-gray-800">
            Historial de Iluminación
          </h2>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "Dia" | "Semana" | "Mes")}
            className="border rounded-md px-2 py-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="Dia">Por día</option>
            <option value="Semana">Por semana</option>
            <option value="Mes">Por mes</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={datosFiltrados}>
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="iluminacion"
              stroke="#facc15e1"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="font-semibold text-xl mb-4 text-gray-800">
            Estado de Zonas
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            {zonasEstadisticas.length > 0 ? (
              <PieChart>
                <Pie
                  data={zonasEstadisticas}
                  dataKey="valor"
                  nameKey="nombre"
                  outerRadius={80}
                  label
                >
                  {zonasEstadisticas.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={coloresPie[index % coloresPie.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <p>No hay datos de zonas para mostrar.</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 overflow-y-auto max-h-80">
          <h2 className="font-semibold text-xl mb-4 text-gray-800">
            Historial de Eventos
          </h2>
          {historialIluminacion.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="text-gray-600 sticky top-0 bg-white">
                <tr className="bg-gray-100">
                  <th className="py-2 px-2 text-left rounded-tl-lg">Fecha</th>
                  <th className="py-2 px-2 text-left">Invernadero</th>
                  <th className="py-2 px-2 text-left">Zona</th>
                  <th className="py-2 px-2 text-left rounded-tr-lg">
                    Duración (min)
                  </th>
                </tr>
              </thead>
              <tbody>
                {historialIluminacion.map((item, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-2">
                      {new Date(item.fecha_activacion).toLocaleDateString(
                        "es-ES",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {item.zona?.invernadero?.nombre || "N/A"}
                    </td>
                    <td className="py-2 px-2">{item.zona?.nombre || "N/A"}</td>
                    <td className="py-2 px-2">{item.duracion_minutos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 py-10">
              <p className="text-center">
                No hay eventos de iluminación para mostrar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN: LECTURAS EN TIEMPO REAL (DHT11) */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="font-semibold text-xl mb-4 text-gray-800">
          Lecturas en Tiempo Real
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <SensorCard
            icon={<Droplets size={20} className="text-blue-500" />}
            titulo="Humedad Ambiente"
            valor={humedad}
            descripcion="Lectura actual del sensor DHT11"
          />
          <SensorCard
            icon={<Thermometer size={20} className="text-red-500" />}
            titulo="Temperatura Ambiente"
            valor={temperatura}
            descripcion="Lectura actual del sensor DHT11"
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
              onClick={() => setShowModal(false)}
            >
              <X size={24} />
            </button>
            <ModalContent
              title={modalTitle}
              data={modalData}
              dataType={modalDataType}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
