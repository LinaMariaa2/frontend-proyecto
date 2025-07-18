// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Necesitarás instalar 'jose' para verificar JWTs

// Instala jose: npm install jose

// Define tus rutas protegidas
const protectedRoutes = ['/home/admin', '/home/operario'];
const adminRoutes = ['/home/admin', '/home/admin/configuraciones', '/home/admin/configuraciones/registro', '/home/admin/configuraciones/usuarios', '/home/admin/configuraciones/perfil'];

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1];
    const { pathname } = request.nextUrl;

    // Si la ruta no es protegida, continúa
    if (!protectedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Si hay un token, intenta verificarlo
    if (token) {
        try {
            // IMPORTANT: Reemplaza 'YOUR_SECRET_KEY' con tu clave secreta de JWT del backend
            const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'supersecretkey'); // Usa una variable de entorno para la clave secreta
            const { payload } = await jwtVerify(token, secret);

            // Asume que el payload contiene el rol del usuario (ej. { id_persona: 1, rol: 'admin', ... })
            const userRole = payload.rol as string;

            // Si la ruta es de admin y el usuario no es admin, redirigir
            if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== 'admin') {
                // Puedes redirigir a una página de "Acceso Denegado" o al dashboard del operario
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            // Permitir el acceso si el token es válido y el rol es apropiado
            return NextResponse.next();
        } catch (error) {
            console.error('JWT Verification Error:', error);
            // Token inválido o expirado, redirigir al login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token'); // Limpiar token inválido
            return response;
        }
    }

    // Si no hay token y la ruta es protegida, redirigir al login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token'); // Asegurarse de que no haya un token residual
    return response;
}

// Especifica para qué rutas se ejecuta el middleware
export const config = {
    matcher: ['/home/:path*', '/login', '/register'], // Aplica el middleware a todas las rutas bajo /home y a /login, /register
};