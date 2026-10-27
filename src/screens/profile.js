import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

import Header from '../components/Header';
import ProfileIdentity from '../components/ProfileIdentity';
import ProfileInfoCard from '../components/ProfileInfoCard';
import BottomNavBar from '../components/BottomNavBar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { calcularIdade, paraNumero } from '../utils/validacao';

export default function ProfileScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  // Dados do usuário logado, salvos localmente no cadastro.
  const { user, signOut, updateUser } = useAuth();

  // Estados editáveis, iniciados com o que está salvo.
  const [photoUri, setPhotoUri] = useState(user.fotoUri || null);
  const [nome, setNome] = useState(user.nome);
  const [email] = useState(user.email); // e-mail é o identificador da conta, não editável
  const [tipoSanguineo, setTipoSanguineo] = useState(user.tipoSanguineo);
  const [altura, setAltura] = useState(`${user.altura}cm`);
  const [peso, setPeso] = useState(`${user.peso}kg`);
  // A idade é calculada a partir da data de nascimento (não é salva).
  const idade = `${calcularIdade(user.nascimento) ?? '-'} anos`;

  /** Extrai o número de textos como "60kg" ou "1,65cm". */
  const extrairNumero = (t) => paraNumero(String(t).replace(/[^\d.,]/g, ''));

  const salvarAlteracoes = async () => {
    const pesoNum = extrairNumero(peso);
    let alturaNum = extrairNumero(altura);
    if (alturaNum > 0 && alturaNum < 3) alturaNum *= 100; // "1,65" -> 165 cm
    if (!nome.trim() || !(pesoNum > 0) || !(alturaNum > 0)) {
      return Alert.alert('Dados inválidos', 'Confira nome, peso e altura.');
    }
    await updateUser({
      nome: nome.trim(), tipoSanguineo: tipoSanguineo.trim().toUpperCase(),
      peso: pesoNum, altura: Math.round(alturaNum), fotoUri: photoUri,
    });
    Alert.alert('Perfil atualizado', 'Suas informações foram salvas com sucesso.');
  };

  // Ao confirmar, encerra a sessão: o AppRouter volta sozinho para a tela de Login.
  const confirmarSair = () => {
    // Alert.alert não funciona no navegador, então usamos window.confirm na web.
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja realmente sair?')) signOut();
      return;
    }
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#282B49" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header variant="profile" onGoBack={() => navigation.goBack()} />
        <ProfileIdentity
          photoUri={photoUri}
          onChangePhoto={setPhotoUri}
          name={nome}
          setName={setNome}
          email={email}
          emailEditable={false}
        />

        <ProfileInfoCard
          fields={[
            { label: 'Idade:', value: idade, onChangeText: () => {} },
            { label: 'Tipo Sanguíneo:', value: tipoSanguineo, onChangeText: setTipoSanguineo },
            { label: 'Altura:', value: altura, onChangeText: setAltura, keyboardType: 'default' },
            { label: 'Peso:', value: peso, onChangeText: setPeso, keyboardType: 'default' },
          ]}
        />

        <Button variant="dark" title="Salvar alterações" icon="checkmark-circle-outline" iconSize={18}
          iconStyle={styles.buttonIcon} textStyle={styles.saveText} onPress={salvarAlteracoes} style={styles.saveBtn} />

        <Button variant="danger" title="Sair da conta" icon="log-out-outline" iconSize={18} color="#D14343"
          iconStyle={styles.buttonIcon} textStyle={styles.logoutText} onPress={confirmarSair} style={styles.logoutBtn} />
      </ScrollView>

      <BottomNavBar
        active="profile"
        onPressHome={() => navigation.navigate('Home')}
        onPressAdd={() => console.log('Adicionar item')}
        onPressProfile={() => console.log('Já está no Perfil')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F1EA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F1EA',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  saveBtn: {
    marginHorizontal: 20,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: { marginRight: 8 },
  saveText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Poppins_500Medium' },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#D14343', fontSize: 14, fontFamily: 'Poppins_500Medium' },
});
