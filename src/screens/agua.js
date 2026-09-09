import React from 'react';
import { StyleSheet, SafeAreaView, View, ActivityIndicator } from 'react-native';
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
});