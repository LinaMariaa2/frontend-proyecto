import axios from 'axios';

// ✅ CORRECCIÓN CLAVE: La URL base solo debe terminar una vez en '/api'
const API_BASE_URL = 'https://backendhortitech.onrender.com/api'; 

// Eliminamos la variable DEPLOYED_BACKEND_URL para simplificar y evitar el error.
// La URL final que Axios usará es: https://backendhortitech.onrender.com/api

const api = axios.create({
    // Usa la URL corregida
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        // Este interceptor asegura que todas las solicitudes (excepto el login, que no tiene token aún)
        // incluyan el token JWT para la autenticación.
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Este interceptor maneja la expiración de sesión.
        // Si el servidor devuelve 401 y no es un reintento...
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Borra la información de la sesión
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirige al login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;