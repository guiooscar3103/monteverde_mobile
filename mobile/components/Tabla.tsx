import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function Tabla({ columns = [], rows = [] }: any) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.headerRow}>
          {columns.map((col: any, idx: number) => (
            <View key={idx} style={[styles.cell, styles.headerCell, col.width ? { width: col.width } : { flex: 1, minWidth: 100 }]}>
              <Text style={styles.headerText}>{col.label || col.header}</Text>
            </View>
          ))}
        </View>

        {/* Body */}
        {rows.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>Sin datos</Text>
          </View>
        ) : (
          rows.map((row: any, rIdx: number) => (
            <View key={rIdx} style={styles.row}>
              {columns.map((col: any, cIdx: number) => (
                <View key={cIdx} style={[styles.cell, col.width ? { width: col.width } : { flex: 1, minWidth: 100 }]}>
                  {col.render ? (
                    typeof col.render(row[col.key], row) === 'string' || typeof col.render(row[col.key], row) === 'number' ? (
                      <Text style={styles.cellText}>{col.render(row[col.key], row)}</Text>
                    ) : (
                      <View>{col.render(row[col.key], row)}</View>
                    )
                  ) : (
                    <Text style={styles.cellText}>{row[col.key]}</Text>
                  )}
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  table: {
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerCell: {
    padding: 12,
  },
  cell: {
    padding: 12,
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  cellText: {
    color: '#111827',
  },
  emptyRow: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
  }
});
