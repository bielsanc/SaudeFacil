import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Barra de navegação inferior reutilizável usada por TODAS as telas principais
 * (Home, Perfil, etc). Um único componente que muda o ícone ativo conforme a tela.
 */
export default function BottomNavBar({
  active = 'home', // 'home' | 'profile'
  onPressHome,
  onPressAdd,
  onPressProfile,
}) {
  return (
    <View style={styles.bottomBar}>
      <Pressable
        style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
        onPress={onPressHome}
      >
        {active === 'home' ? (
          <View style={styles.navBtnActive}>
            <Ionicons name="home" size={20} color="#F7F5EC" />
          </View>
        ) : (
          <Ionicons name="home-outline" size={24} color="#262A3B" />
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
        onPress={onPressAdd}
      >
        <View style={styles.addBtn}>
          <Ionicons name="add" size={26} color="#F7F5EC" />
        </View>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
        onPress={onPressProfile}
      >
        {active === 'profile' ? (
          <View style={styles.navBtnActive}>
            <Ionicons name="person" size={20} color="#F7F5EC" />
          </View>
        ) : (
          <Ionicons name="person-outline" size={22} color="#262A3B" />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 65,
    backgroundColor: '#EFECE1',
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1E2136',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 20px rgba(30, 33, 54, 0.15)',
      },
    }),
  },
  navBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#262A3B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF751F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
});
