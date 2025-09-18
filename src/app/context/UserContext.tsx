"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/services/api'; // Your Axios instance

// Unified interface for the user, ensuring 'foto_url' can be at the top level
// or nested in 'perfil' for flexibility with the backend.
interface User {
    id_persona: number;
    nombre_usuario: string;
    correo: string;
    rol: "admin" | "operario";
    estado: "activo" | "inactivo" | "mantenimiento";
    isVerified?: boolean; // Made isVerified optional
    foto_url?: string; // Property for the photo URL if it's directly in the main object
    createdAt: string;
    updatedAt: string;
    perfil?: {
        foto_url?: string; // Property for the photo URL if it's nested
    };
}

interface UserContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean;
    refreshUser: () => Promise<void>; 
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsedUser: User = JSON.parse(storedUser);
                setToken(storedToken);
                // Ensure foto_url is correctly extracted when loading from localStorage
                const fotoUrl = parsedUser.perfil?.foto_url || parsedUser.foto_url || "/img/user.jpg";
                setUser({ ...parsedUser, foto_url: fotoUrl });
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (e) {
                console.error("Error parsing stored user data:", e);
                logout(); // Clear if data is corrupted
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, userData: User) => {
        // When logging in, ensure foto_url is at the top level of the userData object
        const fotoUrl = userData.perfil?.foto_url || userData.foto_url || "/img/user.jpg";
        const userToStore = { ...userData, foto_url: fotoUrl };

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userToStore));
        setToken(newToken);
        setUser(userToStore);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        router.push('/login');
    };

    // Function to refresh user data from the backend
    const refreshUser = async () => {
        if (!token) return; // Do not refresh if there is no token

        try {
            // Call the API to get the latest profile of the authenticated user
            const response = await api.get('/perfil');
            const fetchedUser: User = response.data;

            // Robust logic to get foto_url, prioritizing 'perfil.foto_url' if it exists
            const fotoUrl = fetchedUser.perfil?.foto_url || fetchedUser.foto_url || "/img/user.jpg";
            const updatedUser = { ...fetchedUser, foto_url: fotoUrl };

            // Update the context state. This should trigger re-rendering of components that use 'user'.
            setUser(updatedUser); 
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Also update localStorage

        } catch (error: any) {
            console.error("Error refreshing user data:", error.response?.data || error.message);
            // If there is an error refreshing (e.g., expired token, user not found), force logout
            if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
                logout();
            }
        }
    };

    return (
        <UserContext.Provider value={{ user, token, login, logout, isLoading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
