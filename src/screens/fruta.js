import React, { useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

import Header from '../components/Header';
import FruitSearchInput from '../components/FruitSearchInput';

export default function FruitScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00B969" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.layout}>
        <Image
          source={require('../../assets/frutas.png')}
          resizeMode="contain"
          accessible={false}
          pointerEvents="none"
          style={[styles.backgroundIllustration, { width, height: width }]}
        />

        <View style={styles.foreground}>
          <Header
            variant="fruit"
            title="Fruta"
            icon={require('../../assets/fruta.png')}
            leftIcon="home"
            onGoBack={() => navigation.navigate('Home')}
          />

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FruitSearchInput value={query} onChangeText={setQuery} />

            <View style={styles.illustrationSpace} />

            <Text style={styles.title}>Encontre informações{ '\n' }sobre sua fruta favorita!</Text>
            <Text style={styles.description}>
              Digite o nome da fruta na barra de{ '\n' }busca e veja suas informações
            </Text>

            <View style={styles.heartDecoration} accessible={false}>
              <View style={[styles.ray, styles.rayLeftTop]} />
              <View style={[styles.ray, styles.rayLeftMiddle]} />
              <View style={[styles.ray, styles.rayLeftBottom]} />
              <Ionicons name="heart" size={43} color="#68B83F" />
              <View style={[styles.ray, styles.rayRightTop]} />
              <View style={[styles.ray, styles.rayRightMiddle]} />
              <View style={[styles.ray, styles.rayRightBottom]} />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  layout: { flex: 1, position: 'relative', overflow: 'hidden' },
  foreground: { flex: 1, zIndex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32, alignItems: 'stretch' },
  backgroundIllustration: {
    position: 'absolute',
    top: 88,
    left: 0,
    zIndex: 0,
  },
  illustrationSpace: { height: 205, marginTop: 5 },
  title: {
    marginTop: 7,
    color: '#00B969',
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.45,
    transform: [{ rotate: '-2deg' }],
  },
  description: {
    marginTop: 9,
    color: '#0759C7',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  heartDecoration: {
    width: 140,
    height: 60,
    alignSelf: 'center',
    marginTop: 61,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: { position: 'absolute', width: 24, height: 5, borderRadius: 3, backgroundColor: '#70B93E' },
  rayLeftTop: { left: 10, top: 9, transform: [{ rotate: '42deg' }] },
  rayLeftMiddle: { left: 4, top: 28, transform: [{ rotate: '4deg' }] },
  rayLeftBottom: { left: 16, top: 47, transform: [{ rotate: '-52deg' }] },
  rayRightTop: { right: 10, top: 9, transform: [{ rotate: '-42deg' }] },
  rayRightMiddle: { right: 4, top: 28, transform: [{ rotate: '-4deg' }] },
  rayRightBottom: { right: 16, top: 47, transform: [{ rotate: '52deg' }] },
});
