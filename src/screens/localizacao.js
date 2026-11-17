import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import AppNavigation from '../components/AppNavigation';
import Button from '../components/Button';
import UBSMap from '../components/UBSMap';
import { api } from '../services/api';

const INITIAL_REGION = { latitude: -14.235, longitude: -51.9253, latitudeDelta: 28, longitudeDelta: 28 };

export default function LocalizacaoScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });
  const [coords, setCoords] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const buscarUnidades = useCallback(async (position) => {
    setLoadingUnits(true);
    setError('');
    try {
      const response = await api.get('/ubs', { params: { latitude: position.latitude, longitude: position.longitude } });
      setUnidades(response.data.unidades || []);
      if (!response.data.unidades?.length) setError('Nenhuma unidade encontrada em um raio de 5 km.');
    } catch {
      setError('Não foi possível carregar as UBS próximas. Confira a conexão e tente novamente.');
    } finally {
      setLoadingUnits(false);
    }
  }, []);

  const localizar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Permita o acesso à localização para encontrar unidades perto de você.');
        return;
      }
      const lastPosition = await Location.getLastKnownPositionAsync({ maxAge: 120000 });
      const position = lastPosition || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const currentCoords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoords(currentCoords);
      await buscarUnidades(currentCoords);
    } catch {
      setError('Não foi possível obter sua localização. Verifique o GPS e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [buscarUnidades]);

  useEffect(() => { localizar(); }, [localizar]);

  if (!fontsLoaded) {
    return <SafeAreaView style={styles.container}><ActivityIndicator color="#238BC4" /></SafeAreaView>;
  }

  const abrirRota = async (unidade) => {
    const destination = `${unidade.latitude},${unidade.longitude}`;
    try {
      await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`);
    } catch {
      setError('Não foi possível abrir o Google Maps neste dispositivo.');
    }
  };

  const statusHasError = Boolean(error && unidades.length === 0);
  const statusIsWarning = Boolean(error && unidades.length > 0);
  const statusMessage = loading
    ? 'Localizando você...'
    : loadingUnits
      ? 'Buscando UBS próximas...'
      : unidades.length
        ? error ? `${unidades.length} UBS carregadas · busca atual indisponível` : `${unidades.length} UBS próximas encontradas`
        : error || 'Nenhuma UBS encontrada por perto.';

  return (
    <SafeAreaView style={styles.container}>
      <Header title="UBS próximas" icon={require('../../assets/susLogo.png')} variant="light" leftIcon="home" onGoBack={() => navigation.navigate('Home')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Encontre atendimento perto de você</Text>
        <Text style={styles.intro}>O mapa mostra sua posição e unidades de saúde mapeadas ao seu redor.</Text>

        <View style={styles.mapCard}>
          <UBSMap coords={coords} unidades={unidades} />
          <View style={styles.mapLegend}><Ionicons name="medical" size={15} color="#238BC4" /><Text style={styles.mapLegendText}>UBS</Text><View style={styles.legendDot} /><Text style={styles.mapLegendText}>Você</Text></View>
        </View>

        <View style={[styles.statusRow, statusHasError && styles.statusRowError, statusIsWarning && styles.statusRowWarning]}>
          {loading || loadingUnits ? <ActivityIndicator size="small" color="#238BC4" /> : <Ionicons name={statusHasError || statusIsWarning ? 'alert-circle-outline' : 'checkmark-circle-outline'} size={19} color={statusHasError ? '#A54141' : statusIsWarning ? '#A67624' : '#21845B'} />}
          <Text style={[styles.statusText, statusHasError && styles.error, statusIsWarning && styles.warning]}>{statusMessage}</Text>
        </View>

        <Button title={loading || loadingUnits ? 'Atualizando...' : 'Atualizar localização'} onPress={localizar}
          variant="dark" icon="locate-outline" iconSize={20} style={styles.action} />

        {unidades.length > 0 ? (
          <View style={styles.listHeadingRow}>
            <Text style={styles.listHeading}>Unidades próximas</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>{unidades.length}</Text></View>
          </View>
        ) : null}

        {unidades.map((unidade) => (
          <View key={String(unidade.id)} style={styles.unitCard}>
            <View style={styles.unitIcon}><Ionicons name="medical" size={18} color="#238BC4" /></View>
            <View style={styles.unitText}>
              <Text style={styles.unitTitle}>{unidade.nome}</Text>
              <Text style={styles.unitAddress}>{unidade.endereco || 'Endereço não informado'}</Text>
              {unidade.distanciaKm != null ? <View style={styles.distancePill}><Text style={styles.distance}>{unidade.distanciaKm} km de você</Text></View> : null}
            </View>
            <Pressable onPress={() => abrirRota(unidade)} style={styles.routeButton} accessibilityRole="link" accessibilityLabel={`Abrir rota para ${unidade.nome} no Google Maps`}>
              <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
              <Text style={styles.routeButtonText}>Rota</Text>
            </Pressable>
          </View>
        ))}
        <Text style={styles.note}>Os dados das unidades vêm do OpenStreetMap e podem estar incompletos. Toque em uma unidade no mapa ou em “Rota” para abrir a navegação.</Text>
      </ScrollView>
      <AppNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F3ED' },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 120 },
  heading: { color: '#262A3B', fontSize: 22, lineHeight: 30, fontFamily: 'Poppins_700Bold' },
  intro: { color: '#687080', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 16, fontFamily: 'Poppins_400Regular' },
  mapCard: { height: 292, overflow: 'hidden', backgroundColor: '#FFFFFF', borderColor: '#E3E8EA', borderWidth: 1, borderRadius: 24, marginBottom: 13, elevation: 2, shadowColor: '#262A3B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 9 },
  mapLegend: { position: 'absolute', right: 12, top: 12, backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#E7ECEF', borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5, elevation: 2 },
  mapLegendText: { color: '#30364A', fontSize: 10, fontFamily: 'Poppins_500Medium' },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginLeft: 5, backgroundColor: '#4285F4' },
  statusRow: { minHeight: 42, borderRadius: 14, borderWidth: 1, borderColor: '#E5EBE8', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 9 },
  statusRowError: { borderColor: '#F1DDDA', backgroundColor: '#FFF9F8' },
  statusRowWarning: { borderColor: '#EEE4CD', backgroundColor: '#FFFCF5' },
  statusText: { flex: 1, color: '#397358', fontSize: 11, lineHeight: 16, fontFamily: 'Poppins_500Medium' },
  error: { color: '#A54141' },
  warning: { color: '#866523' },
  action: { marginTop: 14, marginBottom: 8, minHeight: 52, borderRadius: 16, flexDirection: 'row', elevation: 2, shadowColor: '#262A3B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 6 },
  listHeadingRow: { marginTop: 9, marginBottom: 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
  listHeading: { color: '#262A3B', fontSize: 15, fontFamily: 'Poppins_700Bold' },
  countBadge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, backgroundColor: '#DCEFF7', alignItems: 'center', justifyContent: 'center' },
  countBadgeText: { color: '#12699B', fontSize: 10, fontFamily: 'Poppins_700Bold' },
  unitCard: { marginTop: 9, padding: 13, borderRadius: 19, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAECE8', flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#262A3B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.055, shadowRadius: 6 },
  unitIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#E9F4F7', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  unitText: { flex: 1, minWidth: 0 },
  unitTitle: { color: '#262A3B', fontSize: 12, lineHeight: 17, fontFamily: 'Poppins_700Bold' },
  unitAddress: { color: '#737B88', fontSize: 10, lineHeight: 15, marginTop: 3, fontFamily: 'Poppins_400Regular' },
  distancePill: { alignSelf: 'flex-start', marginTop: 6, borderRadius: 8, backgroundColor: '#EAF5F8', paddingHorizontal: 7, paddingVertical: 3 },
  distance: { color: '#17759E', fontSize: 9, fontFamily: 'Poppins_500Medium' },
  routeButton: { minHeight: 40, borderRadius: 13, paddingHorizontal: 12, marginLeft: 8, backgroundColor: '#238BC4', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  routeButtonText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Poppins_700Bold' },
  note: { color: '#77808B', fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 16, fontFamily: 'Poppins_400Regular' },
});
