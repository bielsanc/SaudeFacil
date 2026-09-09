import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Header reutilizável usado por TODAS as telas internas do app
 * (IMC, IMC-Resultado, Água, Alergia, Glicemia, etc).
 * Um único componente que muda de cor/ícone/título conforme a tela.
 */
export default function ImcHeader({
  onGoBack,
  title = 'IMC',
  icon = require('../../assets/imc.png'),
  variant = 'orange', // 'orange' (IMC) | 'light' (Água) | 'dark'
  leftIcon = 'back', // 'back' | 'home'
}) {
  const palette = PALETTES[variant] || PALETTES.orange;

  return (
    <View style={[styles.header, { backgroundColor: palette.bg }]}>
      <Pressable onPress={onGoBack} style={styles.backBtn} hitSlop={10}>
        <Ionicons
          name={leftIcon === 'home' ? 'home' : 'chevron-back'}
          size={24}
          color={palette.icon}
        />
      </Pressable>
      <View style={styles.headerTitleContainer}>
        <View style={[styles.iconBadge, { backgroundColor: palette.badge }]}>
          <Image source={icon} style={styles.headerIcon} />
        </View>
        <Text style={[styles.headerTitle, { color: palette.title }]}>{title}</Text>
      </View>
    </View>
  );
}

const PALETTES = {
  orange: {
    bg: '#FF751F',
    icon: '#FFFFFF',
    badge: '#E2A9F1',
    title: '#FFFFFF',
  },
  light: {
    bg: '#DBEFFA',
    icon: '#12699B',
    badge: 'transparent',
    title: '#0B4A7A',
  },
  dark: {
    bg: '#2D3142',
    icon: '#FFFFFF',
    badge: '#EBE7D9',
    title: '#FFFFFF',
  },
};

const styles = StyleSheet.create({
  header: {
    height: 84,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  headerIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: 'Poppins_700Bold',
  },
});
