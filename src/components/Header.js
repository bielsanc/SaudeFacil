import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import WaveDivider from './WaveDivider';
import Button from './Button';

/** Um único cabeçalho para as telas; variant muda a composição sem duplicar o componente. */
export default function Header({
  variant = 'standard',
  onGoBack,
  title = 'IMC',
  icon = require('../../assets/imc.png'),
  leftIcon = 'back',
  userName,
  onOpenMenu,
  onOpenNotifications,
  onLogOut,
}) {
  if (variant === 'home') {
    return (
      <View style={styles.homeWrapper}>
        <ImageBackground source={require('../../assets/fundo_header.png')} style={styles.homeBackground}
          imageStyle={styles.homeBackgroundImage} resizeMode="cover">
          <View style={styles.homeTopRow}>
            <HeaderImageButton source={require('../../assets/menu.png')} onPress={onOpenMenu} hitSlop={8} />
            <HeaderImageButton source={require('../../assets/sino.png')} onPress={onOpenNotifications} hitSlop={8} />
          </View>
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

  if (variant === 'profile') {
    return (
      <ImageBackground source={require('../../assets/fundoProfileTextura.png')} style={styles.profileBackground}
        imageStyle={styles.profileBackgroundImage} resizeMode="cover">
        <View style={styles.profileTopRow}>
          <HeaderIconButton icon="log-out-outline" onPress={onLogOut} hitSlop={10} />
        </View>
        <View style={styles.profileWave}><WaveDivider color="#F4F1EA" style={styles.wave} /></View>
        <View pointerEvents="none" style={styles.profileWaveEdge} />
      </ImageBackground>
    );
  }

  const palette = PALETTES[variant] || PALETTES.orange;
  return (
    <View style={[styles.header, variant === 'blood' && styles.bloodHeader, { backgroundColor: palette.bg }]}>
      <Button variant="headerBack" onPress={onGoBack} icon={leftIcon === 'home' ? 'home' : 'chevron-back'}
        iconSize={24} color={palette.icon} style={styles.backBtn} />
      <View style={styles.headerTitleContainer}>
        {!!icon && <View style={[styles.iconBadge, { backgroundColor: palette.badge }]}>
          <Image source={icon} style={styles.headerIcon} />
        </View>}
        <Text style={[styles.headerTitle, { color: palette.title }]}>{title}</Text>
      </View>
    </View>
  );
}

function HeaderImageButton({ source, onPress, hitSlop }) {
  return <Button variant="headerHome" onPress={onPress} hitSlop={hitSlop} iconSource={source} imageStyle={styles.homeIcon} />;
}

function HeaderIconButton({ icon, onPress, hitSlop }) {
  return <Button variant="headerProfile" onPress={onPress} hitSlop={hitSlop} icon={icon} iconSize={22} color="#FFFFFF" />;
}

const PALETTES = {
  orange: { bg: '#FF751F', icon: '#FFFFFF', badge: '#E2A9F1', title: '#FFFFFF' },
  blood: { bg: '#D90808', icon: '#FFFFFF', badge: 'rgba(255,255,255,0.18)', title: '#FFFFFF' },
  light: { bg: '#DBEFFA', icon: '#12699B', badge: 'transparent', title: '#0B4A7A' },
  dark: { bg: '#2D3142', icon: '#FFFFFF', badge: '#EBE7D9', title: '#FFFFFF' },
};

const styles = StyleSheet.create({
  header: { height: 84, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, position: 'relative' },
  bloodHeader: { height: 62, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  backBtn: { position: 'absolute', left: 16 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  headerIcon: { width: 50, height: 50, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold' },
  homeWrapper: { backgroundColor: 'transparent', overflow: 'visible' },
  homeBackground: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 40, position: 'relative' },
  homeBackgroundImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  homeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, zIndex: 10 },
  homeIcon: { width: 50, height: 50, resizeMode: 'contain', marginTop: -30 },
  homeContentRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: 140, zIndex: 2, position: 'relative' },
  homeTextGroup: { flex: 1, paddingRight: 10, paddingTop: 8, zIndex: 3 },
  greeting: { fontSize: 32, color: '#FFFFFF', fontFamily: 'LibreBaskerville_700Bold' },
  homeSubtitle: { fontSize: 13, color: '#D8DAE5', marginTop: 6, fontFamily: 'Poppins_400Regular' },
  doctorImage: { width: 160, height: 180, resizeMode: 'contain', position: 'absolute', right: -10, bottom: -33, zIndex: 3 },
  homeWave: { position: 'absolute', bottom: -2, left: -1, right: -1, height: 55, zIndex: 2 },
  wave: { width: '100%', height: '100%' },
  profileBackground: { paddingTop: 54, paddingBottom: 46, paddingHorizontal: 20, position: 'relative', overflow: 'hidden', backgroundColor: '#F4F1EA' },
  profileBackgroundImage: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  profileTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', zIndex: 5 },
  profileWave: { position: 'absolute', bottom: -1, left: -1, right: -1, height: 47, zIndex: 2 },
  profileWaveEdge: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: '#F4F1EA', zIndex: 3 },
});
