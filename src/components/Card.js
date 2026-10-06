import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';

const VARIANTS = {
  category: 'category',
  surface: 'surface',
  profile: 'profile',
  water: 'water',
  soft: 'soft',
  input: 'input',
  result: 'result',
};

/** Superfície compartilhada por cards de conteúdo; variantes mantêm a paleta de cada tela. */
export default function Card({ children, variant = 'surface', onPress, style, pressedStyle, ...props }) {
  const defaultStyle = [styles.base, styles[VARIANTS[variant] || VARIANTS.surface], style];
  if (onPress) {
    return (
      <Pressable {...props} onPress={onPress}
        style={({ pressed }) => [...defaultStyle, pressed && styles.pressed, pressed && pressedStyle]}>
        {children}
      </Pressable>
    );
  }
  return (
    <View {...props} style={defaultStyle}>
      {children}
    </View>
  );
}

const shadow = {
  shadowColor: '#1E2136', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,
  shadowRadius: 8, elevation: 3,
  ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(30, 33, 54, 0.10)' } }),
};

const styles = StyleSheet.create({
  base: { overflow: 'visible' },
  category: { backgroundColor: '#EFECE1', borderRadius: 20, ...shadow },
  surface: { backgroundColor: '#FFFFFF', borderRadius: 16, shadowColor: '#1E2136', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  profile: { backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#1E2136', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  water: { backgroundColor: 'rgba(234, 246, 252, 0.88)', borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 },
  soft: { backgroundColor: '#F4F1EA', borderRadius: 14 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 14 },
  result: { backgroundColor: '#FFFFFF', borderRadius: 20, shadowColor: '#1E2136', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
