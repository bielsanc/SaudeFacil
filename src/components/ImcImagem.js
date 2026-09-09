import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';

// Cada gráfico já vem com a "seta" (recorte) apontando para a fatia
// correspondente do arco de categorias.
const GRAFICOS = [
  require('../../assets/grafico1.png'), // Magreza
  require('../../assets/grafico2.png'), // Abaixo do Peso
  require('../../assets/grafico3.png'), // Normal
  require('../../assets/grafico4.png'), // Acima do Peso
  require('../../assets/grafico5.png'), // Obesidade
];

export default function ImcImagem({ categoriaIndex, imc }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scale.setValue(0.7);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [categoriaIndex, imc, scale, opacity]);

  if (categoriaIndex == null || categoriaIndex < 0 || !imc) {
    return null;
  }

  const grafico = GRAFICOS[categoriaIndex] || GRAFICOS[2];

  return (
    <View style={styles.card}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Image source={grafico} style={styles.chartImage} />
      </Animated.View>
      <Text style={styles.chartTitle}>IMC</Text>
      <Text style={styles.chartSubtitle}>Seu IMC é:</Text>
      <Text style={styles.chartValue}>{imc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20, // <- ADICIONE ESTA LINHA (Ajuste o valor para afastar do header)
    borderRadius: 20,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#1E2136',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
 
  chartImage: {
    width: 190,
    height: 190,
    resizeMode: 'contain',
    marginBottom: -30,
  },
  chartTitle: {
    fontSize: 16,
    color: '#2D3142',
    fontFamily: 'Poppins_700Bold',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 6,
    fontFamily: 'Poppins_400Regular',
  },
  chartValue: {
    fontSize: 34,
    color: '#2D3142',
    fontFamily: 'Poppins_700Bold',
    marginTop: 2,
  },
});
