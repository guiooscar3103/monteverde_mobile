import { Slot } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000,   // 10 minutos
      refetchOnWindowFocus: false, // In React Native is refetchOnAppStateChange equivalent 
    },
  },
});

// Componente para proteger y redirigir rutas basado en autenticación
function RootNavigation() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = ['(docente)', '(admin)', '(familia)'].includes(segments[0] || '');

    if (!isAuthenticated && inProtectedGroup) {
      // Redirigir al login si no está autenticado y trata de acceder a algo protegido
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      // Redirigir según el rol si estamos en raíz o login
      if (!segments[0] || inAuthGroup) {
        if (user?.rol === 'admin') router.replace('/(admin)');
        else if (user?.rol === 'docente') router.replace('/(docente)');
        else if (user?.rol === 'familia') router.replace('/(familia)');
      }
    }
  }, [isAuthenticated, isLoading, segments, user]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </QueryClientProvider>
  );
}
