import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleVolverInicio = () => {
    router.replace('/');
  };

  const handleCerrarSesion = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👑</Text>
        </View>

        <Text style={styles.title}>Dashboard Admin</Text>
        <Text style={styles.welcome}>¡Bienvenido, {user?.nombre || 'Usuario'}!</Text>
        <Text style={styles.subtitle}>Panel administrativo en construcción</Text>

        {/* Info usuario */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>👨‍💼 Información del Usuario</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{user?.nombre || 'No disponible'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email || 'No disponible'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Rol:</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user?.rol?.toUpperCase() || 'ADMIN'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{user?.id || 'No disponible'}</Text>
          </View>
        </View>

        {/* Próximas funcionalidades */}
        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>🚧 Próximas Funcionalidades</Text>
          <Text style={styles.featureItem}>• Gestión de usuarios del sistema</Text>
          <Text style={styles.featureItem}>• Reportes generales de la institución</Text>
          <Text style={styles.featureItem}>• Configuración del sistema</Text>
          <Text style={styles.featureItem}>• Estadísticas globales</Text>
          <Text style={styles.featureItem}>• Respaldos de la base de datos</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleVolverInicio}>
            <Text style={styles.btnPrimaryText}>🏠 Volver al Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDanger} onPress={handleCerrarSesion}>
            <Text style={styles.btnDangerText}>🚪 Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>MonteVerde - Sistema de Gestión Educativa v1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea', // Reemplazo de linear gradient simple
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#764ba2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcome: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  infoBoxTitle: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: 70,
  },
  value: {
    flex: 1,
  },
  badge: {
    backgroundColor: '#667eea',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  featureTitle: {
    color: '#856404',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    color: '#856404',
    marginBottom: 6,
    paddingLeft: 8,
  },
  btnGroup: {
    width: '100%',
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  btnDanger: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDangerText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  }
});
