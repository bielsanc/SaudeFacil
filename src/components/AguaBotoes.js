import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from './Button';

const OPCOES = [
  { id: 'copo', label: '200ml', valor: 200, icon: require('../../assets/copo.png') },
  { id: 'copao', label: '350ml', valor: 350, icon: require('../../assets/copao.png') },
  { id: 'garrafa', label: '500ml', valor: 500, icon: require('../../assets/garrafa.png') },
];

export default function AguaQuickAdd({ onAdicionar }) {
  return (
    <View style={styles.row}>
      {OPCOES.map((opcao) => (
        <Button key={opcao.id} variant="quickAdd" title={opcao.label} iconSource={opcao.icon}
          imageStyle={styles.icon} textStyle={styles.label} contentStyle={styles.itemContent}
          style={styles.item} pressedStyle={styles.itemPressed} onPress={() => onAdicionar?.(opcao.valor)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 24,
  },
  item: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flexDirection: 'column' },
  itemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  icon: { width: 34, height: 34, marginBottom: 8 },
  label: {
    fontSize: 13,
    color: '#38b6ff',
    fontFamily: 'Poppins_700Bold',
  },
});
