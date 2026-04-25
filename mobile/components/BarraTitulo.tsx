import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BarraTitulo({ titulo, subtitulo, derecha }: any) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      </View>
      <View>{derecha}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 0,
    color: '#111827',
  },
  subtitulo: {
    fontSize: 14,
    opacity: 0.8,
    color: '#6b7280',
  },
});
