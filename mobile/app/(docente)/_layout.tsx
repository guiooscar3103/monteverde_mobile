import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import HeaderBar from '../../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';

export default function DocenteLayout() {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute requiredRole="docente">
      <Tabs 
        screenOptions={{
          // Usamos tu componente HeaderBar adaptado
          header: () => (
            <HeaderBar 
              usuario={user?.nombre || 'Usuario'} 
              rol={user?.rol || 'Docente'} 
            />
          ),
          tabBarActiveTintColor: '#166534',
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
          name="calificaciones"
          options={{
            title: 'Académica',
            tabBarIcon: ({ color }) => <Ionicons name="school" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="asistencia"
          options={{
            title: 'Asistencia',
            tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="observador"
          options={{
            title: 'Observador',
            tabBarIcon: ({ color }) => <Ionicons name="eye" size={24} color={color} />,
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
