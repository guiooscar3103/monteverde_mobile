import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import BarraTitulo from '../../components/BarraTitulo';
import Card from '../../components/Card';
import Tabla from '../../components/Tabla';
import { useAuth } from '../../contexts/AuthContext';
// import { getCalificacionesEstudiante } from '../../services/api';

export default function ReporteFamilia() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState<any[]>([]);

  useEffect(() => {
    // Simularemos la carga y la estructura de notas exigidas por el diseño UX
    // para mostrar las calificaciones por materia y por periodo usando la Tabla
    const fetchNotas = async () => {
      setLoading(true);
      try {
        // En un futuro se llamaría: await getCalificacionesEstudiante(user.estudianteId)
        // Por ahora poblamos la interfaz UX requerida:
        setTimeout(() => {
          setCalificaciones([
            { id: 1, asignatura: 'Matemáticas', periodo1: '4.5', periodo2: '4.8', periodo3: '-', periodo4: '-' },
            { id: 2, asignatura: 'Lenguaje', periodo1: '3.8', periodo2: '4.0', periodo3: '-', periodo4: '-' },
            { id: 3, asignatura: 'Ciencias', periodo1: '4.2', periodo2: '4.5', periodo3: '-', periodo4: '-' },
            { id: 4, asignatura: 'Historia', periodo1: '4.0', periodo2: '3.9', periodo3: '-', periodo4: '-' },
            { id: 5, asignatura: 'Inglés', periodo1: '5.0', periodo2: '4.9', periodo3: '-', periodo4: '-' }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        setLoading(false);
      }
    };
    
    fetchNotas();
  }, []);

  const columnasFix = [
    { key: 'asignatura', header: 'Materia', width: 110, render: (val: string) => <Text style={{fontWeight: 'bold'}}>{val}</Text> },
    { key: 'periodo1', header: 'P1', width: 60, render: (val: string) => <Text style={styles.nota}>{val}</Text> },
    { key: 'periodo2', header: 'P2', width: 60, render: (val: string) => <Text style={styles.nota}>{val}</Text> },
    { key: 'periodo3', header: 'P3', width: 60, render: (val: string) => <Text style={styles.notaGris}>{val}</Text> },
    { key: 'periodo4', header: 'P4', width: 60, render: (val: string) => <Text style={styles.notaGris}>{val}</Text> }
  ];

  return (
    <ScrollView style={styles.container}>
      <BarraTitulo 
        titulo="Boletín de Calificaciones" 
        subtitulo="Progreso académico por periodo"
      />

      <Card title="Rendimiento del Estudiante">
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#4c1d95" />
            <Text style={{ marginTop: 10, color: '#666' }}>Consultando registros...</Text>
          </View>
        ) : (
          <View>
            <View style={styles.resumenContainer}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeLabel}>Promedio Actual</Text>
                <Text style={styles.badgeValue}>4.3</Text>
              </View>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeLabel}>Puesto</Text>
                <Text style={styles.badgeValue}>#5</Text>
              </View>
            </View>

            <Text style={styles.tableTitle}>Desglose de Materias</Text>
            <Tabla columns={columnasFix} rows={calificaciones} />
            
            <View style={styles.leyenda}>
              <Text style={{ fontSize: 12, color: '#888' }}>* P1 a P4 corresponden a los cuartos del año escolar.</Text>
              <Text style={{ fontSize: 12, color: '#888' }}>* Las notas se evalúan sobre 5.0.</Text>
            </View>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  loader: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  resumenContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  badgeContainer: {
    flex: 1,
    backgroundColor: '#f5f3ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ede9fe',
    alignItems: 'center'
  },
  badgeLabel: {
    fontSize: 12,
    color: '#6d28d9',
    marginBottom: 4,
    fontWeight: '600'
  },
  badgeValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4c1d95'
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937'
  },
  nota: {
    fontSize: 15,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '500'
  },
  notaGris: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center'
  },
  leyenda: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 4
  }
});
