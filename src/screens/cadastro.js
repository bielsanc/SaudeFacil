/**
 * cadastro.js — Tela de criação de conta.
 * Fluxo: preencher -> validar -> signUp() salva localmente (AsyncStorage)
 * -> o usuário já entra logado e o AppRouter mostra a Home.
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, Image, Pressable, ScrollView, Modal, KeyboardAvoidingView,
  Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { LibreBaskerville_700Bold } from '@expo-google-fonts/libre-baskerville';

import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import {
  emailValido, mascaraTelefone, mascaraData, parseData, paraNumero, TIPOS_SANGUINEOS,
} from '../utils/validacao';

export default function CadastroScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_700Bold, LibreBaskerville_700Bold });
  const { signUp } = useAuth();

  // Um único objeto guarda todos os campos; "set" atualiza só o campo informado.
  const [form, setForm] = useState({
    nome: '', email: '', peso: '', telefone: '', altura: '',
    nascimento: '', tipoSanguineo: '', senha: '', confirmar: '',
  });
  const set = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [seletorAberto, setSeletorAberto] = useState(false); // modal do tipo sanguíneo
  const refs = useRef({});                                    // para avançar de campo no teclado

  /** Valida todos os campos e devolve também os valores já normalizados. */
  const validar = () => {
    const e = {};
    const nome = form.nome.trim();

    if (nome.split(/\s+/).filter(Boolean).length < 2) e.nome = 'Digite nome e sobrenome.';
    if (!emailValido(form.email)) e.email = 'E-mail inválido.';

    const peso = paraNumero(form.peso);
    if (!(peso >= 2 && peso <= 500)) e.peso = 'Peso inválido (kg).';

    const tel = form.telefone.replace(/\D/g, '');
    if (tel.length < 10) e.telefone = 'Telefone inválido.';

    // Altura: aceita "1,65" (metros) ou "165" (centímetros) e converte tudo para cm.
    let altura = paraNumero(form.altura);
    if (altura > 0 && altura < 3) altura = altura * 100;
    if (!(altura >= 50 && altura <= 250)) e.altura = 'Altura inválida.';

    if (!parseData(form.nascimento)) e.nascimento = 'Data inválida.';
    if (!form.tipoSanguineo) e.tipoSanguineo = 'Escolha o tipo.';

    if (form.senha.length < 6) e.senha = 'Mínimo de 6 caracteres.';
    if (form.confirmar !== form.senha) e.confirmar = 'As senhas não coincidem.';

    setErros(e);
    return { ok: Object.keys(e).length === 0, peso, altura: Math.round(altura) };
  };

  const cadastrar = async () => {
    setErroGeral('');
    if (enviando) return;
    const { ok, peso, altura } = validar();
    if (!ok) return;

    setEnviando(true);
    try {
      await signUp({
        nome: form.nome.trim(),
        email: form.email,
        peso, altura,                       // números: kg e cm
        telefone: form.telefone,
        nascimento: form.nascimento,
        tipoSanguineo: form.tipoSanguineo,
        senha: form.senha,                  // o serviço transforma em hash antes de salvar
      });
      // Sucesso: o AppRouter detecta o "user" e troca para a Home.
    } catch (err) {
      if (err.message === 'EMAIL_EXISTENTE') {
        setErros((e) => ({ ...e, email: 'Este e-mail já está cadastrado.' }));
      } else {
        setErroGeral('Não foi possível criar a conta. Tente novamente.');
      }
      setEnviando(false);
    }
  };

  if (!fontsLoaded) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#FFF4E3" /></View>;
  }

  // Atalho para não repetir as props comuns de cada campo.
  const campo = (nome, extra) => ({
    compact: true, value: form[nome], onChangeText: set(nome), error: erros[nome],
    inputRef: (r) => { refs.current[nome] = r; }, ...extra,
  });
  const proximo = (nome) => ({ returnKeyType: 'next', onSubmitEditing: () => refs.current[nome]?.focus() });

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Image source={require('../../assets/logo1.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo pra começar a usar o app</Text>

          <View style={styles.card}>
            <AuthInput label="Nome completo" iconName="person" placeholder="Digite o seu nome"
              {...campo('nome', { autoCapitalize: 'words', ...proximo('email') })} />

            {/* Linhas com dois campos lado a lado */}
            <View style={styles.row}>
              <AuthInput style={styles.half} label="E-mail:" iconName="mail-outline" placeholder="Digite o seu e-mail"
                {...campo('email', { keyboardType: 'email-address', autoCapitalize: 'none', ...proximo('peso') })} />
              <AuthInput style={styles.half} label="Peso" iconName="dumbbell" iconSet="mci" placeholder="Peso (kg)"
                {...campo('peso', { keyboardType: 'decimal-pad', ...proximo('telefone') })} />
            </View>

            <View style={styles.row}>
              <AuthInput style={styles.half} label="Telefone" iconName="call" placeholder="Digite o seu telefone"
                {...campo('telefone', { keyboardType: 'phone-pad', onChangeText: (t) => set('telefone')(mascaraTelefone(t)), ...proximo('altura') })} />
              <AuthInput style={styles.half} label="Altura" iconName="human-male-height" iconSet="mci" placeholder="Ex.: 1,65"
                {...campo('altura', { keyboardType: 'decimal-pad', ...proximo('nascimento') })} />
            </View>

            <View style={styles.row}>
              <AuthInput style={styles.half} label="Data de Nascimento" iconName="calendar" placeholder="dd/mm/aaaa"
                {...campo('nascimento', { keyboardType: 'number-pad', onChangeText: (t) => set('nascimento')(mascaraData(t)), maxLength: 10 })} />
              {/* Campo "seletor": abre o modal com os tipos sanguíneos */}
              <AuthInput style={styles.half} label="Tipo sanguíneo" iconName="water" iconSet="mci"
                placeholder="Tipo sanguíneo" compact value={form.tipoSanguineo}
                error={erros.tipoSanguineo} onPress={() => setSeletorAberto(true)} />
            </View>

            <AuthInput style={styles.full} label="Senha" iconName="lock-closed" placeholder="Digite sua senha" secure
              {...campo('senha', proximo('confirmar'))} />
            <AuthInput style={styles.full} label="Confirmar senha" iconName="lock-closed" placeholder="Confirme sua senha" secure
              {...campo('confirmar', { returnKeyType: 'done', onSubmitEditing: cadastrar })} />

            {!!erroGeral && <Text style={styles.erroGeral}>{erroGeral}</Text>}

            <Button variant="dark" title={enviando ? undefined : 'Cadastrar'} onPress={cadastrar} disabled={enviando}
              textStyle={styles.btnText} style={styles.btn}>
              {enviando && <ActivityIndicator color="#FFFFFF" />}
            </Button>

            <Text style={styles.footer}>
              Já tem uma conta?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>Entrar</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de escolha do tipo sanguíneo */}
      <Modal visible={seletorAberto} transparent animationType="fade" onRequestClose={() => setSeletorAberto(false)}>
        <Pressable style={styles.overlay} onPress={() => setSeletorAberto(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Tipo sanguíneo</Text>
            <View style={styles.chips}>
              {TIPOS_SANGUINEOS.map((tipo) => {
                const ativo = form.tipoSanguineo === tipo;
                return (
                  <Pressable key={tipo} style={[styles.chip, ativo && styles.chipAtivo]}
                    onPress={() => { set('tipoSanguineo')(tipo); setSeletorAberto(false); }}>
                    <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>{tipo}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const NAVY = '#282B49';
const CREAM = '#FFF4E3';
const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: NAVY },
  screen: { flex: 1, backgroundColor: '#F1F3F9' },
  scroll: { flexGrow: 1, alignItems: 'center' },
  container: { flex: 1, width: '100%', maxWidth: 420, backgroundColor: NAVY, paddingHorizontal: 20, paddingBottom: 24 },
  logo: { width: 230, height: 230, marginTop: -40, marginBottom: -65, marginLeft: -45 },
  title: { fontFamily: 'LibreBaskerville_700Bold', fontSize: 36, color: '#F4F1EA', marginLeft: 6 },
  subtitle: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#F4F1EA', width: 200, marginLeft: 6, marginTop: 8, marginBottom: 20 },
  card: { backgroundColor: CREAM, borderRadius: 24, padding: 14, paddingBottom: 18 },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  half: { flex: 1, minWidth: 0 },
  full: { marginTop: 8 },
  erroGeral: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#D14343', textAlign: 'center', marginTop: 10 },
  btn: { alignSelf: 'center', width: 190, height: 54, borderRadius: 27, paddingVertical: 0, marginTop: 18 },
  btnText: { fontSize: 15, color: '#FFFFFF' },
  footer: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: NAVY, textAlign: 'center', marginTop: 8 },
  footerLink: { fontFamily: 'Poppins_700Bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 340, backgroundColor: CREAM, borderRadius: 24, padding: 20 },
  sheetTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: NAVY, marginBottom: 14, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  chip: { width: 64, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  chipAtivo: { backgroundColor: NAVY },
  chipText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: NAVY },
  chipTextAtivo: { color: '#FFFFFF' },
});
