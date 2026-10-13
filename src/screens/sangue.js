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

function BloodTypePill({ type, selected = false, onPress, compact = false, tone, own = false }) {
  const toneStyle = compact && tone ? (own ? styles[`${tone}Own`] : styles[`${tone}Soft`]) : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.typePill,
        compact && styles.compactTypePill,
        toneStyle,
        selected && styles.selectedTypePill,
        pressed && onPress && styles.typePillPressed,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Selecionar tipo ${type}` : undefined}
    >
      <Text style={[styles.typePillText, compact && styles.compactTypePillText, selected && styles.selectedTypePillText]}>
        {type}
      </Text>
    </Pressable>
  );
}

function CompatibilityGroup({ title, icon, types, variant, tipo }) {
  const ordered = [...types].sort((x, y) => (y === tipo) - (x === tipo));

  return (
    <View style={[styles.compatibilityCard, variant === 'receive' ? styles.receiveCard : styles.donateCard]}>
      <View style={styles.groupHeading}>
        <View style={[styles.groupIcon, variant === 'receive' ? styles.receiveIcon : styles.donateIcon]}>
          <Ionicons name={icon} size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.groupTitle}>{title}</Text>
      </View>

      <View style={styles.typeList}>
        {ordered.map((type) => (
          <BloodTypePill key={type} type={type} compact tone={variant} own={type === tipo} />
        ))}
        {types.length === 0 && <Text style={styles.emptyCompatibility}>Nenhum tipo compatível.</Text>}
      </View>
    </View>
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
        <View style={styles.headerWrap}>
          <Header
            title="Sangue"
            icon={require('../../assets/sangue.png')}
            variant="blood"
            leftIcon="home"
            onGoBack={() => navigation?.navigate('Home')}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>Seu tipo{ '\n' }sanguíneo é</Text>
              <Pressable
                onPress={abrirSeletor}
                style={styles.heroType}
                accessibilityRole="button"
                accessibilityLabel="Alterar tipo sanguíneo"
              >
                <Ionicons name="water" size={31} color="#E50914" />
                <Text style={styles.heroTypeText}>{tipo || 'Selecionar'}</Text>
              </Pressable>
            </View>
          </View>

          <Card variant="profile" style={styles.compatibilityPanel}>
            <View style={styles.panelHeading}>
              <View style={styles.panelHeadingCopy}>
                <Text style={styles.panelTitle}>Compatibilidades</Text>
                <Text style={styles.panelSubtitle}>Veja quem pode doar pra você e pra quem você pode doar.</Text>
              </View>
            </View>

            {compatibility ? (
              <View style={styles.compatibilityRow}>
                <CompatibilityGroup
                  title="Pode receber de"
                  icon="arrow-down"
                  types={compatibility.recebe}
                  variant="receive"
                  tipo={tipo}
                />
                <CompatibilityGroup
                  title="Pode doar para"
                  icon="arrow-up"
                  types={compatibility.doa}
                  variant="donate"
                  tipo={tipo}
                />
              </View>
            ) : (
              <Pressable onPress={abrirSeletor} style={styles.choosePrompt}>
                <View style={styles.choosePromptIcon}>
                  <Ionicons name="water" size={20} color="#D90808" />
                </View>
                <Text style={styles.choosePromptText}>Selecione seu tipo sanguíneo para ver as compatibilidades.</Text>
              </Pressable>
            )}
          </Card>

          <Card variant="profile" style={styles.donationCard}>
            <View style={styles.donationTop}>
              <View style={styles.heartIcon}>
                <Ionicons name="heart" size={23} color="#D90808" />
              </View>
              <View style={styles.donationCopy}>
                <Text style={styles.donationTitle}>Pronto pra fazer a diferença?</Text>
                <Text style={styles.donationSubtitle}>Sua doação pode salvar vidas.</Text>
              </View>
            </View>

            <Pressable
              onPress={() => navigation?.navigate('Home')}
              style={({ pressed }) => [styles.donationButton, pressed && styles.donationButtonPressed]}
              accessibilityRole="button"
            >
              <Text style={styles.donationButtonText}>Encontre um local para doar</Text>
            </Pressable>
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
            <Text style={styles.modalKicker}>Seu tipo sanguíneo</Text>
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F3F5',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFF7E9',
  },
  foreground: {
    flex: 1,
    zIndex: 1,
  },
  headerWrap: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  scrollContent: {
    paddingBottom: 22,
  },
  hero: {
    minHeight: 168,
    marginHorizontal: 0,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  heroCopy: {
    zIndex: 2,
    paddingLeft: 0,
    width: '54%',
    paddingTop: 8,
  },
  heroLabel: {
    color: '#4F4A49',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.25,
  },
  heroType: {
    alignSelf: 'flex-start',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F4E0C5',
  },
  heroTypeText: {
    color: '#C90A0A',
    fontSize: 29,
    lineHeight: 36,
    marginLeft: 3,
    fontFamily: 'Poppins_700Bold',
  },
  compatibilityPanel: {
    marginHorizontal: 28,
    marginTop: -1,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 14,
    borderRadius: 20,
    minHeight: 302,
    backgroundColor: 'rgba(255,255,255,0.76)',
    shadowColor: '#2A201C',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  panelHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  panelHeadingCopy: {
    flex: 1,
    paddingRight: 2,
  },
  panelTitle: {
    color: '#111111',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.25,
  },
  panelSubtitle: {
    color: '#8B8785',
    fontSize: 8.8,
    lineHeight: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 1,
    maxWidth: 255,
  },
  compatibilityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compatibilityCard: {
    flex: 1,
    height: 202,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  receiveCard: {
    borderColor: '#BDBDBD',
  },
  donateCard: {
    borderColor: '#BDBDBD',
  },
  groupHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  receiveIcon: {
    backgroundColor: '#11B969',
  },
  donateIcon: {
    backgroundColor: '#FF7A31',
  },
  groupTitle: {
    color: '#111111',
    fontSize: 8.4,
    lineHeight: 11,
    fontFamily: 'Poppins_700Bold',
    flex: 1,
  },
  typeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    alignContent: 'flex-start',
  },
  typePill: {
    minWidth: 48,
    height: 33,
    borderRadius: 12,
    backgroundColor: '#F5E6DA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    margin: 2,
  },
  compactTypePill: {
    minWidth: 42,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    margin: 0,
  },
  receiveOwn: {
    backgroundColor: '#00B96B',
  },
  receiveSoft: {
    backgroundColor: '#CDE3C6',
  },
  donateOwn: {
    backgroundColor: '#FF792F',
  },
  donateSoft: {
    backgroundColor: '#F8C1A6',
  },
  selectedTypePill: {
    backgroundColor: '#FBE6E1',
    borderWidth: 2,
    borderColor: '#D90808',
  },
  typePillText: {
    color: '#A52C24',
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
  },
  compactTypePillText: {
    color: '#0F2F22',
    fontSize: 13.7,
    fontFamily: 'Poppins_700Bold',
  },
  selectedTypePillText: {
    color: '#C30A0A',
  },
  typePillPressed: {
    opacity: 0.72,
  },
  emptyCompatibility: {
    color: '#777777',
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
  },
  choosePrompt: {
    flex: 1,
    minHeight: 135,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 7,
  },
  choosePromptIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choosePromptText: {
    textAlign: 'center',
    color: '#6F6A69',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins_500Medium',
  },
  donationCard: {
    marginHorizontal: 28,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 11,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.76)',
    shadowColor: '#2A201C',
    shadowOpacity: 0.1,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  donationTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 11,
  },
  heartIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  donationCopy: {
    flex: 1,
    paddingTop: 1,
  },
  donationTitle: {
    color: '#111111',
    fontSize: 13.7,
    lineHeight: 19,
    fontFamily: 'Poppins_700Bold',
  },
  donationSubtitle: {
    color: '#8B8785',
    fontSize: 8.8,
    lineHeight: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 1,
  },
  donationButton: {
    width: '100%',
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D90808',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  donationButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  donationButtonText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontFamily: 'Poppins_700Bold',
    flexShrink: 1,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,20,20,0.60)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 19,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  modalKicker: {
    color: '#D90808',
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  modalTitle: {
    textAlign: 'center',
    color: '#161616',
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 10,
  },
  modalTypes: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 3,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#D90808',
    paddingVertical: 12,
    borderRadius: 13,
  },
  continueDisabled: {
    opacity: 0.5,
  },
  continueText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});
