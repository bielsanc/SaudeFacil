import React from 'react';
import { StyleSheet, SafeAreaView, View, ActivityIndicator, Text } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import Header from '../components/Header';
import AguaOndas from '../components/AguaOndas';
import AguaConsumo from '../components/AguaConsumo';
import AguaPesoCard from '../components/AguaPesoCard';
import AguaQuickAdd from '../components/AguaBotoes';
import { useAgua } from '../hooks/useAgua';

export default function AguaScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { peso, setPeso, meta, consumido, progresso, adicionarAgua } = useAgua();

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1E7FB8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* O mar cobre 100% da tela ao fundo */}
      <View style={StyleSheet.absoluteFillObject}>
        <AguaOndas progresso={progresso} />
      </View>

      {/* Conteúdo sobreposto */}
      <View style={styles.content}>
        <Header
          title="Água"
          icon={require('../../assets/agua.png')}
          variant="light"
          leftIcon="home"
          onGoBack={() => navigation?.goBack?.()}
        />

        <AguaConsumo consumido={consumido} />

        {meta > 0 && progresso >= 1 && (
          <View style={styles.congratulations}>
            <Text style={styles.congratulationsTitle}>Parabéns!</Text>
            <Text style={styles.congratulationsText}>Você atingiu sua meta. A foca está comemorando com você!</Text>
          </View>
        )}

        <View style={styles.bottomContainer}>
          <AguaPesoCard peso={peso} setPeso={setPeso} meta={meta} />
          <AguaQuickAdd onAdicionar={adicionarAgua} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  bottomContainer: {
    paddingBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF6FC',
  },
  congratulations: {
    position: 'absolute', top: '28%', left: 8, right: 8, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', zIndex: 8,
    shadowColor: '#0B3D66', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14,
    shadowRadius: 8, elevation: 4,
  },
  congratulationsTitle: { color: '#0B6FA0', fontSize: 17, fontFamily: 'Poppins_700Bold' },
  congratulationsText: { color: '#315C76', fontSize: 11, fontFamily: 'Poppins_400Regular' },
});
