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
import { Droplets, Leaf, AlertCircle, Sun } from "lucide-react";
import { FaClock } from "react-icons/fa";
import { X } from "lucide-react";

interface Invernadero {
  id_invernadero: number;
  nombre: string;
}

interface Zona {
  id_zona: number;
  nombre: string;
}

// ... (datos de simulación y colores, que pueden quedarse como están) ...
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

const zonasEstado = [
  { nombre: "Activas", valor: 10 },
  { nombre: "Inactivas", valor: 3 },
  { nombre: "Mantenimiento", valor: 2 },
];

const coloresPie = ["#fd8b08ff", "#f0fc4dff", "#fbbf24"];

const historial = [
  { fecha: "20/07", invernadero: "Inv-1", zona: "Zona 1", tipo: "Iluminación", accion: "Encendido", estado: "Completado" },
  { fecha: "20/07", invernadero: "Inv-2", zona: "Zona 2", tipo: "Iluminación", accion: "Apagado", estado: "Pendiente" },
  { fecha: "19/07", invernadero: "Inv-3", zona: "Zona 3", tipo: "Iluminación", accion: "Encendido", estado: "OK" },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function EstadisticasIluminacion() {
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
        // 👉 Cambiamos las llamadas a los endpoints de iluminación por las de riego
        // const invernaderosRes = await fetch(`${BACKEND_URL}/api/iluminacion/invernaderos-activos`);
        const invernaderosRes = await fetch(`${BACKEND_URL}/api/invernadero/datos-activos`);
        if (invernaderosRes.ok) {
          const invernaderos = await invernaderosRes.json();
          setInvernaderosActivosCount(invernaderos.length);
        }
        
        // const zonasRes = await fetch(`${BACKEND_URL}/api/iluminacion/zonas-activas`);
        const zonasRes = await fetch(`${BACKEND_URL}/api/zona/datos-activos`);
        if (zonasRes.ok) {
          const zonas = await zonasRes.json();
          setZonasActivasCount(zonas.length);
        }
      } catch (error) {
        console.error('Error al obtener los conteos de activos:', error);
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
      // 👉 Cambiamos la llamada al endpoint de iluminación por el de invernaderos activos
      // const res = await fetch(`${BACKEND_URL}/api/iluminacion/invernaderos-activos`);
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
      // 👉 Cambiamos la llamada al endpoint de iluminación por el de zonas activas
      // const res = await fetch(`${BACKEND_URL}/api/iluminacion/zonas-activas`);
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

  const datosFiltrados = datosIluminacion[filtro];

  return (
    <div className="pl-20 pr-6 py-6 bg-gray-50 min-h-screen space-y-8 transition-all duration-300">
      <h1 className="text-3xl font-bold mb-4">Estadísticas de Iluminación</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        <Card
          icon={<Leaf size={20} />}
          title="Invernaderos Activos" // 👉 Título corregido
          value={invernaderosActivosCount}
          onClick={fetchInvernaderosActivos} // 👉 Función corregida
        />
        <Card
          icon={<Droplets size={20} />} // 👉 Icono de agua (similar al de riego)
          title="Zonas Activas" // 👉 Título corregido
          value={zonasActivasCount}
          onClick={fetchZonasActivas} // 👉 Función corregida
        />
        <Card
          icon={<Sun size={20} />}
          title="Iluminaciones Hoy"
          value={4}
        />
        <Card icon={<AlertCircle size={20} />} title="Alertas Activas" value="0" />
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-xl ">Historial de Iluminación</h2>
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
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="font-semibold text-xl mb-4 ">Estado de Zonas</h2>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 text-xl"
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
}

// Componentes auxiliares
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