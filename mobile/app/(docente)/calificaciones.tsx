import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Card from '../../components/Card';
import SelectSimple from '../../components/SelectSimple';
import CampoNumero from '../../components/CampoNumero';
import Tabla from '../../components/Tabla';
import BarraTitulo from '../../components/BarraTitulo';
import { getCursos, getEstudiantesPorCurso, getCalificacionesPor, guardarCalificaciones } from '../../services/api';

export default function RegistroCalificaciones() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [calificaciones, setCalificaciones] = useState<any[]>([]); 
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('Matematicas');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('2025-P3');
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajeTipo, setMensajeTipo] = useState<'success' | 'error' | 'warning'>('success');

  const asignaturas = [
    { value: 'Matematicas', label: 'Matemáticas' },
    { value: 'Lenguaje', label: 'Lenguaje' },
    { value: 'Ciencias', label: 'Ciencias' },
    { value: 'Historia', label: 'Historia' },
    { value: 'Ingles', label: 'Inglés' },
    { value: 'Educacion_Fisica', label: 'Educación Física' }
  ];

  const periodos = [
    { value: '2025-P1', label: '2025 - Primer Período' },
    { value: '2025-P2', label: '2025 - Segundo Período' },
    { value: '2025-P3', label: '2025 - Tercer Período' },
    { value: '2025-P4', label: '2025 - Cuarto Período' }
  ];

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const data = await getCursos();
        setCursos(data);
        if (data.length > 0) {
          setCursoSeleccionado(data[0].id.toString());
        }
      } catch (error) {
        setMensaje('Error al cargar cursos');
        setMensajeTipo('error');
      }
    };
    cargarCursos();
  }, []);

  const cargarEstudiantesYCalif = async () => {
    if (!cursoSeleccionado) return;
    
    setLoading(true);
    setMensaje('');
    
    try {
      const estudiantesData = await getEstudiantesPorCurso(parseInt(cursoSeleccionado));
      const califsData = await getCalificacionesPor({
        cursoId: parseInt(cursoSeleccionado),
        asignatura: asignaturaSeleccionada,
        periodo: periodoSeleccionado
      });

      const califMap: Record<number, any> = {};
      (califsData || []).forEach((c: any) => {
        califMap[c.estudiante_id] = c;
      });

      const estudiantesConCalif = (estudiantesData || []).map((e: any) => ({
        ...e,
        nota: califMap[e.id]?.nota ?? '',
        calificacion_id: califMap[e.id]?.id || null
      }));

      setCalificaciones(estudiantesConCalif);
    } catch (error: any) {
      setCalificaciones([]);
      setMensaje('❌ Error al cargar datos');
      setMensajeTipo('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstudiantesYCalif();
  }, [cursoSeleccionado, asignaturaSeleccionada, periodoSeleccionado]);

  const handleNotaChange = (estudianteId: number, valor: string | number) => {
    setCalificaciones(prev =>
      prev.map(est =>
        est.id === estudianteId ? { ...est, nota: valor } : est
      )
    );
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje('');
    
    try {
      const nuevas = calificaciones
        .filter(est => est.nota !== '' && est.nota >= 0 && est.nota <= 5)
        .map(est => ({
          estudianteId: est.id,
          asignatura: asignaturaSeleccionada,
          periodo: periodoSeleccionado,
          nota: parseFloat(est.nota)
        }));

      if (nuevas.length === 0) {
        setMensaje('⚠️ No hay calificaciones válidas para guardar');
        setMensajeTipo('warning');
        return;
      }

      await guardarCalificaciones(nuevas);
      
      setMensaje('✅ Calificaciones guardadas correctamente');
      setMensajeTipo('success');
      
      setTimeout(() => {
        cargarEstudiantesYCalif();
        setMensaje('');
      }, 1500);
      
    } catch (error: any) {
      setMensaje('❌ Error al guardar las notas');
      setMensajeTipo('error');
    } finally {
      setGuardando(false);
    }
  };

  const columnas = [
    { 
      key: 'nombre', 
      header: 'Estudiante',
      render: (valor: string, fila: any) => (
        <View style={{ width: 140 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{valor}</Text>
          <Text style={{ color: '#666', fontSize: 11 }}>{fila.curso_nombre || 'Curso'}</Text>
        </View>
      )
    },
    {
      key: 'nota',
      header: 'Nota (0-5)',
      render: (valor: any, fila: any) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 100 }}>
          <CampoNumero
            value={valor}
            onChange={(v: number|string) => handleNotaChange(fila.id, v)}
            min={0}
            max={5}
            paso={0.1}
          />
          {valor !== '' && Number(valor) >= 0 && (
            <Text style={{ fontSize: 14 }}>
              {Number(valor) >= 3.0 ? '✅' : '❌'}
            </Text>
          )}
        </View>
      )
    }
  ];

  const cursoActual = cursos.find(c => c.id.toString() === cursoSeleccionado);
  const totalEstudiantes = calificaciones.length;
  const estudiantesConNota = calificaciones.filter(e => e.nota !== '').length;
  const sumaNotas = calificaciones.filter(e => e.nota !== '').reduce((sum, e) => sum + parseFloat(e.nota || 0), 0);
  const promedioGeneral = totalEstudiantes > 0 && estudiantesConNota > 0 ? (sumaNotas / estudiantesConNota).toFixed(2) : '0.00';
  const progreso = totalEstudiantes > 0 ? Math.round((estudiantesConNota / totalEstudiantes) * 100) : 0;

  const msgStyle = mensajeTipo === 'success' ? styles.msgSuccess 
                 : mensajeTipo === 'warning' ? styles.msgWarn 
                 : styles.msgError;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <BarraTitulo 
        titulo="Calificaciones"
        subtitulo="Registrar notas del periodo"
      />

      {mensaje !== '' && (
        <View style={[styles.msgBox, msgStyle]}>
          <Text style={{ textAlign: 'center', fontWeight: '500' }}>{mensaje}</Text>
        </View>
      )}

      <Card title="Filtros">
        <View style={{ gap: 12 }}>
          <SelectSimple
            etiqueta="Curso"
            value={cursoSeleccionado}
            onChange={setCursoSeleccionado}
            options={cursos.map(c => ({ value: c.id.toString(), label: c.nombre }))}
          />
          <SelectSimple
            etiqueta="Asignatura"
            value={asignaturaSeleccionada}
            onChange={setAsignaturaSeleccionada}
            options={asignaturas}
          />
          <SelectSimple
            etiqueta="Período"
            value={periodoSeleccionado}
            onChange={setPeriodoSeleccionado}
            options={periodos}
          />
        </View>
      </Card>

      {calificaciones.length > 0 && !loading && (
        <Card>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={{ color: '#007bff', fontSize: 20, fontWeight: 'bold' }}>{totalEstudiantes}</Text>
              <Text style={{ fontSize: 11, textAlign: 'center' }}>Total Alumnos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={{ color: '#28a745', fontSize: 20, fontWeight: 'bold' }}>{estudiantesConNota}</Text>
              <Text style={{ fontSize: 11, textAlign: 'center' }}>Con Nota</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={{ color: estudiantesConNota > 0 ? '#17a2b8' : '#6c757d', fontSize: 20, fontWeight: 'bold' }}>
                {estudiantesConNota > 0 ? promedioGeneral : '--'}
              </Text>
              <Text style={{ fontSize: 11, textAlign: 'center' }}>Promedio</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={{ color: '#ffc107', fontSize: 20, fontWeight: 'bold' }}>{progreso}%</Text>
              <Text style={{ fontSize: 11, textAlign: 'center' }}>Progreso</Text>
            </View>
          </View>
        </Card>
      )}

      {loading ? (
        <Card>
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#28a745" />
            <Text style={{ marginTop: 12, color: '#666' }}>Cargando lista...</Text>
          </View>
        </Card>
      ) : calificaciones.length > 0 ? (
        <Card title={`Notas - ${cursoActual?.nombre || 'Curso'}`}>
          <Tabla
            columns={columnas}
            rows={calificaciones}
          />

          <TouchableOpacity
            style={[styles.btnGuardar, (guardando || estudiantesConNota === 0) && { opacity: 0.6 }]}
            onPress={handleGuardar}
            disabled={guardando || estudiantesConNota === 0}
          >
            <Text style={styles.btnText}>
              {guardando ? 'Guardando...' : `GUARDAR (${estudiantesConNota})`}
            </Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <Card>
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📚</Text>
            <Text style={{ color: '#666' }}>No hay estudiantes en este curso</Text>
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
  msgWarn: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
  },
  msgError: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
  },
  btnGuardar: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
