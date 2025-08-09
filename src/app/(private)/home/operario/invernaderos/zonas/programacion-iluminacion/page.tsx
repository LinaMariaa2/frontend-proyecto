'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import api from '@/app/services/api';


interface ProgramacionIluminacion {
  id_iluminacion: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  descripcion: string;
  estado: boolean;
}

export default function ProgramacionIluminacion() {
  const searchParams = useSearchParams();
  const zonaId = searchParams.get('id');
  

  const [ estadosDetenidos, setEstadosDetenidos ] = useState<{[id: number]: boolean}>({});
  const [ editandoId, setEditandoId ] = useState<number | null>(null);

  const [programaciones, setProgramaciones] = useState<ProgramacionIluminacion[]>([]);

  const [form, setForm] = useState({
    activacion: '',
    desactivacion: '',
    descripcion: '',
  });
  const [modalOpen, setModalOpen] = useState(false);

  const convertirFechaParaInput = (fechaISO: string) => {
        const fecha = new Date(fechaISO);
        const tzOffset = fecha.getTimezoneOffset() * 60000; // en milisegundos
        const fechaLocal = new Date(fecha.getTime() - tzOffset);
        return fechaLocal.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
  };



  // Obtener programaciones al cargar
  useEffect(() => {
    if (!zonaId) return;
    api
      .get(`/programacionIluminacion/zona/${zonaId}/futuras`)
      .then((res) => {
        setProgramaciones(res.data);

        const nuevosEstados: Record<number, boolean> = {};
        
        (res.data as ProgramacionIluminacion[]).forEach((p) => {
          nuevosEstados[p.id_iluminacion] = !p.estado;
        });
        setEstadosDetenidos(nuevosEstados);

      })
      .catch((err) => {
        console.error('Error al cargar programaciones:', err);
      });
  }, [zonaId]);

  

  // Crear nueva programación
  const agregar = () => {
    if (!form.activacion || !form.desactivacion || !form.descripcion) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    api
      .post('/programacionIluminacion', {
        fecha_inicio: form.activacion,
        fecha_finalizacion: form.desactivacion,
        descripcion: form.descripcion,
        id_zona: parseInt(zonaId as string),
      })
      .then((res) => {
        setProgramaciones((prev) => [...prev, res.data]);
        setForm({ activacion: '', desactivacion: '', descripcion: '' });
        setModalOpen(false);
      })
      .catch((err) => {
        console.error('Error al crear programación:', err);
        alert('Hubo un error al crear la programación.');
      });
  };

  
 // detener programacion
  const detener = (id: number) => {
    const nuevoEstado = !estadosDetenidos[id];
    setEstadosDetenidos((prev) => ({
      ...prev,
      [id]: nuevoEstado,
    }));
    api
    .patch(`/programacionIluminacion/${id}/estado`, {
      activo: nuevoEstado, 
    })
    .then(() => {
      console.log(`Programación #${id} actualizada a ${!nuevoEstado ? 'activa' : 'detenida'}`);
    })
    .catch((err) => {
       console.error('Error al cambiar estado de programación:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      } else {
        console.error('Error sin respuesta del servidor:', err.message);
      }
      alert('No se pudo actualizar el estado en el servidor');
    });
    
  };  


  //actualizar programacion
  const actualizarProgramacion = () => {
  if (!form.activacion || !form.desactivacion || !form.descripcion) {
    alert('Por favor, completa todos los campos.');
    return;
  }
  if (editandoId === null) return;

  api
    .put(`/programacionIluminacion/${editandoId}`, {
      fecha_inicio: form.activacion,
      fecha_finalizacion: form.desactivacion,
      descripcion: form.descripcion,
    })
    .then((res) => {
      // Actualiza localmente sin usar res.data
      setProgramaciones((prev) =>
    prev.map((p) =>
      p.id_iluminacion === editandoId ? res.data : p
    )
    );
    setForm({ activacion: '', desactivacion: '', descripcion: '' });
    setEditandoId(null);
    setModalOpen(false);
    })
    .catch((err) => {
      console.error('Error al actualizar programacion', err);
      alert('Hubo un error al actualizar la programacion.');
    });
};


    
    

    


  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      
      

      <h1 className="text-5xl font-bold text-darkGreen-900 mb-8 text-center md:text-left">
        Programación de Iluminación - Zona {zonaId}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {programaciones.map((p) => (
          <div
            key={p.id_iluminacion}
            className="bg-white rounded-2xl shadow-green p-6 flex flex-col gap-4"
          >
            <p className="text-lg font-semibold text-greenSecondary-900">
              Activación:{' '}
              <span className="font-normal text-darkGreen-700">
                {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleString('es-CO', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }) : ''}
              </span>
            </p>
            <p className="text-lg font-semibold text-greenSecondary-900">
              Desactivación:{' '}
              <span className="font-normal text-darkGreen-700">
                {p.fecha_finalizacion ? new Date(p.fecha_finalizacion).toLocaleString('es-CO', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }) : ''}
              </span>
            </p>
            <p className="text-gray-400">
              Descripción: <span className="text-gray-800">{p.descripcion}</span>
            </p>
            <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-gray-800 border-opacity-10">
              <button
                onClick={() => detener(p.id_iluminacion)}
                  className={`${
                    estadosDetenidos[p.id_iluminacion] ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-white font-bold py-2 px-4 rounded-full transition duration-200`}
                >
                  {estadosDetenidos[p.id_iluminacion] ? 'Reanudar' : 'Detener'}
              </button>
              <button
                onClick={() => {
                  setEditandoId(p.id_iluminacion);
                  setForm({
                    activacion: p.fecha_inicio ? convertirFechaParaInput(p.fecha_inicio) : '',
                    desactivacion: p.fecha_finalizacion ? convertirFechaParaInput(p.fecha_finalizacion) : '',
                    descripcion: p.descripcion,
                  });
                  setModalOpen(true);
                }}
                className="bg-pink-500 hover:bg-pinkSecondary-900 text-white font-bold py-2 px-4 rounded-full transition duration-200"
              >
                Actualizar
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-500 hover:bg-darkGreen-700 text-white font-bold py-3 px-6 rounded-full transition duration-200 ease-in-out shadow-green"
      >
        Crear Programación
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-40 backdrop-blur-md bg-black/10 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-green p-8 w-full max-w-md">
            <h2 className="text-3xl font-bold text-darkGreen-900 mb-6 text-center">
              Agregar Programación
            </h2>
            <h3>Fecha y hora de activación</h3>
            <input
              type="datetime-local"
              value={form.activacion}
              onChange={(e) => setForm({ ...form, activacion: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-800 border-opacity-20 rounded-md"
            />
            <h3>Fecha y hora de finalización</h3>
            <input
              type="datetime-local"
              value={form.desactivacion}
              onChange={(e) => setForm({ ...form, desactivacion: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-800 border-opacity-20 rounded-md"
            />
            <h3>Descripción</h3>
            <input
              type="text"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full p-3 mb-6 border border-gray-800 border-opacity-20 rounded-md"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-full"
              >
                Cancelar
              </button>
              <button
                onClick={editandoId ? actualizarProgramacion : agregar}
                className={ `${editandoId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-darkGreen-700'

                } text-white font-bold py-2 px-5 rounded-full`}
              >
                {editandoId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
