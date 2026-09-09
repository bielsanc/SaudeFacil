import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function AguaPesoCard({ peso, setPeso, meta }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Digite seu peso:</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder=""
          value={peso}
          onChangeText={setPeso}
        />
        <Text style={styles.unidade}>kg</Text>
      </View>

      <Text style={styles.label}>Você deve beber:</Text>
      <Text style={styles.meta}>{(Number.isFinite(meta) ? meta : 1200).toLocaleString('pt-BR')}ml</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(234, 246, 252, 0.88)',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: '#0B3D66',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0B3D66',
    fontFamily: 'Poppins_400Regular',
    padding: 0,
    outlineStyle: 'none',
  },
  unidade: {
    fontSize: 14,
    color: '#5B7C93',
    fontFamily: 'Poppins_600SemiBold',
  },
  meta: {
    fontSize: 32,
    color: '#0B3D66',
    fontFamily: 'Poppins_700Bold',
  },
});