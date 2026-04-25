import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }: any) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!isAuthenticated) {
    // Expo Router usa redirects internos
    return <Redirect href="/(auth)/login" />;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    if (user?.rol === 'docente') {
      return <Redirect href="/(docente)" />;
    } else if (user?.rol === 'familia') {
      return <Redirect href="/(familia)" />;
    } else {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>Acceso Denegado</Text>
          <Text>No tienes permisos para acceder a esta página.</Text>
        </View>
      );
    }
  }

  return children;
}
