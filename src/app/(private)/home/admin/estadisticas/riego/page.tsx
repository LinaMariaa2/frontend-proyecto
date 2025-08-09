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
import { Droplets, Sun, Leaf, AlertCircle, X } from "lucide-react";
import { FaClock } from "react-icons/fa";

interface Invernadero {
  id_invernadero: number;
  nombre: string;
}

interface Zona {
  id_zona: number;
  nombre: string;
}

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

const zonasEstadoMockData = [
  { nombre: "Activas", valor: 10 },
  { nombre: "Inactivas", valor: 3 },
  { nombre: "Mantenimiento", valor: 2 },
];

const coloresPie = ["#4581dbff", "#10B981", "#22D3EE"];

const historialMockData = [
  { fecha: "20/07", invernadero: "Inv-1", zona: "Zona 1", tipo: "Riego", accion: "Activado", estado: "Completado" },
  { fecha: "20/07", invernadero: "Inv-2", zona: "Zona 2", tipo: "Riego", accion: "Desactivado", estado: "Pendiente" },
  { fecha: "19/07", invernadero: "Inv-1", zona: "Zona 3", tipo: "Riego", accion: "Activado", estado: "OK" },
];

const sensorDataMockData = [
  { icon: <Sun size={20} className="text-yellow-500" />, titulo: "Temperatura Ambiental", valor: "28°C", descripcion: "Lectura actual desde sensores exteriores." },
  { icon: <Droplets size={20} className="text-blue-500" />, titulo: "Humedad del Suelo", valor: "60%", descripcion: "Promedio semanal de humedad del suelo." },
  { icon: <FaClock size={20} className="text-emerald-500" />, titulo: "Tiempo de Riego Diario", valor: "2 h", descripcion: "Tiempo total acumulado hoy." },
];

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
          {data.map((item: any, idx) => (
            <li key={idx} className="bg-gray-50 p-2 rounded-lg">{item.nombre}</li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">No hay {dataType} activos.</p>
      )}
    </div>
  );
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const App = () => {
  const [filtro, setFiltro] = useState<"Dia" | "Semana" | "Mes">("Dia");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState<Invernadero[] | Zona[]>([]);
  const [modalDataType, setModalDataType] = useState<'invernaderos' | 'zonas'>('invernaderos');
  const [isLoading, setIsLoading] = useState(false);
  
  const [invernaderosActivosCount, setInvernaderosActivosCount] = useState(0);
  const [zonasActivasCount, setZonasActivasCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const invernaderosRes = await fetch(`${BACKEND_URL}/api/invernadero/datos-activos`);
        if (invernaderosRes.ok) {
          const invernaderos = await invernaderosRes.json();
          setInvernaderosActivosCount(invernaderos.length);
        }
        
        const zonasRes = await fetch(`${BACKEND_URL}/api/zona/datos-activos`);
        if (zonasRes.ok) {
          const zonas = await zonasRes.json();
          setZonasActivasCount(zonas.length);
        }
      } catch (error) {
        console.error('Error al obtener los conteos:', error);
      }
    };
    fetchCounts();
  }, []);

  const fetchInvernaderosActivos = async () => {
    setIsLoading(true);
    setModalTitle("Invernaderos Activos");
    setModalDataType('invernaderos');
    setShowModal(true);
    try {
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
            <PieChart>
              <Pie data={zonasEstadoMockData} dataKey="valor" nameKey="nombre" outerRadius={80} label>
                {zonasEstadoMockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 overflow-auto">
          <h2 className="font-semibold text-xl mb-4 text-gray-800">Historial de Eventos</h2>
          <table className="w-full text-sm">
            <thead className="text-gray-600">
              <tr className="bg-gray-100">
                <th className="py-2 px-2 text-left rounded-tl-lg">Fecha</th>
                <th className="py-2 px-2 text-left">Invernadero</th>
                <th className="py-2 px-2 text-left">Zona</th>
                <th className="py-2 px-2 text-left">Tipo</th>
                <th className="py-2 px-2 text-left">Acción</th>
                <th className="py-2 px-2 text-left rounded-tr-lg">Estado</th>
              </tr>
            </thead>
            <tbody>
              {historialMockData.map((item, i) => (
                <tr key={i} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-2">{item.fecha}</td>
                  <td className="py-2 px-2">{item.invernadero}</td>
                  <td className="py-2 px-2">{item.zona}</td>
                  <td className="py-2 px-2">{item.tipo}</td>
                  <td className="py-2 px-2">{item.accion}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      item.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="font-semibold text-xl mb-4 text-gray-800">Lecturas en Tiempo Real</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
          {sensorDataMockData.map((sensor, index) => (
            <SensorCard key={index} {...sensor} />
          ))}
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