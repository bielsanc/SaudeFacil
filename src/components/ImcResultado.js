import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';
import { CATEGORIAS_IMC } from '../hooks/calculo';
import Card from './Card';

const PESSOA_ICONS = {
  magreza: require('../../assets/magreza.png'),
  abaixoPeso: require('../../assets/abaixoPeso.png'),
  normal: require('../../assets/normalPeso.png'),
  acimaPeso: require('../../assets/acimaPeso.png'),
  obesidade: require('../../assets/obesidade.png'),
};

function LinhaCategoria({ item, isCurrent, index }) {
  const translateX = useRef(new Animated.Value(-16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 320,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [translateX, opacity, index]);

  return (
    <Animated.View
      style={[
        styles.row,
        isCurrent && styles.rowActive,
        { transform: [{ translateX }], opacity },
      ]}
    >
      <View style={styles.rowLeft}>
        <Image source={PESSOA_ICONS[item.key]} style={styles.pessoaIcon} />
        <Text style={[styles.rowLabel, isCurrent && styles.rowLabelActive]}>{item.label}</Text>
      </View>
      <Text style={[styles.rowRange, isCurrent && styles.rowLabelActive]}>{item.range}</Text>
    </Animated.View>
  );
}

export default function ImcResultCard({ categoriaIndex }) {
  if (categoriaIndex == null || categoriaIndex < 0) {
    return null;
  }

  return (
    <Card variant="result" style={styles.card}>
      <Text style={styles.title}>Categoria</Text>
      {CATEGORIAS_IMC.map((item, index) => (
        <LinhaCategoria
          key={item.key}
          item={item}
          index={index}
          isCurrent={index === categoriaIndex}
        />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 20,
    padding: 18,
  },
  title: {
    fontSize: 17,
    color: '#FF751F',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: '#FFF1E4',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pessoaIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 14,
    color: '#2D3142',
    fontFamily: 'Poppins_500Medium',
  },
  rowLabelActive: {
    color: '#FF751F',
    fontFamily: 'Poppins_700Bold',
  },
  rowRange: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: 'Poppins_500Medium',
  },
});
