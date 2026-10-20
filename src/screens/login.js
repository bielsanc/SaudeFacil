
import React, { useRef, useState } from 'react';
import {
  View, Text, Image, Pressable, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { LibreBaskerville_700Bold } from '@expo-google-fonts/libre-baskerville';

import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { emailValido } from '../utils/validacao';

export default function LoginScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_700Bold, LibreBaskerville_700Bold });
  const { signIn } = useAuth();

  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});      
  const [erroGeral, setErroGeral] = useState(''); 
  const [enviando, setEnviando] = useState(false);
  const senhaRef = useRef(null);               

  
  const validar = () => {
    const e = {};
    if (!emailValido(email)) e.email = 'Digite um e-mail válido.';
    if (!senha) e.senha = 'Digite a sua senha.';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const entrar = async () => {
    setErroGeral('');
    if (enviando || !validar()) return;
    setEnviando(true);
    try {
      await signIn(email, senha);
      
    } catch (err) {
      setErroGeral(err.message === 'CREDENCIAIS_INVALIDAS'
        ? 'E-mail ou senha incorretos.'
        : 'Não foi possível entrar. Tente novamente.');
      setEnviando(false);
    }
  };

  if (!fontsLoaded) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#282B49" /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          <Image source={require('../../assets/logo2.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>Bem-vindo(a)!</Text>
          <Text style={styles.subtitle}>Faça login para acessar sua conta e continuar.</Text>

          {/* Cartão branco com os campos */}
          <View style={styles.card}>
            <AuthInput
              label="E-mail:" iconName="person" placeholder="Digite o seu e-mail"
              value={email} onChangeText={setEmail} error={erros.email}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email"
              returnKeyType="next" onSubmitEditing={() => senhaRef.current?.focus()}
            />
            <AuthInput
              style={styles.gap} label="Senha:" iconName="lock-closed" placeholder="Digite a sua senha"
              value={senha} onChangeText={setSenha} error={erros.senha} secure inputRef={senhaRef}
              returnKeyType="done" onSubmitEditing={entrar}
            />

            {!!erroGeral && <Text style={styles.erroGeral}>{erroGeral}</Text>}

            <Button variant="dark" title={enviando ? undefined : 'Entrar'} onPress={entrar} disabled={enviando}
              textStyle={styles.btnText} style={styles.btnEntrar}>
              {enviando && <ActivityIndicator color="#FFFFFF" />}
            </Button>
          </View>

          {/* Divisor "ou" */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.line} />
          </View>

          <Pressable style={({ pressed }) => [styles.btnCriar, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.btnCriarText}>Criar conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const NAVY = '#282B49';
const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF4E3' },
  screen: { flex: 1, backgroundColor: '#F1F3F9' },
  scroll: { flexGrow: 1, alignItems: 'center' },
  container: { flex: 1, width: '100%', maxWidth: 420, backgroundColor: '#FFF4E3', paddingHorizontal: 40, paddingBottom: 30 },
  logo: { width: 240, height: 240, marginTop: -50, marginBottom: -70, marginLeft: -50 },
  title: { fontFamily: 'LibreBaskerville_700Bold', fontSize: 36, color: NAVY, marginTop: 8 },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: NAVY, width: 190, marginTop: 8, marginBottom: 28 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, marginHorizontal: -18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 14, elevation: 8,
  },
  gap: { marginTop: 14 },
  erroGeral: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#D14343', textAlign: 'center', marginTop: 12 },
  btnEntrar: { marginTop: 20, height: 54, borderRadius: 27, paddingVertical: 0 },
  btnText: { fontSize: 15, color: '#FFFFFF' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, marginHorizontal: -10 },
  line: { flex: 1, height: 1.5, backgroundColor: NAVY },
  dividerText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: NAVY, marginHorizontal: 12 },
  btnCriar: { height: 54, borderRadius: 27, borderWidth: 2, borderColor: NAVY, alignItems: 'center', justifyContent: 'center', marginHorizontal: -18 },
  btnCriarText: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: NAVY },
});
