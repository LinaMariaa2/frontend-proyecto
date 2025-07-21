Panel Frontend - Sistema de Automatización de Invernaderos
Tecnologías

- [Next.js]
- [React]
- [Tailwind CSS]
- [Axios]¿
- [Lucide React]
- [Heroicons]
- Docker (para despliegue desarrollo)
- Render (para despliegue Produccion)

npm run dev       # Corre en desarrollo
npm run build     # Compila para producción
npm run start     # Inicia la app ya compilada

Construye el contenedor
docker build -t frontend-app .

Ejecuta el contenedor
docker run -p 3000:3000 frontend-app
