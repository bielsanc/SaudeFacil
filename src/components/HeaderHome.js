import React from 'react';
import { View, Text, Image, ImageBackground, Pressable, StyleSheet } from 'react-native';
import WaveDivider from './DivOnda';

export default function Header({ userName, onOpenMenu, onOpenNotifications }) {
  return (
    <View style={styles.headerWrapper}>
      <ImageBackground
        source={require('../../assets/fundo_header.png')}
        style={styles.backgroundContainer}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Ícones de Menu e Notificação no Topo */}
        <View style={styles.topRow}>
          <Pressable
            onPress={onOpenMenu}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Image
              source={require('../../assets/menu.png')}
              style={styles.headerIcon}
            />
          </Pressable>

          <Pressable
            onPress={onOpenNotifications}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Image
              source={require('../../assets/sino.png')}
              style={styles.headerIcon}
            />
          </Pressable>
        </View>

        {/* Conteúdo Principal (Textos + Médica) */}
        <View style={styles.contentRow}>
          <View style={styles.textGroup}>
            <Text style={styles.greeting}>Olá, {userName}</Text>
            <Text style={styles.subtitle}>Como está sua saúde hoje?</Text>
          </View>

          {/* Imagem da Médica */}
          <Image
            source={require('../../assets/medica_crop.png')}
            style={styles.doctorImage}
          />
        </View>

        {/* Container da onda se sobrepondo em 2px para baixo */}
        <View style={styles.waveContainer}>
          <WaveDivider color="#E8E4D9" style={styles.wave} />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  backgroundContainer: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 10,
  },
  iconBtn: {
    padding: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  headerIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginTop: -30,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 140,
    zIndex: 2,
    position: 'relative',
  },
  textGroup: {
    flex: 1,
    paddingRight: 10,
    paddingTop: 8,
    zIndex: 3,
  },
  greeting: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'LibreBaskerville_700Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#D8DAE5',
    marginTop: 6,
    fontFamily: 'Poppins_400Regular',
  },
  doctorImage: {
    width: 160,
    height: 180,
    resizeMode: 'contain',
    position: 'absolute',
    right: -10,
    bottom: -33,
    zIndex: 3,
  },
  waveContainer: {
    position: 'absolute',
    bottom: -2, /* Avança 2px para cobrir qualquer fresta do container bege */
    left: -1,
    right: -1,
    height: 55,
    zIndex: 2,
  },
  wave: {
    width: '100%',
    height: '100%',
  },
});