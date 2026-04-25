import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import BarraTitulo from '../../components/BarraTitulo';
import Card from '../../components/Card';
import SelectSimple from '../../components/SelectSimple';
import { getUsuariosPorRol, enviarMensaje, getMensajesPorUsuario } from '../../services/api';

export default function MensajesFamilia() {
  const { user } = useAuth();
  const [docentes, setDocentes] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [destinatarioId, setDestinatarioId] = useState('');
  const [cuerpoMensaje, setCuerpoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const inicializar = async () => {
      try {
        if (!user) return;
        const [listaDocentes, mensajes] = await Promise.all([
          getUsuariosPorRol('docente'),
          getMensajesPorUsuario(parseInt(user.id as string))
        ]);

        let docentesDisponibles = listaDocentes || [];
        // Fallback de seguridad por si la base de datos no arroja al docente
        if (docentesDisponibles.length === 0) {
          docentesDisponibles = [{ id: 2, nombre: 'María García López (Genérico)' }];
        }

        setDocentes(docentesDisponibles);
        setHistorial(mensajes || []);

        // Preselección automática del docente asociado (el primero de la lista por ahora)
        if (docentesDisponibles.length > 0 && !destinatarioId) {
          setDestinatarioId(docentesDisponibles[0].id.toString());
        }

      } catch (error) {
        Alert.alert('Error', 'No se pudo conectar con el servicio de mensajería.');
      } finally {
        setLoading(false);
      }
    };
    inicializar();
  }, [user]);

  const handleEnviarMensaje = async () => {
    if (!destinatarioId || !cuerpoMensaje.trim() || !user) {
      Alert.alert('Faltan datos', 'Selecciona a un docente y escribe algo.');
      return;
    }

    setEnviando(true);
    try {
      const msj = {
        emisorId: user.id,
        receptorId: parseInt(destinatarioId),
        asunto: 'Consulta familiar',
        cuerpo: cuerpoMensaje.trim()
      };

      const res = await enviarMensaje(msj);

      // Añadimos el nuevo mensaje visualmente a la vista
      setHistorial(prev => [res, ...prev]);
      setCuerpoMensaje('');
      Alert.alert('Enviado', 'Tu mensaje ha sido entregado al docente.');
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema, intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4c1d95" />
        <Text style={{ marginTop: 12 }}>Conectando...</Text>
      </View>
    );
  }

  const opcionesDocentes = docentes.map(d => ({
    value: d.id.toString(),
    label: `Prof. ${d.nombre}`
  }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BarraTitulo
          titulo="Atención a Padres"
          subtitulo="Envía y recibe notas de los profesores"
        />

        <Card title="Escribir al profesor">
          <View style={{ gap: 12 }}>
            <SelectSimple
              etiqueta="Docente correspondiente:"
              value={destinatarioId}
              onChange={setDestinatarioId}
              options={opcionesDocentes}
            />

            <TextInput
              style={styles.inputBox}
              placeholder="Escribe tu consulta aquí..."
              value={cuerpoMensaje}
              onChangeText={setCuerpoMensaje}
              multiline
            />

            <TouchableOpacity
              style={[styles.btnAction, (!cuerpoMensaje.trim() || !destinatarioId || enviando) && { opacity: 0.6 }]}
              onPress={handleEnviarMensaje}
              disabled={!cuerpoMensaje.trim() || !destinatarioId || enviando}
            >
              <Text style={styles.btnText}>{enviando ? 'Enviando...' : 'ENVIAR CONSULTA'}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Mensajes Recientes</Text>

        {historial.length === 0 ? (
          <Card>
            <Text style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>
              Tu buzón está vacío por el momento.
            </Text>
          </Card>
        ) : (
          historial.map((m: any, index: number) => {
            const soyEmisor = (m.emisorId || m.emisor_id) == user?.id;
            const participante = soyEmisor ? 'Yo' : m.emisor_nombre || `Profesor`;
            return (
              <View key={m.id || index} style={[styles.bubbleWrap, soyEmisor ? styles.wrapDerecha : styles.wrapIzquierda]}>
                <View style={[styles.bubble, soyEmisor ? styles.bubbleMio : styles.bubbleProfesor]}>
                  <Text style={[styles.senderName, { color: soyEmisor ? '#ddd' : '#6d28d9' }]}>{participante}</Text>
                  <Text style={{ color: soyEmisor ? '#fff' : '#1f2937' }}>{m.cuerpo}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 4,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  btnAction: {
    backgroundColor: '#4c1d95',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bubbleWrap: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  wrapDerecha: {
    justifyContent: 'flex-end',
  },
  wrapIzquierda: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMio: {
    backgroundColor: '#6b7280',
    borderBottomRightRadius: 4,
  },
  bubbleProfesor: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  }
});
