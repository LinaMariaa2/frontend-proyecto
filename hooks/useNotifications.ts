// src/hooks/useNotifications.ts
'use client';
import { useEffect, useState } from 'react';
import { io as clientIo, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
let socket: Socket | null = null;

export function useNotifications() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) {
      socket = clientIo(SOCKET_URL, { transports: ['websocket', 'polling'] });
    }

    socket.on('connect', () => {
      console.log('Socket conectado:', socket?.id);
    });

    socket.on('nueva-visita', (data) => {
      setNotificaciones((prev) => [data, ...prev]);
    });

    socket.on('visita-estado-cambiado', (data) => {
      setNotificaciones((prev) => [{ tipo: 'estado-cambio', ...data }, ...prev]);
    });

    return () => {
      if (!socket) return;
      socket.off('nueva-visita');
      socket.off('visita-estado-cambiado');
    };
  }, []);

  const markAllRead = () => setNotificaciones([]);

  return { notificaciones, markAllRead };
}
