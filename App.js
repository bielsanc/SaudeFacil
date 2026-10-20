
import { StatusBar } from 'expo-status-bar';
import {NavigationContainer} from "@react-navigation/native";
import AppRoutes from './src/routes/AppRouter';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    // AuthProvider disponibiliza o usuário logado (useAuth) para todas as telas
    <AuthProvider>
      <NavigationContainer>
        <AppRoutes/>
        <StatusBar style="auto"/>
      </NavigationContainer>
    </AuthProvider>
  );
}
