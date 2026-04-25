import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Tabla from '../../components/Tabla';
import SelectSimple from '../../components/SelectSimple';
import BarraTitulo from '../../components/BarraTitulo';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import {
  getCursos,
  getEstudiantesPorCurso,
  getObservadorPorCurso,
  agregarAnotacion
} from '../../services/api';

const TIPOS_OBSERVACION = [
  { value: 'POSITIVA', label: 'Positiva' },
  { value: 'NEGATIVA', label: 'Llamado de Atención' },
  { value: 'NEUTRAL', label: 'Seguimiento' },
  { value: 'DISCIPLINARIA', label: 'Disciplinaria' }
];

export default function ObservadorAlumno() {
  const { user } = useAuth();
  const [cursoId, setCursoId] = useState('');
  const [anotaciones, setAnotaciones] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [form, setForm] = useState({
    estudianteId: '',
    fecha: new Date().toISOString().slice(0, 10),
    tipo: 'POSITIVA',
    detalle: ''
  });

  const [cursosOptions, setCursosOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Cargar cursos
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const cursos = await getCursos();
        const options = cursos.map((c: any) => ({ 
          value: c.id.toString(),
          label: c.nombre 
        }));
        setCursosOptions(options);
        
        if (options.length > 0) {
          setCursoId(options[0].value);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los cursos');
      }
    };
    cargarCursos();
  }, []);

  // Cargar datos del curso
  useEffect(() => {
    if (!cursoId) return;

    const cargarDatos = async () => {
      setLoading(true);
      
      try {
        const estudiantesData = await getEstudiantesPorCurso(parseInt(cursoId));
        setEstudiantes(estudiantesData || []);

        try {
          const anotacionesData = await getObservadorPorCurso(parseInt(cursoId));
          setAnotaciones(anotacionesData || []);
        } catch (obsError) {
          setAnotaciones([]);
        }

        setForm(prev => ({
          ...prev,
          estudianteId: '',
          detalle: ''
        }));

      } catch (error: any) {
        Alert.alert('Error', 'No se pudieron cargar los datos de los estudiantes');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [cursoId]);

  const estOptions = useMemo(() => {
    return estudiantes.map(e => ({ 
      value: e.id.toString(), 
      label: e.nombre 
    }));
  }, [estudiantes]);

  const filas = useMemo(() => {
    return anotaciones.map(a => ({
      id: a.id,
      fecha: a.fecha,
      estudiante: a.estudiante_nombre || `ID: ${a.estudianteId}`,
      tipo: a.tipo,
      detalle: a.detalle
    }));
  }, [anotaciones]);

  const columnas = [
    { key: 'fecha', header: 'Fecha' },
    { key: 'estudiante', header: 'Estudiante' },
    { 
      key: 'tipo', 
      header: 'Tipo',
      render: (valor: string) => {
        const colores: Record<string, string> = {
          'POSITIVA': '#28a745',
          'NEGATIVA': '#dc3545', 
          'NEUTRAL': '#6c757d',
          'DISCIPLINARIA': '#fd7e14'
        };
        return (
          <Text style={{ color: colores[valor] || '#666', fontWeight: 'bold' }}>
            {valor}
          </Text>
        );
      }
    },
    { 
      key: 'detalle', 
      header: 'Detalle',
      render: (valor: string) => (
        <View style={{ maxWidth: 200 }}>
          <Text>{valor}</Text>
        </View>
      )
    }
  ];

  const agregar = async () => {
    if (!form.estudianteId || !form.detalle.trim()) {
      Alert.alert('Incompleto', 'Por favor selecciona un estudiante y escribe un detalle');
      return;
    }

    try {
      setGuardando(true);
      
      const datosAEnviar = {
        estudianteId: parseInt(form.estudianteId),
        docenteId: user?.id,
        fecha: form.fecha,
        tipo: form.tipo,
        detalle: form.detalle.trim()
      };

      await agregarAnotacion(datosAEnviar);
      Alert.alert('Éxito', 'Observación agregada correctamente');
      
      setForm(prev => ({ 
        ...prev, 
        detalle: '',
        estudianteId: '' 
      }));
      
      // Recargar lista
      const nuevasObs = await getObservadorPorCurso(parseInt(cursoId));
      setAnotaciones(nuevasObs || []);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la anotación');
    } finally {
      setGuardando(false);
    }
  };

  const cursoActual = cursosOptions.find(c => c.value === cursoId);
  const botonHabilitado = !guardando && !!form.estudianteId && !!form.detalle.trim();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <BarraTitulo 
        titulo="Observador" 
        subtitulo="Seguimiento de comportamiento"
      />

      <Card title="Seleccionar Curso">
        <SelectSimple
          value={cursoId}
          onChange={setCursoId}
          options={cursosOptions}
          etiqueta="Curso"
        />
      </Card>

      <Card title="Agregar Observación">
        <View style={{ gap: 16 }}>
          <SelectSimple
            value={form.estudianteId}
            onChange={(val: any) => setForm({ ...form, estudianteId: val })}
            options={estOptions}
            etiqueta="Estudiante"
          />

          <SelectSimple
            value={form.tipo}
            onChange={(val: any) => setForm({ ...form, tipo: val })}
            options={TIPOS_OBSERVACION}
            etiqueta="Tipo"
          />

          <View>
            <Text style={styles.label}>Detalle</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Escribe aquí la observación..."
              value={form.detalle}
              onChangeText={(text) => setForm({ ...form, detalle: text })}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.btnAction, !botonHabilitado && { opacity: 0.5, backgroundColor: '#6c757d' }]}
            onPress={agregar}
            disabled={!botonHabilitado}
          >
            <Text style={styles.btnText}>
              {guardando ? 'Guardando...' : 'AGREGAR OBSERVACIÓN'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {loading ? (
        <Card>
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={{ marginTop: 12, color: '#666' }}>Cargando...</Text>
          </View>
        </Card>
      ) : (
        <Card title={`Historial - ${cursoActual?.label || 'Curso'}`}>
          {filas.length > 0 ? (
            <Tabla columns={columnas} rows={filas} />
          ) : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#666' }}>No hay anotaciones para este curso.</Text>
            </View>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    minHeight: 100,
    fontSize: 14,
  },
  btnAction: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
