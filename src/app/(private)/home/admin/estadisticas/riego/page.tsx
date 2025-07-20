"use client";

import React, { useState } from "react";
import {
  FaWater, // Icono para Consumo de Agua (mantener por si lo quieres en otra métrica)
  FaClock, // Icono para Tiempo de Riego
  FaChartLine, // Icono para Frecuencia de Riego
  FaCloudRain, // Nuevo icono para Humedad Ambiental (FaLayerGroup era el anterior)
  FaTint, // Icono para Humedad del Suelo
  FaLeaf, // Icono para el título de la página
} from "react-icons/fa";

interface CardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  iconColor?: string;
  valueColor?: string;
}

const Card: React.FC<CardProps> = ({
  icon: Icon,
  title,
  value,
  description,
  iconColor = "text-green-600",
  valueColor = "text-green-700",
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

const datosRiego = {
  "Invernadero 1": [
    {
      icon: FaCloudRain, // Cambiado de FaWater a FaCloudRain
      titulo: "Humedad Ambiental", // Cambiado de Consumo de Agua
      valor: "75%", // Valor de ejemplo para humedad
      description: "Nivel de humedad promedio en el aire del invernadero.",
    },
    {
      icon: FaClock,
      titulo: "Tiempo de Riego",
      valor: "2 Horas/Día",
      description: "Promedio diario de horas de riego.",
    },
    {
      icon: FaChartLine,
      titulo: "Frecuencia de Riego",
      valor: "2 veces/día",
      description: "Frecuencia de riego por día.",
    },
    {
      icon: FaTint, // Usando FaTint para Humedad del Suelo
      titulo: "Humedad del Suelo",
      valor: "60%",
      description: "Promedio semanal de humedad del suelo.",
    },
  ],
  "Invernadero 2": [
    {
      icon: FaCloudRain, // Cambiado de FaWater a FaCloudRain
      titulo: "Humedad Ambiental", // Cambiado de Consumo de Agua
      valor: "68%", // Valor de ejemplo para el segundo invernadero
      description: "Nivel de humedad promedio en el aire del invernadero.",
    },
    {
      icon: FaClock,
      titulo: "Tiempo de Riego",
      valor: "1.5 Horas/Día",
      description: "Promedio diario de horas de riego.",
    },
    {
      icon: FaChartLine,
      titulo: "Frecuencia de Riego",
      valor: "3 veces/día",
      description: "Frecuencia de riego por día.",
    },
    {
      icon: FaTint, // Usando FaTint para Humedad del Suelo
      titulo: "Humedad del Suelo",
      valor: "70%",
      description: "Promedio semanal de humedad del suelo.",
    },
  ],
};

export default function Riego() {
  const [invernaderoSeleccionado, setInvernaderoSeleccionado] = useState<keyof typeof datosRiego>("Invernadero 1");
  const estadisticas = datosRiego[invernaderoSeleccionado];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl p-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-green-700 mb-8 flex items-center justify-center gap-2">
          <FaLeaf className="text-green-600" />
          Informe de Riego y Humedad Ambiental
        </h2>

        {/* Selector de Invernadero */}
        <div className="flex justify-center mb-10">
          <select
            value={invernaderoSeleccionado}
            onChange={(e) => setInvernaderoSeleccionado(e.target.value as keyof typeof datosRiego)}
            className="appearance-none bg-green-100 text-green-900 border border-green-300 rounded-lg px-6 py-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200"
          >
            {Object.keys(datosRiego).map((nombreInvernadero) => (
              <option key={nombreInvernadero} value={nombreInvernadero}>
                {nombreInvernadero}
              </option>
            ))}
          </select>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {estadisticas.map((item, index) => (
            <Card
              key={index}
              icon={item.icon}
              title={item.titulo}
              value={item.valor}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}