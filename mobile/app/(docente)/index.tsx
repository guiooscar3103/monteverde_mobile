import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BarraTitulo from '../../components/BarraTitulo';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';

export default function DocenteHome() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSalir = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container}>
      <BarraTitulo 
        titulo="Inicio Docente" 
        subtitulo={`Bienvenido a tu panel docente, ${user?.nombre || ''}`} 
      />
      
      <Card title="Resumen de Cursos">
        <Text style={styles.text}>Tienes 3 cursos asignados este semestre.</Text>
      </Card>

      <Card title="Tareas Pendientes">
        <Text style={styles.text}>Calificar los exámenes de Matemáticas 8° B.</Text>
      </Card>
      
      <Card title="Desconexión segura">
        <Text style={styles.text}>¿Deseas finalizar tu jornada o cambiar de cuenta?</Text>
        <TouchableOpacity 
          style={styles.btnLogout}
          onPress={handleSalir}
        >
          <Text style={styles.btnText}>Cerrar Sesión y Volver al Login</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#4b5563',
  },
  btnLogout: {
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  }
});
