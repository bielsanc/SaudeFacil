import React, { useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View, ActivityIndicator, Animated, Alert } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import Header from '../components/Header';
import ImcForm from '../components/ImcForm';
import ImcChart from '../components/ImcImagem';
import ImcResultCard from '../components/ImcResultado';
import { useImcCalculator } from '../hooks/calculo';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { salvarRegistroImc } from '../services/authStorage';
import { calcularIdade } from '../utils/validacao';
import { CATEGORIAS_IMC } from '../hooks/calculo';

export default function ImcScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const [step, setStep] = useState('form'); // 'form' | 'resultado'
  const fade = useRef(new Animated.Value(1)).current;
  const { user } = useAuth();

  const {
    idade,
    setIdade,
    altura,
    setAltura,
    peso,
    setPeso,
    genero,
    setGenero,
    resultado,
  } = useImcCalculator();

  React.useEffect(() => {
    if (!user) return;
    const idadeCadastro = calcularIdade(user.nascimento);
    if (idadeCadastro != null) setIdade(idadeCadastro);
    if (user.altura) setAltura(Number(user.altura));
    if (user.peso) setPeso(Number(user.peso));
  }, [user?.id]);

  const trocarStep = (novoStep) => {
    Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setStep(novoStep);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF751F" />
      </View>
    );
  }

  const isResultado = step === 'resultado';
  const continuar = async () => {
    const categoria = CATEGORIAS_IMC[resultado.categoriaIndex]?.label;
    if (!resultado.imc || !categoria) return;
    try {
      await salvarRegistroImc({ idade, genero, peso: Number(peso), altura: Number(altura), imc: Number(resultado.imc), categoria });
      trocarStep('resultado');
    } catch (error) {
      Alert.alert('Não foi possível salvar', 'Verifique se a API e o banco MySQL do XAMPP estão ativos e tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        variant="orange"
        title={isResultado ? 'IMC · Resultado' : 'IMC'}
        icon={require('../../assets/imc.png')}
        leftIcon={isResultado ? 'back' : 'home'}
        onGoBack={() => (isResultado ? trocarStep('form') : navigation.goBack())}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade }}>
          {!isResultado ? (
            <ImcForm
              idade={idade}
              setIdade={setIdade}
              altura={altura}
              setAltura={setAltura}
              peso={peso}
              setPeso={setPeso}
              genero={genero}
              setGenero={setGenero}
              onContinuar={continuar}
            />
          ) : (
            <>
              <ImcChart categoriaIndex={resultado.categoriaIndex} imc={resultado.imc} />
              <ImcResultCard categoriaIndex={resultado.categoriaIndex} />
              <Button title="Continuar" textStyle={styles.continueText} onPress={() => navigation.goBack()} style={styles.continueBtn} />
            </>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBE7D9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBE7D9',
  },
  continueBtn: {
    alignItems: 'center',
    marginTop: 4,
    marginHorizontal: 16,
    shadowColor: '#FF751F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  continueText: { fontSize: 16 },
});
