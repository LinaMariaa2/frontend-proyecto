// src/services/api.ts
import axios from 'axios';

// ¡IMPORTANTE! Asegúrate de que esta URL coincida con la de tu backend
// En desarrollo, probablemente sea 'http://localhost:4000/api'
// En producción, será la URL de tu backend desplegado
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Esto es crucial si tu backend usa cookies para la sesión (aunque con JWT es menos común, no estorba)
});

// Interceptor para añadir el token JWT a cada petición
api.interceptors.request.use(
    (config) => {
        // Recupera el token del localStorage (o de donde lo estés guardando después del login)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas de error globales (ej. token expirado)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Si el error es 401 (Unauthorized) y no es el intento de refresh token (para evitar bucles)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Marca la solicitud original para no reintentar infinitamente

            // Aquí podrías intentar refrescar el token si tu backend lo soporta
            // Por ahora, simplemente redirigimos al login
            localStorage.removeItem('token');
            localStorage.removeItem('user'); // Limpia cualquier otro dato de usuario
            // Redirige al login. Asegúrate de que `router` esté disponible si lo usas aquí,
            // o maneja esto en el componente que hace la llamada.
            // Para este interceptor global, a menudo se usa una notificación y luego la redirección.
            console.error('Sesión expirada o no autorizada. Redirigiendo al login.');
            window.location.href = '/login'; // Redirección fuerte si no hay un sistema de router a mano
        }
        return Promise.reject(error);
    }
);

export default api;