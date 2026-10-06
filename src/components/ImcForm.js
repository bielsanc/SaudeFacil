import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import GenderSelector from './SeletorGenero';
import NumberWheelPicker from './RoletaIdadePeso';
import HeightRuler from './RoletaAltura';
import Card from './Card';
import Button from './Button';

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
          <NumericInput label="Idade" value={idade} suffix="anos" min={1} max={110} onChange={setIdade} />
          <Card variant="surface" style={styles.pickerCard}>
            <NumberWheelPicker min={1} max={110} value={idade} onChange={setIdade} />
          </Card>

          {/* 3. SEÇÃO PESO */}
          <Text style={styles.label}>Peso</Text>
          <NumericInput label="Peso" value={peso} suffix="kg" min={20} max={220} onChange={setPeso} />
          <Card variant="surface" style={styles.pickerCard}>
            <NumberWheelPicker min={20} max={220} value={peso} onChange={setPeso} />
          </Card>

        </View>

        {/* COLUNA DA DIREITA: RÉGUA DE ALTURA */}
        <View style={styles.rightColumn}>
          <View style={styles.labelWithUnitRow}>
            <Text style={styles.label}>Altura</Text>
          </View>
          
          {/* Card Branco da Altura (Ocupa toda a altura da coluna) */}
          <Card variant="surface" style={styles.heightRulerCard}>
            <View pointerEvents="box-none" style={styles.heightInputOverlay}>
              <NumericInput label="Altura" value={altura} suffix="cm" min={50} max={220} onChange={setAltura} />
            </View>
            <View style={styles.heightInputSpacer} />
            <HeightRuler min={50} max={220} value={altura} onChange={setAltura} />
          </Card>
        </View>

      </View>

      {/* BOTÃO CONTINUAR */}
      <Button title="Continuar" textStyle={styles.continueText} onPress={onContinuar} style={styles.continueBtn} />
    </View>
  );
}

function NumericInput({ label, value, suffix, min, max, onChange }) {
  const [text, setText] = useState(String(value ?? ''));
  useEffect(() => setText(String(value ?? '')), [value]);

  useEffect(() => {
    const number = Number(text);
    if (!text || number < min || number > max) return undefined;
    const timer = setTimeout(() => onChange(number), 600);
    return () => clearTimeout(timer);
  }, [text, min, max, onChange]);

  return (
    <Card variant="input" style={styles.numericInputRow}>
      <TextInput
        style={styles.numericInput}
        value={text}
        onChangeText={(text) => {
          if (!/^\d*$/.test(text)) return;
          setText(text);
        }}
        onBlur={() => {
          const parsed = Number(text);
          const safeValue = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min;
          onChange(safeValue);
          setText(String(safeValue));
        }}
        onSubmitEditing={() => {
          const parsed = Number(text);
          const safeValue = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min;
          onChange(safeValue);
          setText(String(safeValue));
        }}
        keyboardType="number-pad"
        accessibilityLabel={label}
        selectTextOnFocus
      />
      {!!suffix && <Text style={styles.numericUnit}>{suffix}</Text>}
    </Card>
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
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  numericInputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8,
    paddingHorizontal: 14, marginBottom: 8, height: 58, width: '100%', minWidth: 0, maxWidth: '100%',
  },
  numericInput: { flex: 1, width: 0, minWidth: 0, paddingVertical: 0, fontSize: 16, color: '#262A3B', fontFamily: 'Poppins_500Medium', outlineStyle: 'none' },
  numericUnit: { flexShrink: 0, marginLeft: 8, fontSize: 12, color: '#8E8E93', fontFamily: 'Poppins_500Medium' },
  heightRulerCard: {
    flex: 1, // Faz o card da régua preencher toda a altura disponível da coluna
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
    position: 'relative',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heightInputOverlay: { position: 'absolute', top: 12, left: 12, right: 12, zIndex: 20 },
  heightInputSpacer: { width: '100%', height: 66 },
  continueBtn: {
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 10,
    shadowColor: '#FF751F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  continueText: { fontSize: 16 },
});
