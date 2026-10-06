import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Button from './Button';

export default function BottomNavBar({ active = 'home', onPressHome, onPressAdd, onPressProfile }) {
  return (
    <View style={styles.bottomBar}>
      <Button variant="nav" onPress={onPressHome} icon={active === 'home' ? 'home' : 'home-outline'}
        iconSize={active === 'home' ? 20 : 24} color={active === 'home' ? '#F7F5EC' : '#262A3B'}
        iconContainerStyle={active === 'home' ? styles.navBtnActive : null} style={styles.navBtn} />
      <Button variant="nav" onPress={onPressAdd} icon="add" iconSize={26} color="#F7F5EC"
        iconContainerStyle={styles.addBtn} style={styles.navBtn} />
      <Button variant="nav" onPress={onPressProfile} icon={active === 'profile' ? 'person' : 'person-outline'}
        iconSize={active === 'profile' ? 20 : 22} color={active === 'profile' ? '#F7F5EC' : '#262A3B'}
        iconContainerStyle={active === 'profile' ? styles.navBtnActive : null} style={styles.navBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute', bottom: 25, left: 20, right: 20, height: 65, backgroundColor: '#EFECE1',
    borderRadius: 35, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    elevation: 8, shadowColor: '#1E2136', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12,
    ...Platform.select({ web: { boxShadow: '0px 8px 20px rgba(30, 33, 54, 0.15)' } }),
  },
  navBtn: { minWidth: 36, minHeight: 36 },
  navBtnActive: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#262A3B', alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#262A3B', alignItems: 'center', justifyContent: 'center' },
});
