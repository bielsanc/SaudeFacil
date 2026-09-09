import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AguaConsumo({ consumido = 0 }) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.valor}>{consumido}ml</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: -300,
    zIndex: 6,
  },
  valor: {
    fontSize: 42,
    color: '#0B3D66',
    fontFamily: 'Poppins_700Bold',
  },
});