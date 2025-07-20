"use client";

import React, { useState } from "react";
import { FaLightbulb, FaClock, FaChartLine, FaBolt, FaSun } from "react-icons/fa";

interface CardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  iconColor?: string;
  valueColor?: string;
}

// Reusable Card Component
const Card: React.FC<CardProps> = ({
  icon: Icon,
  title,
  value,
  description,
  iconColor = "text-green-600", // Default green for icons
  valueColor = "text-green-700", // Default green for values
}) => (
  <div className="rounded-xl p-6 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
    <div className="flex items-center mb-4">
      <Icon className={`text-4xl mr-4 ${iconColor}`} />
      <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
    </div>
    <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    <p className="mt-2 text-gray-500">{description}</p>
  </div>
);

// Data for illumination statistics by greenhouse with green color sequence
const datosIluminacion = {
  "Invernadero 1": [
    {
      icon: FaBolt,
      titulo: 'Consumo en Vatios "W" a la Semana',
      valor: "180 vatios",
      description: "Promedio semanal de vatios utilizados para la iluminación.",
      iconColor: "text-green-500", // Green shades
      valueColor: "text-green-700",
    },
    {
      icon: FaClock,
      titulo: "Tiempo de Iluminación",
      valor: "18 Horas/Día",
      description: "Promedio diario de iluminación.",
      iconColor: "text-emerald-500", // Different green shade
      valueColor: "text-emerald-700",
    },
    {
      icon: FaChartLine,
      titulo: "Frecuencia de Encendido",
      valor: "2 veces/día",
      description: "Frecuencia de iluminación por día.",
      iconColor: "text-lime-500", // Another green shade
      valueColor: "text-lime-700",
    },
    {
      icon: FaLightbulb,
      titulo: "Lúmenes Promedio",
      valor: "25.000 lm",
      description: "Nivel de luz promedio generado en el invernadero.",
      iconColor: "text-teal-500", // Yet another green shade
      valueColor: "text-teal-700",
    },
  ],
  "Invernadero 2": [
    {
      icon: FaBolt,
      titulo: 'Consumo en Vatios "W" a la Semana',
      valor: "200 vatios",
      description: "Promedio semanal de vatios utilizados para la iluminación.",
      iconColor: "text-green-600",
      valueColor: "text-green-800",
    },
    {
      icon: FaClock,
      titulo: "Tiempo de Iluminación",
      valor: "16 Horas/Día",
      description: "Promedio diario de iluminación.",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-800",
    },
    {
      icon: FaChartLine,
      titulo: "Frecuencia de Encendido",
      valor: "3 veces/día",
      description: "Frecuencia de iluminación por día.",
      iconColor: "text-lime-600",
      valueColor: "text-lime-800",
    },
    {
      icon: FaLightbulb,
      titulo: "Lúmenes Promedio",
      valor: "30.000 lm",
      description: "Nivel de luz promedio generado en el invernadero.",
      iconColor: "text-teal-600",
      valueColor: "text-teal-800",
    },
  ],
};

// Iluminacion Page Component
export default function Iluminacion() {
  const [invernaderoSeleccionado, setInvernaderoSeleccionado] = useState<keyof typeof datosIluminacion>("Invernadero 1");
  const estadisticas = datosIluminacion[invernaderoSeleccionado];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl p-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-green-700 mb-8 flex items-center justify-center gap-2">
          <FaSun className="text-green-500" /> {/* Sun icon now green */}
          Informe de Iluminación
        </h2>

        {/* Stylized Greenhouse Selector */}
        <div className="flex justify-center mb-10">
          <select
            value={invernaderoSeleccionado}
            onChange={(e) => setInvernaderoSeleccionado(e.target.value as keyof typeof datosIluminacion)}
            className="appearance-none bg-green-100 text-green-900 border border-green-300 rounded-lg px-6 py-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200"
          >
            {Object.keys(datosIluminacion).map((nombreInvernadero) => (
              <option key={nombreInvernadero} value={nombreInvernadero}>
                {nombreInvernadero}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {estadisticas.map((item, index) => (
            <Card
              key={index}
              icon={item.icon}
              title={item.titulo}
              value={item.valor}
              description={item.description}
              iconColor={item.iconColor}
              valueColor={item.valueColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}