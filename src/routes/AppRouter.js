import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home';
import ImcScreen from '../screens/imc';
import AguaScreen from '../screens/agua';
import ProfileScreen from '../screens/profile';
import SangueScreen from '../screens/sangue';
import FruitScreen from '../screens/fruta';
import LoginScreen from '../screens/login';
import CadastroScreen from '../screens/cadastro';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppRouter() {
  const { user, loading } = useAuth();

  // Enquanto lê a sessão salva no aparelho, mostra um indicador de carregamento.
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF4E3' }}>
        <ActivityIndicator size="large" color="#282B49" />
      </View>
    );
  }

  // Sem usuário logado: só Login e Cadastro existem.
  // Com usuário logado: só as telas do app existem.
  // Trocar de "user" troca o grupo de telas automaticamente (sem navigation.navigate).
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="IMC" component={ImcScreen} />
          <Stack.Screen name="Agua" component={AguaScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Sangue" component={SangueScreen} />
          <Stack.Screen name="Fruta" component={FruitScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
