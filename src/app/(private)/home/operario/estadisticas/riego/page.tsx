"use client";

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
import { Droplets, Sun, Leaf, AlertCircle } from "lucide-react";
import io from "socket.io-client";

const resumen = {
  invernaderosActivos: 3,
  totalInvernaderos: 5,
  zonasActivas: 10,
  totalZonas: 15,
  riegosHoy: 5,
  iluminacionActiva: 2,
};

const datosRiego = {
  Dia: [
    { dia: "Lun", riego: 4 },
    { dia: "Mar", riego: 2 },
    { dia: "Mié", riego: 3 },
    { dia: "Jue", riego: 5 },
    { dia: "Vie", riego: 4 },
    { dia: "Sáb", riego: 1 },
    { dia: "Dom", riego: 3 },
  ],
  Semana: [
    { dia: "Semana 1", riego: 22 },
    { dia: "Semana 2", riego: 18 },
  ],
  Mes: [
    { dia: "Jul", riego: 90 },
    { dia: "Jun", riego: 85 },
  ],
};

const zonasEstado = [
  { nombre: "Activas", valor: 10 },
  { nombre: "Inactivas", valor: 3 },
  { nombre: "Mantenimiento", valor: 2 },
];

const coloresPie = ["#4581dbff", "#10B981", "#22D3EE"];

const historial = [
  { fecha: "20/07", invernadero: "Inv-1", zona: "Zona 1", tipo: "Riego", accion: "Activado", estado: "Completado" },
  { fecha: "20/07", invernadero: "Inv-2", zona: "Zona 2", tipo: "Riego", accion: "Desactivado", estado: "Pendiente" },
  { fecha: "19/07", invernadero: "Inv-1", zona: "Zona 3", tipo: "Riego", accion: "Activado", estado: "OK" },
];

// --- Interfaz para la lectura DHT11 (tipada) ---
interface LecturaDHT11 {
  tipo: "dht11";
  temperatura?: number | null;
  humedad?: number | null;
  unidadTemp?: string;
  unidadHum?: string;
  timestamp: string;
}

export default function EstadisticasPage() {
  const [filtro, setFiltro] = useState<"Dia" | "Semana" | "Mes">("Dia");
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Estados para DHT11
  const [temperatura, setTemperatura] = useState<string>("-- °C");
  const [humedad, setHumedad] = useState<string>("-- %");

  useEffect(() => {
    // Usamos localhost:4000 como en tu ejemplo (si necesitas usar env, lo cambiamos luego)
    const socket = io("https://backendhortitech.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor de sockets (Operario)");
    });

    socket.on("nuevaLecturaDHT11", (data: LecturaDHT11) => {
      console.log("📡 Evento nuevaLecturaDHT11 recibido:", data);

      if (data.tipo === "dht11") {
        if (typeof data.temperatura === "number") {
          // usa unidad si viene o "°C" por defecto
          const unidad = data.unidadTemp ?? "°C";
          setTemperatura(`${data.temperatura.toFixed(1)} ${unidad}`);
        }
        if (typeof data.humedad === "number") {
          const unidad = data.unidadHum ?? "%";
          setHumedad(`${data.humedad.toFixed(1)} ${unidad}`);
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

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
    setShowModal(true);
  };

  const datosFiltrados = datosRiego[filtro];

  return (
    <div className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen space-y-8 transition-all duration-300">
      <h1 className="text-3xl font-bold mb-4">Estadísticas de Riego</h1>

      {/* Cards resumen con onClick */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <Card icon={<Leaf size={20} />} title="Invernaderos Activos" value={`${resumen.invernaderosActivos} / ${resumen.totalInvernaderos}`} onClick={() =>
          openModal(<ModalContent title="Invernaderos Activos" items={["Inv-1", "Inv-2", "Inv-3"]} />)
        } />
        <Card icon={<Droplets size={20} />} title="Zonas Activas" value={`${resumen.zonasActivas} / ${resumen.totalZonas}`} onClick={() =>
          openModal(<ModalContent title="Zonas Activas" items={["Zona 1", "Zona 3", "Zona 4", "Zona 5", "Zona 6", "Zona 7", "Zona 8", "Zona 9", "Zona 10", "Zona 11"]} />)
        } />
        <Card icon={<Droplets size={20} />} title="Riegos Hoy" value={resumen.riegosHoy} onClick={() =>
          openModal(<ModalContent title="Riegos de Hoy" items={["Inv-1 / Zona 1", "Inv-2 / Zona 3", "Inv-2 / Zona 2", "Inv-3 / Zona 4", "Inv-1 / Zona 5"]} />)
        } />
        <Card icon={<AlertCircle size={20} />} title="Alertas Activas" value="0" />
      </div>

      {/* Gráfico de línea */}
      <div className="bg-white shadow rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-xl">Historial de Riegos</h2>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "Dia" | "Semana" | "Mes")}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="Dia">Por día</option>
            <option value="Semana">Por semana</option>
            <option value="Mes">Por mes</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={datosFiltrados}>
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="riego" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie y tabla de historial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="font-semibold text-xl mb-4">Estado de Zonas</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={zonasEstado} dataKey="valor" nameKey="nombre" outerRadius={80} label>
                {zonasEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-xl p-6 overflow-auto">
          <h2 className="font-semibold text-xl mb-4">Historial de Eventos</h2>
          <table className="w-full text-sm">
            <thead className="text-gray-600">
              <tr>
                <th className="py-2">Fecha</th>
                <th>Invernadero</th>
                <th>Zona</th>
                <th>Tipo</th>
                <th>Acción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{item.fecha}</td>
                  <td>{item.invernadero}</td>
                  <td>{item.zona}</td>
                  <td>{item.tipo}</td>
                  <td>{item.accion}</td>
                  <td>{item.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensores (reemplazadas por DHT11) */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="font-semibold text-xl mb-4">Lecturas en Tiempo Real</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
          <SensorCard
            icon={<Sun size={20} className="text-yellow-500" />}
            titulo="Temperatura Ambiental"
            valor={temperatura}
            descripcion="Lectura actual del sensor."
          />
          <SensorCard
            icon={<Droplets size={20} className="text-blue-500" />}
            titulo="Humedad Ambiental"
            valor={humedad}
            descripcion="Lectura actual del sensor."
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <button className="absolute top-4 right-4 text-gray-500" onClick={() => setShowModal(false)}>
              ✕
            </button>
            {modalContent}
          </div>
        </div>
      )}
    </div>
  );
}

// Card
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
    <div onClick={onClick} className="cursor-pointer bg-white shadow rounded-xl p-4 flex flex-col items-center text-center hover:ring-2 hover:ring-blue-300 transition">
      <div className="text-blue-500 mb-1">{icon}</div>
      <h3 className="text-xs text-gray-500">{title}</h3>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

// SensorCard
function SensorCard({ icon, titulo, valor, descripcion }: { icon: React.ReactNode; titulo: string; valor: string; descripcion: string }) {
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

// ModalContent
function ModalContent({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
