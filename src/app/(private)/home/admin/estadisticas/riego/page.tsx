'use client';

import React, { useState, useEffect } from "react";
import io from "socket.io-client";

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
import { Droplets, Leaf, AlertCircle, X, Thermometer } from "lucide-react";

// INTERFAZ SOLO PARA EL HISTORIAL DE RIEGO
interface HistorialRiego {
  id_historial_riego: number;
  id_pg_riego: number;
  id_zona: number;
  duracion_minutos: number;
  fecha_activacion: string;
}

// 🟢 INTERFAZ PARA EVENTO DE LECTURA DEL DHT11 🟢
interface LecturaDHT11 {
  tipo: "dht11";
  temperatura: number;
  humedad: number;
  unidadTemp: string;
  unidadHum: string;
}

// 🟢🟢🟢 INTERFACES PARA LOS DATOS DE ESTADÍSTICAS 🟢🟢🟢
interface EstadisticasZonas {
  activo: number;
  inactivo: number;
  mantenimiento: number;
}

interface Invernadero {
  id_invernadero: number;
  nombre: string;
}

interface Zona {
  id_zona: number;
  nombre: string;
}

// 🟢🟢🟢 DATOS DE PRUEBA 🟢🟢🟢
const datosRiegoMockData = {
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

const coloresPie = ["#4581dbff", "#10B981", "#22D3EE"];

// 🟢🟢🟢 COMPONENTE CARD 🟢🟢🟢
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
      className={`cursor-pointer bg-white shadow rounded-xl p-4 flex flex-col items-center text-center hover:ring-2 hover:ring-blue-300 transition`}
    >
      <div className="text-blue-500 mb-1">{icon}</div>
      <h3 className="text-xs text-gray-500">{title}</h3>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

// 🟢🟢🟢 COMPONENTE MODALCONTENT 🟢🟢🟢
interface ModalContentProps {
  title: string;
  data: Invernadero[] | Zona[];
  dataType: 'invernaderos' | 'zonas';
  isLoading: boolean;
}

function ModalContent({ title, data, dataType, isLoading }: ModalContentProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-slate-800">{title}</h2>
      {isLoading ? (
        <p className="text-center text-gray-500 py-4">Cargando...</p>
      ) : data.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          {data.map((item, idx) => (
            <li key={idx} className="bg-gray-50 p-2 rounded-lg">{item.nombre}</li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">No hay {dataType} activos.</p>
      )}
    </div>
  );
}

// 🚀 URL DEL BACKEND DESPLEGADO (Ruta corregida)
const BACKEND_URL = 'https://backendhortitech.onrender.com';

const App = () => {
  const [filtro, setFiltro] = useState<"Dia" | "Semana" | "Mes">("Dia");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState<Invernadero[] | Zona[]>([]);
  const [modalDataType, setModalDataType] = useState<'invernaderos' | 'zonas'>('invernaderos');
  const [isLoading, setIsLoading] = useState(false);

  const [invernaderosActivosCount, setInvernaderosActivosCount] = useState(0);
  const [zonasActivasCount, setZonasActivasCount] = useState(0);

  const [zonasEstadisticas, setZonasEstadisticas] = useState<{ nombre: string; valor: number; }[]>([]);

  // 🟢 ESTADO SOLO PARA HISTORIAL DE RIEGO 🟢
  const [historialRiego, setHistorialRiego] = useState<HistorialRiego[]>([]);

  // 🟢 ESTADOS PARA TEMPERATURA Y HUMEDAD TIEMPO REAL 🟢
  const [temperatura, setTemperatura] = useState<string>("-- °C");
  const [humedad, setHumedad] = useState<string>("-- %");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // ✅ URL corregida
        const invernaderosRes = await fetch(`${BACKEND_URL}/api/invernadero/datos-activos`);
        if (invernaderosRes.ok) {
          const invernaderos = await invernaderosRes.json();
          setInvernaderosActivosCount(invernaderos.length);
        }

        // ✅ URL corregida
        const zonasRes = await fetch(`${BACKEND_URL}/api/zona/datos-activos`);
        if (zonasRes.ok) {
          const zonas = await zonasRes.json();
          setZonasActivasCount(zonas.length);
        }
      } catch (error) {
        console.error('Error al obtener los conteos:', error);
      }
    };

    const fetchEstadisticasZonas = async () => {
      try {
        // ✅ URL corregida
        const res = await fetch(`${BACKEND_URL}/api/zona/estadisticas`);
        if (res.ok) {
          const stats: EstadisticasZonas = await res.json();

          const formattedData = [
            { nombre: "Activas", valor: stats.activo },
            { nombre: "Inactivas", valor: stats.inactivo },
            { nombre: "Mantenimiento", valor: stats.mantenimiento },
          ].filter(data => data.valor > 0);

          setZonasEstadisticas(formattedData);
        }
      } catch (error) {
        console.error('Error al obtener estadísticas de zonas:', error);
      }
    };
    
    // 🟢 SOLO HISTORIAL DE RIEGO 🟢
    const fetchHistorialRiego = async () => {
      try {
        // ✅ URL corregida
        const riegoRes = await fetch(`${BACKEND_URL}/api/historialRiego/`);
        const riegoData: HistorialRiego[] = riegoRes.ok ? await riegoRes.json() : [];
        setHistorialRiego(riegoData);
      } catch (error) {
        console.error('Error al obtener historial de riego:', error);
        setHistorialRiego([]);
      }
    };

    fetchCounts();
    fetchEstadisticasZonas();
    fetchHistorialRiego();
  }, []);

  // 🟢 CONEXIÓN SOCKET.IO PARA LECTURAS DHT11 (Ruta corregida) 🟢
  useEffect(() => {
    // ✅ Se usa la URL del backend desplegado para Socket.IO
    const socket = io(BACKEND_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor de sockets");
    });

    socket.on("nuevaLecturaDHT11", (data: LecturaDHT11) => {
      console.log("📡 Evento nuevaLecturaDHT11 recibido:", data);

      if (data.tipo === "dht11") {
        if (typeof data.temperatura === "number") {
          setTemperatura(`${data.temperatura.toFixed(1)} ${data.unidadTemp}`);
        }
        if (typeof data.humedad === "number") {
          setHumedad(`${data.humedad.toFixed(1)} ${data.unidadHum}`);
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
    setModalDataType('invernaderos');
    setShowModal(true);
    try {
      // ✅ URL corregida
      const res = await fetch(`${BACKEND_URL}/api/invernadero/datos-activos`);
      if (!res.ok) {
        throw new Error("Error al obtener los invernaderos activos");
      }
      const data: Invernadero[] = await res.json();
      setModalData(data);
    } catch (error) {
      console.error('Error al obtener invernaderos:', error);
      setModalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZonasActivas = async () => {
    setIsLoading(true);
    setModalTitle("Zonas Activas");
    setModalDataType('zonas');
    setShowModal(true);
    try {
      // ✅ URL corregida
      const res = await fetch(`${BACKEND_URL}/api/zona/datos-activos`);
      if (!res.ok) {
        throw new Error("Error al obtener las zonas activas");
      }
      const data: Zona[] = await res.json();
      setModalData(data);
    } catch (error) {
      console.error('Error al obtener zonas:', error);
      setModalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const datosFiltrados = datosRiegoMockData[filtro];

  return (
    <div className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen space-y-8 transition-all duration-300 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Estadísticas de Riego</h1>

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
        <Card
          icon={<Droplets size={20} />}
          title="Riegos Hoy"
          value={5}
          onClick={() => {}}
        />
        <Card icon={<AlertCircle size={20} />} title="Alertas Activas" value="0" />
      </div>

      {/* RESTO DEL CÓDIGO IGUAL */}
      <div className="bg-white shadow-lg rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-xl text-gray-800">Historial de Riegos</h2>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "Dia" | "Semana" | "Mes")}
            className="border rounded-md px-2 py-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Dia">Por día</option>
            <option value="Semana">Por semana</option>
            <option value="Mes">Por mes</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={datosFiltrados}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="riego" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="font-semibold text-xl mb-4 text-gray-800">Estado de Zonas</h2>
          <ResponsiveContainer width="100%" height={250}>
            {zonasEstadisticas.length > 0 ? (
              <PieChart>
                <Pie data={zonasEstadisticas} dataKey="valor" nameKey="nombre" outerRadius={80} label>
                  {zonasEstadisticas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
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

        {/* CONTENEDOR CON SCROLL PARA LA TABLA */}
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col">
          <h2 className="font-semibold text-xl mb-4 text-gray-800">Historial de Eventos (Riego)</h2>
          {historialRiego.length > 0 ? (
            <div className="overflow-y-auto max-h-80"> 
              <table className="w-full text-sm">
                <thead className="text-gray-600 sticky top-0 bg-white"> 
                  <tr className="bg-gray-100">
                    <th className="py-2 px-2 text-left rounded-tl-lg">Fecha</th>
                    <th className="py-2 px-2 text-left">Zona ID</th>
                    <th className="py-2 px-2 text-left">Duración (min)</th>
                    <th className="py-2 px-2 text-left rounded-tr-lg">Programación ID</th>
                  </tr>
                </thead>
                <tbody>
                  {historialRiego.map((item, i) => (
                    <tr key={i} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-2">
                        {new Date(item.fecha_activacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-2 px-2">{item.id_zona}</td>
                      <td className="py-2 px-2">{item.duracion_minutos}</td>
                      <td className="py-2 px-2">{item.id_pg_riego}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 py-10">
              <p className="text-center">No hay eventos de riego para mostrar.</p>
            </div>
          )}
        </div>
      </div>

      {/* CARDS DHT11 EN TIEMPO REAL AL FINAL  */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="font-semibold text-xl mb-4 text-gray-800">Lecturas en Tiempo Real (DHT11)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Card icon={<Thermometer size={20} className="text-red-500" />} title="Temperatura ambiente" value={temperatura} />
          <Card icon={<Droplets size={20} className="text-blue-500" />} title="Humedad ambiente" value={humedad} />
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
            <ModalContent title={modalTitle} data={modalData} dataType={modalDataType} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;