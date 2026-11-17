import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import Header from '../components/Header';
import AppNavigation from '../components/AppNavigation';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function AlergiaScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });
  const { user, updateUser } = useAuth();
  const [alergias, setAlergias] = useState(user?.alergias || '');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [falha, setFalha] = useState(false);

  useEffect(() => {
    setAlergias(user?.alergias || '');
  }, [user?.alergias]);

  const salvar = async () => {
    setSalvando(true);
    setMensagem('');
    setFalha(false);
    try {
      await updateUser({ alergias: alergias.trim() });
      setMensagem('Alergias atualizadas com sucesso.');
    } catch {
      setFalha(true);
      setMensagem('Não foi possível salvar agora. Confira sua conexão e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (!fontsLoaded) return <SafeAreaView style={styles.loading}><ActivityIndicator color="#238BC4" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Alergia" icon={require('../../assets/alergia.png')} variant="light" leftIcon="home" onGoBack={() => navigation.navigate('Home')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Suas alergias</Text>
        <Text style={styles.description}>As informações preenchidas no cadastro aparecem aqui e podem ser atualizadas quando precisar.</Text>

        {!alergias.trim() ? (
          <View style={styles.emptyNotice}>
            <View style={styles.noticeIcon}><Ionicons name="information-circle-outline" size={21} color="#238BC4" /></View>
            <Text style={styles.noticeText}>Você ainda não informou alergias. Se não tiver nenhuma conhecida, pode deixar o campo vazio.</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Ionicons name="medical-outline" size={18} color="#238BC4" />
            <Text style={styles.label}>Alergias conhecidas</Text>
          </View>
          <TextInput
            value={alergias}
            onChangeText={(value) => { setAlergias(value); setMensagem(''); }}
            style={styles.input}
            placeholder="Ex.: dipirona, amendoim, látex..."
            placeholderTextColor="#85899A"
            multiline
            textAlignVertical="top"
            maxLength={500}
            autoCapitalize="sentences"
            accessibilityLabel="Alergias conhecidas"
          />
          <View style={styles.fieldFooter}>
            <Text style={styles.hint}>Medicamentos, alimentos ou outras alergias.</Text>
            <Text style={styles.counter}>{alergias.length}/500</Text>
          </View>
        </View>

        {!!mensagem ? <Text style={[styles.feedback, falha && styles.feedbackError]}>{mensagem}</Text> : null}
        <Button title={salvando ? 'Salvando...' : 'Salvar informações'} variant="dark" icon={salvando ? undefined : 'checkmark-circle-outline'}
          onPress={salvar} disabled={salvando} style={styles.saveButton}>
          {salvando ? <ActivityIndicator color="#FFFFFF" /> : null}
        </Button>
        <Text style={styles.footnote}>Essas informações ficam vinculadas ao seu perfil.</Text>
      </ScrollView>
      <AppNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F3ED' },
  screen: { flex: 1, backgroundColor: '#F4F3ED' },
  content: { paddingHorizontal: 18, paddingTop: 23, paddingBottom: 120 },
  title: { color: '#262A3B', fontSize: 22, fontFamily: 'Poppins_700Bold' },
  description: { color: '#687080', fontSize: 12, lineHeight: 19, marginTop: 5, marginBottom: 18, fontFamily: 'Poppins_400Regular' },
  emptyNotice: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 16, borderWidth: 1, borderColor: '#DCEBF0', backgroundColor: '#F1FAFC', marginBottom: 12 },
  noticeIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#E2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  noticeText: { flex: 1, color: '#536577', fontSize: 11, lineHeight: 16, fontFamily: 'Poppins_400Regular' },
  card: { padding: 15, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EAE5', elevation: 1, shadowColor: '#262A3B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  label: { color: '#262A3B', fontSize: 13, fontFamily: 'Poppins_700Bold' },
  input: { minHeight: 120, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 10, color: '#262A3B', backgroundColor: '#F7F8F7', fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 19 },
  fieldFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  hint: { color: '#77808B', fontSize: 10, fontFamily: 'Poppins_400Regular' },
  counter: { color: '#89909B', fontSize: 10, fontFamily: 'Poppins_400Regular' },
  feedback: { color: '#21845B', fontSize: 11, marginTop: 12, textAlign: 'center', fontFamily: 'Poppins_500Medium' },
  feedbackError: { color: '#A54141' },
  saveButton: { minHeight: 52, marginTop: 16, borderRadius: 16, flexDirection: 'row' },
  footnote: { color: '#77808B', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 11, fontFamily: 'Poppins_400Regular' },
});
