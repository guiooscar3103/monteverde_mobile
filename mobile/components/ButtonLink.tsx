import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ButtonLink({ to, children, variant = 'default', ...props }: any) {
  const router = useRouter();
  
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity 
      onPress={() => router.push(to)} 
      style={[styles.base, isPrimary ? styles.primary : styles.default]} 
      {...props}
    >
      <Text style={[styles.textBase, isPrimary ? styles.textPrimary : styles.textDefault]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  primary: {
    backgroundColor: '#22c55e', // brand-2 (green)
    borderWidth: 0,
  },
  textBase: {
    fontWeight: '600',
    fontSize: 16,
  },
  textDefault: {
    color: '#111827',
  },
  textPrimary: {
    color: '#fff',
  }
});
