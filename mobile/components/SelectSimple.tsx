import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';

export default function SelectSimple({ value, onChange, options = [], etiqueta = 'Seleccione...' }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options.find((o:any) => o.value === value)?.label || etiqueta;

  return (
    <View style={styles.container}>
      {etiqueta && <Text style={styles.label}>{etiqueta}</Text>}
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={value ? styles.selectedText : styles.placeholderText}>{selectedLabel}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <ScrollView>
               <TouchableOpacity 
                  style={styles.option} 
                  onPress={() => { onChange(''); setModalVisible(false); }}
                >
                  <Text style={[styles.optionText, {color: '#9ca3af'}]}>{etiqueta}</Text>
               </TouchableOpacity>
              {options.map((op: any) => (
                <TouchableOpacity 
                  key={op.value} 
                  style={styles.option} 
                  onPress={() => { onChange(op.value); setModalVisible(false); }}
                >
                  <Text style={styles.optionText}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#374151' },
  selector: { padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, backgroundColor: '#fff' },
  selectedText: { fontSize: 16, color: '#111827' },
  placeholderText: { fontSize: 16, color: '#9ca3af' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '50%', paddingVertical: 10 },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  optionText: { fontSize: 16, color: '#111827', textAlign: 'center' }
});
