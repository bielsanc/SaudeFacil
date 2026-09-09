import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import GenderSelector from './SeletorGenero';
import NumberWheelPicker from './RoletaIdadePeso';
import HeightRuler from './RoletaAltura';

export default function ImcForm({
  idade,
  setIdade,
  altura,
  setAltura,
  peso,
  setPeso,
  genero,
  setGenero,
  onContinuar,
}) {
  return (
    <View style={styles.formContainer}>
      {/* GRID PRINCIPAL EM 2 COLUNAS LADO A LADO */}
      <View style={styles.mainGrid}>
        
        {/* COLUNA DA ESQUERDA: GÊNERO, IDADE E PESO */}
        <View style={styles.leftColumn}>
          
          {/* 1. SEÇÃO GÊNERO */}
          <Text style={styles.label}>Gênero</Text>
          <View style={styles.genderWrapper}>
            <GenderSelector genero={genero} setGenero={setGenero} />
          </View>

          {/* 2. SEÇÃO IDADE */}
          <Text style={styles.label}>Idade</Text>
          <View style={styles.pickerCard}>
            <NumberWheelPicker min={1} max={110} value={idade} onChange={setIdade} />
          </View>

          {/* 3. SEÇÃO PESO */}
          <View style={styles.labelWithUnitRow}>
            <Text style={styles.label}>Peso</Text>
            <Text style={styles.unitInline}>kg</Text>
          </View>
          <View style={styles.pickerCard}>
            <NumberWheelPicker min={20} max={220} value={peso} onChange={setPeso} />
          </View>

        </View>

        {/* COLUNA DA DIREITA: RÉGUA DE ALTURA */}
        <View style={styles.rightColumn}>
          <View style={styles.labelWithUnitRow}>
            <Text style={styles.label}>Altura</Text>
            <Text style={styles.unitInline}>cm</Text>
          </View>
          
          {/* Card Branco da Altura (Ocupa toda a altura da coluna) */}
          <View style={styles.heightRulerCard}>
            <HeightRuler min={50} max={220} value={altura} onChange={setAltura} />
          </View>
        </View>

      </View>

      {/* BOTÃO CONTINUAR */}
      <Pressable
        style={({ pressed }) => [styles.continueBtn, pressed && styles.continueBtnPressed]}
        onPress={onContinuar}
      >
        <Text style={styles.continueText}>Continuar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  mainGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    width: '58%', // Ocupa a maior parte da largura
  },
  rightColumn: {
    width: '38%', // Ocupa a coluna vertical da direita
  },
  label: {
    fontSize: 15,
    color: '#FF751F',
    textAlign: 'left',
    marginBottom: 6,
    fontFamily: 'Poppins_700Bold',
  },
  labelWithUnitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  unitInline: {
    fontSize: 13,
    color: '#FF751F',
    fontFamily: 'Poppins_500Medium',
  },
  genderWrapper: {
    marginBottom: 12,
  },
  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#1E2136',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  heightRulerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flex: 1, // Faz o card da régua preencher toda a altura disponível da coluna
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E2136',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  continueBtn: {
    backgroundColor: '#FF751F',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 10,
    shadowColor: '#FF751F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  continueBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
});