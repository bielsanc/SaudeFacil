import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

import ProfileHeader from '../components/ProfileHeader';
import ProfileInfoCard from '../components/ProfileInfoCard';
import BottomNavBar from '../components/BottomNavBar';

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
        <ProfileHeader
          onGoBack={() => navigation.goBack()}
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

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={salvarAlteracoes}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveText}>Salvar alterações</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
          onPress={() =>
            Alert.alert('Sair da conta', 'Deseja realmente sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => console.log('Logout') },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={18} color="#D14343" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
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
    flexDirection: 'row',
    backgroundColor: '#282B49',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#282B49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  logoutBtn: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#D14343',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  pressed: {
    opacity: 0.6,
  },
});
