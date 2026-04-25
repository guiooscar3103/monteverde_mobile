import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Tabla from '../../components/Tabla';
import SelectSimple from '../../components/SelectSimple';
import BarraTitulo from '../../components/BarraTitulo';
import Card from '../../components/Card';
import {
  getCursos,
  getEstudiantesPorCurso,
  getAsistenciaPorFecha,
  guardarAsistencia,
  getEstadisticasAsistencia
} from '../../services/api';

const ESTADOS = [
  { value: 'PRESENTE', label: 'Presente', color: '#28a745', icon: '✅' },
  { value: 'AUSENTE', label: 'Ausente', color: '#dc3545', icon: '❌' },
  { value: 'TARDE', label: 'Tarde', color: '#ffc107', icon: '⏰' },
  { value: 'JUSTIFICADO', label: 'Justificado', color: '#17a2b8', icon: '📝' }
];

export default function Asistencia() {
  const [cursoId, setCursoId] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [cursosOptions, setCursosOptions] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Cargar cursos al montar
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const cursos = await getCursos();
        const options = cursos.map((c: any) => ({ value: c.id.toString(), label: c.nombre }));
        setCursosOptions(options);
        if (options.length > 0) setCursoId(options[0].value);
      } catch (error) {
        setMensaje('❌ Error al cargar cursos');
      }
    };
    cargarCursos();
  }, []);

  // Cargar estudiantes y asistencia cuando cambien cursoId o fecha
  useEffect(() => {
    if (!cursoId || !fecha) {
      setEstudiantes([]);
      setMarcas([]);
      setEstadisticas(null);
      return;
    }

    const cargarAsistencia = async () => {
      setLoading(true);
      setMensaje('');
      try {
        const est = await getEstudiantesPorCurso(parseInt(cursoId));
        const lista = await getAsistenciaPorFecha({ cursoId: parseInt(cursoId), fecha });
        
        // Estadística falla silenciosa si vacio
        getEstadisticasAsistencia({ cursoId: parseInt(cursoId), fecha })
          .then(setEstadisticas)
          .catch(() => setEstadisticas(null));

        setEstudiantes(est);

        const mapa = new Map(lista.map((a: any) => [a.estudianteId, a.estado]));
        const marcasIniciales = est.map((e: any) => ({
          estudianteId: e.id,
          fecha,
          estado: mapa.get(e.id) || 'PRESENTE'
        }));
        setMarcas(marcasIniciales);
      } catch (error: any) {
        setMensaje('❌ Error al cargar los datos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarAsistencia();
  }, [cursoId, fecha]);

  const columnas = useMemo(() => [
    { 
      key: 'nombre', 
      header: 'Estudiante',
      render: (valor: string, fila: any) => (
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{valor}</Text>
          <Text style={{ color: '#666', fontSize: 11 }}>{fila.curso_nombre}</Text>
        </View>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (valor: any, fila: any) => {
        if (!fila || !fila.id) return null;

        const idx = marcas.findIndex(m => m.estudianteId === fila.id);
        if (idx === -1) return null;

        const estadoActual = marcas[idx]?.estado;

        // En móvil, reemplazamos el enorme select por botoneras rápidas rectangulares.
        return (
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            {ESTADOS.map(es => {
              const isActive = es.value === estadoActual;
              return (
                <TouchableOpacity
                  key={es.value}
                  disabled={loading || guardando}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: isActive ? es.color : '#e0e0e0',
                    backgroundColor: isActive ? es.color + '20' : '#fff',
                  }}
                  onPress={() => {
                    const nuevasMarcas = [...marcas];
                    nuevasMarcas[idx] = { ...nuevasMarcas[idx], estado: es.value };
                    setMarcas(nuevasMarcas);
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{es.icon}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }
    }
  ], [marcas, loading, guardando]);

  const filas = useMemo(() => {
    return estudiantes.map(e => {
      const marca = marcas.find(m => m.estudianteId === e.id);
      return {
        id: e.id,
        nombre: e.nombre,
        curso_nombre: e.curso_nombre,
        estado: marca?.estado || 'PRESENTE'
      };
    });
  }, [estudiantes, marcas]);

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje('');
    try {
      await guardarAsistencia(marcas);
      setMensaje('✅ Asistencia guardada correctamente');
      
      const stats = await getEstadisticasAsistencia({ cursoId: parseInt(cursoId), fecha });
      setEstadisticas(stats);
      
      setTimeout(() => setMensaje(''), 3000);
    } catch (error: any) {
      setMensaje('❌ Error al guardar asistencia: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const cursoActual = cursosOptions.find(c => c.value === cursoId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <BarraTitulo 
        titulo="Asistencia" 
        subtitulo="Registrar presencias diarias"
      />

      {mensaje !== '' && (
        <View style={[styles.msgBox, mensaje.includes('✅') ? styles.msgSuccess : styles.msgError]}>
          <Text style={{ color: mensaje.includes('✅') ? '#155724' : '#721c24', textAlign: 'center' }}>{mensaje}</Text>
        </View>
      )}

      <Card title="Filtros">
        <View style={{ gap: 12 }}>
          <SelectSimple
            value={cursoId}
            onChange={setCursoId}
            options={cursosOptions}
            etiqueta="Curso"
          />
          
          <View>
            <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#444' }}>Fecha (YYYY-MM-DD)</Text>
            <TextInput
              value={fecha}
              onChangeText={setFecha}
              editable={!loading}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            onPress={handleGuardar}
            disabled={loading || guardando || marcas.length === 0}
            style={[styles.btnGuardar, (loading || guardando || marcas.length === 0) && { opacity: 0.6 }]}
          >
            <Text style={styles.btnText}>{guardando ? '💾 Guardando...' : `💾 Guardar (${marcas.length})`}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {estadisticas && (
        <Card title="Resumen del Día">
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
               <Text style={{ color: '#28a745', fontSize: 24, fontWeight: 'bold' }}>{estadisticas.por_estado?.PRESENTE || 0}</Text>
               <Text style={{ fontSize: 11 }}>✅ Pres</Text>
            </View>
            <View style={styles.statBox}>
               <Text style={{ color: '#dc3545', fontSize: 24, fontWeight: 'bold' }}>{estadisticas.por_estado?.AUSENTE || 0}</Text>
               <Text style={{ fontSize: 11 }}>❌ Aus</Text>
            </View>
            <View style={styles.statBox}>
               <Text style={{ color: '#ffc107', fontSize: 24, fontWeight: 'bold' }}>{estadisticas.por_estado?.TARDE || 0}</Text>
               <Text style={{ fontSize: 11 }}>⏰ Tard</Text>
            </View>
            <View style={styles.statBox}>
               <Text style={{ color: '#17a2b8', fontSize: 24, fontWeight: 'bold' }}>{estadisticas.por_estado?.JUSTIFICADO || 0}</Text>
               <Text style={{ fontSize: 11 }}>📝 Just</Text>
            </View>
          </View>
          <View style={{ marginTop: 12, backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 13 }}>
              Total: {estadisticas.registrados} / {estadisticas.total_estudiantes} estudiantes
            </Text>
            {estadisticas.pendientes > 0 && <Text style={{ color: '#dc3545', fontSize: 12 }}>({estadisticas.pendientes} pendientes)</Text>}
          </View>
        </Card>
      )}

      {loading ? (
        <Card>
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#28a745" />
            <Text style={{ marginTop: 12, color: '#666' }}>Cargando estudiantes...</Text>
          </View>
        </Card>
      ) : estudiantes.length > 0 ? (
        <Card title={`Lista - ${cursoActual?.label || 'Curso'}`}>
          <Tabla columns={columnas} rows={filas} />
        </Card>
      ) : (
        <Card>
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📅</Text>
            <Text style={{ color: '#666', fontWeight: 'bold', textAlign: 'center' }}>No hay estudiantes en este curso</Text>
          </View>
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
  msgBox: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
  },
  msgSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  msgError: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  btnGuardar: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  }
});
