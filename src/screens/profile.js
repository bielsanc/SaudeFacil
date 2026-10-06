import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

import Header from '../components/Header';
import ProfileIdentity from '../components/ProfileIdentity';
import ProfileInfoCard from '../components/ProfileInfoCard';
import BottomNavBar from '../components/BottomNavBar';
import Button from '../components/Button';

export default function ProfileScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const [photoUri, setPhotoUri] = useState(null);
  const [nome, setNome] = useState('Beatriz Florencio');
  const [email, setEmail] = useState('beatrizsantos.97@gmail.com');
  const [idade, setIdade] = useState('17 anos');
  const [tipoSanguineo, setTipoSanguineo] = useState('B+');
  const [altura, setAltura] = useState('1,65cm');
  const [peso, setPeso] = useState('60kg');

  const salvarAlteracoes = () => {
    Alert.alert('Perfil atualizado', 'Suas informações foram salvas com sucesso.');
  };

  const confirmarSair = () => Alert.alert('Sair da conta', 'Deseja realmente sair?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Sair', style: 'destructive', onPress: () => console.log('Logout') },
  ]);

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
        <Header variant="profile" onGoBack={() => navigation.goBack()} onLogOut={confirmarSair} />
        <ProfileIdentity
          photoUri={photoUri}
          onChangePhoto={setPhotoUri}
          name={nome}
          setName={setNome}
          email={email}
          setEmail={setEmail}
        />

        <ProfileInfoCard
          fields={[
            { label: 'Idade:', value: idade, onChangeText: setIdade },
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
