import React, { useState } from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VARIANTS = {
  primary: 'primary',
  dark: 'dark',
  danger: 'danger',
  quickAdd: 'quickAdd',
  nav: 'nav',
  headerHome: 'headerHome',
  headerProfile: 'headerProfile',
  headerBack: 'headerBack',
  listOption: 'listOption',
  select: 'select',
  camera: 'camera',
  wheel: 'wheel',
};

/** Botão único com variantes para ações, navegação e adição rápida. */
export default function Button({
  children, title, onPress, variant = 'primary', icon, iconSource, iconSize = 20,
  color, textStyle, style, pressedStyle, contentStyle, imageStyle, iconStyle, iconContainerStyle, ...props
}) {
  const [hovered, setHovered] = useState(false);
  const defaultColor = color || (variant === 'quickAdd' ? '#38B6FF' : variant === 'danger' ? '#D14343' : '#FFFFFF');
  return (
    <Pressable {...props} onPress={onPress} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [styles.base, styles[VARIANTS[variant] || VARIANTS.primary], style,
        hovered && variant === 'headerBack' && styles.navHovered,
        pressed && styles.pressed, pressed && pressedStyle]}>
      <View style={[styles.content, contentStyle]}>
        {!!iconSource && <Image source={iconSource} style={[styles.imageIcon, { tintColor: color }, imageStyle]} resizeMode="contain" />}
        {!!icon && <View style={[iconContainerStyle, hovered && variant === 'nav' && !iconContainerStyle && styles.navIconHovered]}>
          <Ionicons name={icon} size={iconSize} color={hovered && variant === 'nav' && !iconContainerStyle ? '#F7F5EC' : defaultColor} style={iconStyle} />
        </View>}
        {!!title && <Text style={[styles.label, { color: defaultColor }, textStyle]}>{title}</Text>}
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#FF751F', borderRadius: 30, paddingVertical: 16 },
  dark: { backgroundColor: '#282B49', borderRadius: 30, paddingVertical: 15 },
  danger: { backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 12 },
  quickAdd: { backgroundColor: '#DCEFF9', borderRadius: 18, paddingVertical: 14 },
  nav: { backgroundColor: 'transparent', borderRadius: 22, minWidth: 36, minHeight: 36, padding: 6 },
  headerHome: { backgroundColor: 'transparent', padding: 4 },
  headerProfile: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(40, 43, 73, 0.35)' },
  headerBack: { backgroundColor: 'transparent', padding: 6 },
  listOption: { backgroundColor: '#F4F1EA', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14 },
  select: { backgroundColor: 'transparent', padding: 0 },
  camera: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#282B49', borderWidth: 3, borderColor: '#F4F1EA' },
  wheel: { backgroundColor: 'transparent', minWidth: 45, minHeight: 36 },
  navHovered: { backgroundColor: '#238BC4' },
  navIconHovered: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#262A3B', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  icon: { marginRight: 8 },
  imageIcon: { width: 34, height: 34 },
  label: { fontFamily: 'Poppins_700Bold', fontSize: 15 },
});
