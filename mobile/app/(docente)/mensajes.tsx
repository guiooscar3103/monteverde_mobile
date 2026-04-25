import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import BarraTitulo from '../../components/BarraTitulo';
import Card from '../../components/Card';
import SelectSimple from '../../components/SelectSimple';
import { getUsuariosPorRol, enviarMensaje } from '../../services/api';

export default function MensajesDocente() {
  const { user } = useAuth();
  const [familias, setFamilias] = useState<any[]>([]);
  const [destinatarioId, setDestinatarioId] = useState('');
  const [cuerpoMensaje, setCuerpoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Cargar lista de destinatarios posibles (familias)
  useEffect(() => {
    const cargarContactos = async () => {
      try {
        const usuariosFamilia = await getUsuariosPorRol('familia');
        setFamilias(usuariosFamilia);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los contactos');
      } finally {
        setLoading(false);
      }
    };
    cargarContactos();
  }, []);

  const handleEnviarMensaje = async () => {
    if (!destinatarioId || !cuerpoMensaje.trim() || !user) {
      Alert.alert('Incompleto', 'Por favor selecciona un destinatario y escribe un mensaje.');
      return;
    }
    
    setEnviando(true);
    try {
      const mensajeData = {
        emisorId: user.id,
        receptorId: parseInt(destinatarioId),
        asunto: 'Mensaje Escolar', // Asunto automático para simplificar
        cuerpo: cuerpoMensaje.trim()
      };
      
      await enviarMensaje(mensajeData);
      
      Alert.alert('¡Éxito!', 'El mensaje ha sido enviado correctamente.');
      
      // Limpiar el formulario luego de enviar
      setDestinatarioId('');
      setCuerpoMensaje('');
      
    } catch (error: any) {
      Alert.alert('Error', 'Hubo un problema al enviar el mensaje.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={{ marginTop: 16 }}>Cargando directorio...</Text>
      </View>
    );
  }

  // Preparamos las opciones para el SelectSimple
  const opcionesContactos = familias.map(f => ({
    value: f.id.toString(),
    label: `${f.nombre} (${f.email})`
  }));

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BarraTitulo 
          titulo="Enviar Mensaje" 
          subtitulo="Comunicación directa con familias"
        />

        <Card title="Redactar nuevo mensaje">
          <View style={{ gap: 16 }}>
            
            {/* 1. Selector de Destinatario */}
            <SelectSimple
              etiqueta="Destinatario"
              value={destinatarioId}
              onChange={setDestinatarioId}
              options={opcionesContactos}
            />

            {/* 2. Área de texto del mensaje */}
            <View>
              <Text style={styles.label}>Mensaje</Text>
              <TextInput
                style={styles.inputTextArea}
                placeholder="Escribe tu mensaje aquí..."
                value={cuerpoMensaje}
                onChangeText={setCuerpoMensaje}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Botón de Enviar */}
            <TouchableOpacity 
              style={[styles.btnEnviar, (!cuerpoMensaje.trim() || !destinatarioId || enviando) && { opacity: 0.5 }]} 
              onPress={handleEnviarMensaje}
              disabled={!cuerpoMensaje.trim() || !destinatarioId || enviando}
            >
              {enviando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnEnviarText}>ENVIAR MENSAJE</Text>
              )}
            </TouchableOpacity>

          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3f4f6' 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '500', 
    marginBottom: 8, 
    color: '#374151' 
  },
  inputTextArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 150,
    fontSize: 16,
  },
  btnEnviar: {
    backgroundColor: '#166534',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  btnEnviarText: {
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  }
});
