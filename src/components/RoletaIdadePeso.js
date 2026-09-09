import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function NumberWheelPicker({ min = 1, max = 120, value = 1, onChange }) {
  const prevVal = value > min ? value - 1 : null;
  const nextVal = value < max ? value + 1 : null;

  return (
    <View style={styles.container}>
      {/* Valor Anterior */}
      <Pressable 
        onPress={() => prevVal !== null && onChange(prevVal)} 
        style={styles.numBtn}
      >
        <Text style={styles.sideNumber}>{prevVal !== null ? prevVal : ''}</Text>
      </Pressable>

      {/* Valor Selecionado Atual */}
      <View style={styles.centerCol}>
        <Text style={styles.activeNumber}>{value}</Text>
        <Text style={styles.arrowUp}>▲</Text>
      </View>

      {/* Próximo Valor */}
      <Pressable 
        onPress={() => nextVal !== null && onChange(nextVal)} 
        style={styles.numBtn}
      >
        <Text style={styles.sideNumber}>{nextVal !== null ? nextVal : ''}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
    height: 50,
  },
  numBtn: {
    minWidth: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideNumber: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#000000', // Número lateral em preto
    opacity: 0.3,     // Opacidade leve para destacar o central
  },
  centerCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNumber: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#000000', // Número central em preto destacado
  },
  arrowUp: {
    fontSize: 10,
    color: '#FF751F',
    marginTop: -2,
  },
});