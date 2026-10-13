import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home';
import ImcScreen from '../screens/imc';
import AguaScreen from '../screens/agua';
import ProfileScreen from '../screens/profile';
import SangueScreen from '../screens/sangue';
import FruitScreen from '../screens/fruta';

const Stack = createNativeStackNavigator();

export default function AppRouter() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="IMC" component={ImcScreen} />
      <Stack.Screen name="Agua" component={AguaScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Sangue" component={SangueScreen} />
      <Stack.Screen name="Fruta" component={FruitScreen} />
    </Stack.Navigator>
  );
}
