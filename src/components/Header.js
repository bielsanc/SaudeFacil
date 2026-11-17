import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import WaveDivider from './WaveDivider';

export default function Header({ variant = 'standard', title = 'Início', userName, onOpenNotifications }) {
  const navigation = useNavigation();
  const openNotifications = onOpenNotifications || (() => navigation.navigate('Notificacoes'));
  const header = (
    <View style={styles.row}>
      <Pressable onPress={() => navigation.navigate('Home')} style={styles.logoButton} accessibilityRole="button" accessibilityLabel="Ir para início">
        <Image source={require('../../assets/logo1.png')} style={styles.logo} resizeMode="contain" />
      </Pressable>
      <Text numberOfLines={1} style={styles.title}>{variant === 'home' ? 'Início' : title}</Text>
      <Pressable onPress={openNotifications} style={styles.notification} accessibilityRole="button" accessibilityLabel="Notificações">
        <Ionicons name="notifications-outline" size={23} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  if (variant === 'home') {
    return (
      <View style={styles.homeWrapper}>
        <ImageBackground source={require('../../assets/fundo_header.png')} style={styles.homeBackground}
          imageStyle={styles.homeBackgroundImage} resizeMode="cover">
          {header}
          <View style={styles.homeContentRow}>
            <View style={styles.homeTextGroup}>
              <Text style={styles.greeting}>Olá, {userName}</Text>
              <Text style={styles.homeSubtitle}>Como está sua saúde hoje?</Text>
            </View>
            <Image source={require('../../assets/medica_crop.png')} style={styles.doctorImage} />
          </View>
          <View style={styles.homeWave}><WaveDivider color="#E8E4D9" style={styles.wave} /></View>
        </ImageBackground>
      </View>
    );
  }

  return <View style={styles.standard}>{header}</View>;
}

const styles = StyleSheet.create({
  standard: { height: 78, backgroundColor: '#242A4D', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingHorizontal: 14, justifyContent: 'center' },
  row: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoButton: { width: 62, height: 58, alignItems: 'flex-start', justifyContent: 'center' },
  logo: { width: 58, height: 58 },
  title: { position: 'absolute', left: 70, right: 70, textAlign: 'center', color: '#FFFFFF', fontSize: 17, fontFamily: 'Poppins_700Bold' },
  notification: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  homeWrapper: { backgroundColor: 'transparent', overflow: 'visible' },
  homeBackground: { paddingHorizontal: 16, paddingTop: 38, paddingBottom: 40, position: 'relative' },
  homeBackgroundImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  homeContentRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: 140, zIndex: 2, position: 'relative' },
  homeTextGroup: { flex: 1, paddingRight: 10, paddingTop: 8, zIndex: 3 },
  greeting: { fontSize: 32, color: '#FFFFFF', fontFamily: 'LibreBaskerville_700Bold' },
  homeSubtitle: { fontSize: 13, color: '#D8DAE5', marginTop: 6, fontFamily: 'Poppins_400Regular' },
  doctorImage: { width: 160, height: 180, resizeMode: 'contain', position: 'absolute', right: -10, bottom: -33, zIndex: 3 },
  homeWave: { position: 'absolute', bottom: -2, left: -1, right: -1, height: 55, zIndex: 2 },
  wave: { width: '100%', height: '100%' },
});
