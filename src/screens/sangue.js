import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import BloodRiverBackground from '../components/BloodRiverBackground';

const TIPOS_SANGUINEOS = ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'];

const COMPATIBILIDADE = {
  'O−': { recebe: ['O−'], doa: TIPOS_SANGUINEOS },
  'O+': { recebe: ['O−', 'O+'], doa: ['O+', 'A+', 'B+', 'AB+'] },
  'A−': { recebe: ['O−', 'A−'], doa: ['A−', 'A+', 'AB−', 'AB+'] },
  'A+': { recebe: ['O−', 'O+', 'A−', 'A+'], doa: ['A+', 'AB+'] },
  'B−': { recebe: ['O−', 'B−'], doa: ['B−', 'B+', 'AB−', 'AB+'] },
  'B+': { recebe: ['O−', 'O+', 'B−', 'B+'], doa: ['B+', 'AB+'] },
  'AB−': { recebe: ['O−', 'A−', 'B−', 'AB−'], doa: ['AB−', 'AB+'] },
  'AB+': { recebe: TIPOS_SANGUINEOS, doa: ['AB+'] },
};

function BloodTypePill({ type, selected = false, onPress, compact = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.typePill,
        compact && styles.compactTypePill,
        selected && styles.selectedTypePill,
        pressed && styles.typePillPressed,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Selecionar tipo ${type}` : undefined}
    >
      {compact && <Ionicons name="arrow-down" size={13} color="#FFFFFF" style={styles.pillIcon} />}
      <Text style={[styles.typePillText, compact && styles.compactTypePillText, selected && styles.selectedTypePillText]}>{type}</Text>
    </Pressable>
  );
}

function CompatibilityGroup({ title, icon, types, variant }) {
  return (
    <Card variant="surface" style={styles.compatibilityCard}>
      <View style={styles.groupHeading}>
        <View style={[styles.groupIcon, variant === 'receive' ? styles.receiveIcon : styles.donateIcon]}>
          <Ionicons name={icon} size={15} color="#FFFFFF" />
        </View>
        <Text style={styles.groupTitle}>{title}</Text>
      </View>
      <View style={styles.typeList}>
        {types.map((type) => (
          <BloodTypePill key={type} type={type} compact />
        ))}
        {types.length === 0 && <Text style={styles.emptyCompatibility}>Nenhum tipo compatível.</Text>}
      </View>
    </Card>
  );
}

export default function SangueScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  const [tipo, setTipo] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const compatibility = tipo ? COMPATIBILIDADE[tipo] : null;

  const abrirSeletor = () => setModalVisible(true);

  if (!fontsLoaded) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#D90808" /></View>;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <BloodRiverBackground />
      <View style={styles.foreground}>
      <Header
        title="Sangue"
        icon={require('../../assets/sangue.png')}
        variant="blood"
        leftIcon="home"
        onGoBack={() => navigation?.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>Seu tipo{ '\n' }sanguíneo é</Text>
            <Pressable onPress={abrirSeletor} style={styles.heroType} accessibilityRole="button" accessibilityLabel="Alterar tipo sanguíneo">
              <Ionicons name="water" size={25} color="#E50914" />
              <Text style={styles.heroTypeText}>{tipo || 'Selecionar'}</Text>
              <Ionicons name="chevron-down" size={16} color="#9B261F" />
            </Pressable>
          </View>
        </View>

        <Card variant="profile" style={styles.compatibilityPanel}>
          <Text style={styles.panelTitle}>Compatibilidades</Text>
          <Text style={styles.panelSubtitle}>Veja quem pode doar para você e para quem você pode doar.</Text>
          {compatibility ? (
            <View style={styles.compatibilityRow}>
              <CompatibilityGroup title="Pode receber" icon="arrow-down" types={compatibility.recebe} variant="receive" />
              <CompatibilityGroup title="Pode doar para" icon="arrow-up" types={compatibility.doa} variant="donate" />
            </View>
          ) : (
            <Pressable onPress={abrirSeletor} style={styles.choosePrompt}>
              <Ionicons name="water-outline" size={26} color="#D90808" />
              <Text style={styles.choosePromptText}>Selecione seu tipo sanguíneo para ver as compatibilidades.</Text>
            </Pressable>
          )}
        </Card>
      </ScrollView>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => tipo && setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Qual é o seu tipo{ '\n' }sanguíneo?</Text>
            <View style={styles.modalTypes}>
              {TIPOS_SANGUINEOS.map((option) => (
                <BloodTypePill
                  key={option}
                  type={option}
                  selected={tipo === option}
                  onPress={() => setTipo(option)}
                />
              ))}
            </View>
            <Button
              variant="primary"
              title="Continuar"
              onPress={() => tipo && setModalVisible(false)}
              disabled={!tipo}
              style={[styles.continueButton, !tipo && styles.continueDisabled]}
              textStyle={styles.continueText}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8EC' },
  screen: { flex: 1, backgroundColor: '#FFF8EC' },
  foreground: { flex: 1, zIndex: 1 },
  scrollContent: { paddingBottom: 22 },
  hero: { height: 150, marginHorizontal: 16, justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  heroCopy: { zIndex: 2, paddingLeft: 4, width: '58%' },
  heroLabel: { color: '#514A48', fontSize: 16, lineHeight: 21, fontFamily: 'Poppins_700Bold' },
  heroType: { alignSelf: 'flex-start', marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 24, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#F7E4C6' },
  heroTypeText: { color: '#C80D14', fontSize: 23, fontFamily: 'Poppins_700Bold' },
  compatibilityPanel: { marginHorizontal: 14, padding: 16, minHeight: 260 },
  panelTitle: { color: '#262A3B', fontSize: 17, lineHeight: 22, fontFamily: 'Poppins_700Bold' },
  panelSubtitle: { color: '#7D7D7D', fontSize: 10, lineHeight: 14, fontFamily: 'Poppins_400Regular', marginBottom: 10, maxWidth: 270 },
  compatibilityRow: { flexDirection: 'row', gap: 12 },
  compatibilityCard: { flex: 1, minHeight: 190, padding: 12, borderRadius: 17, borderWidth: 1, borderColor: '#D6D1CE', shadowOpacity: 0, elevation: 0 },
  groupHeading: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  groupIcon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  receiveIcon: { backgroundColor: '#08BF73' },
  donateIcon: { backgroundColor: '#FF792A' },
  groupTitle: { color: '#303030', fontSize: 10, fontFamily: 'Poppins_700Bold', flexShrink: 1 },
  typeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' },
  typePill: { minWidth: 48, height: 34, borderRadius: 12, backgroundColor: '#F5E6DA', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, margin: 3, flexDirection: 'row' },
  compactTypePill: { minWidth: 48, height: 30, borderRadius: 15, backgroundColor: '#BFE1BB', paddingHorizontal: 10, margin: 0 },
  selectedTypePill: { backgroundColor: '#FBE6E1', borderWidth: 2, borderColor: '#D90808' },
  typePillText: { color: '#A52C24', fontSize: 15, fontFamily: 'Poppins_700Bold' },
  compactTypePillText: { color: '#173F32', fontSize: 14 },
  selectedTypePillText: { color: '#C30A0A' },
  typePillPressed: { opacity: 0.72 },
  pillIcon: { marginRight: 3 },
  emptyCompatibility: { color: '#777', fontSize: 10, fontFamily: 'Poppins_400Regular' },
  choosePrompt: { flex: 1, minHeight: 135, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 8 },
  choosePromptText: { textAlign: 'center', color: '#6F6A69', fontSize: 12, lineHeight: 18, fontFamily: 'Poppins_500Medium' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 340, borderRadius: 18, backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 8 },
  modalTitle: { textAlign: 'center', color: '#161616', fontSize: 15, lineHeight: 21, fontFamily: 'Poppins_700Bold', marginBottom: 12 },
  modalTypes: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 },
  continueButton: { width: '100%', backgroundColor: '#D90808', paddingVertical: 12, borderRadius: 13 },
  continueDisabled: { opacity: 0.5 },
  continueText: { fontSize: 14, color: '#FFFFFF' },
});
