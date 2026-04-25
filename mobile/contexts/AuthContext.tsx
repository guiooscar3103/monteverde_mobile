/**
 * Propósito: Este archivo es el núcleo de seguridad y gestión de sesiones del frontend.
 * Relación: Provee el contexto global (`useAuth`) para que cualquier componente sepa 
 *           quién es el usuario activo, su rol (docente o familia) y restrinja el acceso.
 *           Se basa en `expo-secure-store` para mantener los JWT Tokens encriptados.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';

/**
 * Interfaz que define la estructura del perfil del usuario logueado en la memoria local.
 */
type User = {
  id: string;
  email: string;
  rol: string;
  nombre: string;
};

/**
 * Interfaz puente que expone las propiedades reactivas a toda la App.
 */
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook personalizado para acceder de forma segura al contexto de autenticación.
 * 
 * ¿Para qué se usa?: Se importa en cualquier pantalla (`index.tsx`, `mensajes.tsx`)
 * para extraer los datos del usuario actual (ej. `const { user } = useAuth();`).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

/**
 * Componente Proveedor de Contexto.
 * 
 * Qué hace: Envuelve a la aplicación entera (en `_layout.tsx`) para hidratar 
 * la sesión. Al arrancar, verifica localmente si existe un Token seguro (hidratación on-mount).
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const userData = await SecureStore.getItemAsync('user');
        
        if (token && userData) {
          const response = await fetch(`${API_URL}/health`);
          if (response.ok) {
             setUser(JSON.parse(userData));
          } else {
             throw new Error("Backend inalcanzable");
          }
        }
      } catch (err) {
        console.error('Token inválido o error de red:', err);
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async ({ email, password }: any) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
        return data.user;
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
