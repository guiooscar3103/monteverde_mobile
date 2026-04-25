import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HeaderBar({ usuario, rol }: any) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Image 
            source={require('../assets/images/logo-colegio.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.title}>Colegio MonteVerde</Text>
            <Text style={styles.subtitle}>Plataforma Educativa</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.badge} numberOfLines={1}>{usuario}</Text>
          <Text style={styles.roleBadge}>{rol}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff', 
    zIndex: 5, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logo: {
    height: 52,
    width: 52,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 1,
    paddingLeft: 10,
  },
  badge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  roleBadge: {
    fontSize: 11,
    color: '#166534',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
    textTransform: 'capitalize',
  }
});
