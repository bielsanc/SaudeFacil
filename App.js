
import { StatusBar } from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import AppRoutes from './src/routes/AppRouter';

export default function App() {
  return (
    <NavigationContainer>
      <AppRoutes/>
      <StatusBar style="auto"/>
    </NavigationContainer>
  );
}
