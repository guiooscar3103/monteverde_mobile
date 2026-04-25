import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import HeaderBar from '../../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';

export default function FamiliaLayout() {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute requiredRole="familia">
      <Tabs 
        screenOptions={{
          // Header universal reusado tal como en la web
          header: () => (
            <HeaderBar 
              usuario={user?.nombre || 'Familia'} 
              rol={user?.rol || 'Familia'} 
            />
          ),
          // Estilo morado rescatado de tu diseño web (#4c1d95)
          tabBarActiveTintColor: '#4c1d95',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            minHeight: 60,
            paddingTop: 8,
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#eeeeee',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="reporte"
          options={{
            title: 'Reporte',
            tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="mensajes"
          options={{
            title: 'Mensajes',
            tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
