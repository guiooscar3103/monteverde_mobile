import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function CampoNumero({ value, onChange, min = 0, max = 5, paso = 0.1 }: any) {
  return (
    <TextInput
      keyboardType="decimal-pad"
      value={value?.toString() ?? ''}
      onChangeText={(text) => {
        // Reemplazamos coma por punto por si usan el teclado europeo/latino
        let formatted = text.replace(/,/g, '.');
        
        // Expresión para purgar basura, dejando números y a lo sumo 1 punto
        formatted = formatted.replace(/[^0-9.]/g, '');
        const parts = formatted.split('.');
        if (parts.length > 2) {
          formatted = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Pasamos crudo (raw string) al padre para que no rompa el "4."
        onChange(formatted);
      }}
      style={styles.input}
      maxLength={4} // '5.00'
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: 80,
    padding: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    textAlign: 'center',
  }
});
