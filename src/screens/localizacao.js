import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

export default function LocalizacaoScreen({ navigation }) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const localizar = async () => {
    setLoading(true);
    setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Permita o acesso à localização para encontrar unidades perto de você.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords(position.coords);
    } catch (e) {
      setError('Não foi possível obter sua localização. Verifique o GPS e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { localizar(); }, []);

  const abrirMaps = () => {
    if (!coords) return;
    const { latitude, longitude } = coords;
    Linking.openURL(`https://www.google.com/maps/search/UBS/@${latitude},${longitude},14z`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="UBS próximas" icon={require('../../assets/susLogo.png')} variant="light" onGoBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Encontre atendimento perto de você</Text>
        <Text style={styles.intro}>Use sua localização para pesquisar Unidades Básicas de Saúde no Google Maps.</Text>

        <View style={styles.mapCard}>
          <View style={styles.mapCanvas}>
            <View style={[styles.road, styles.roadOne]} />
            <View style={[styles.road, styles.roadTwo]} />
            <View style={[styles.road, styles.roadThree]} />
            <View style={[styles.park, styles.parkOne]} />
            <View style={[styles.park, styles.parkTwo]} />
            <View style={[styles.marker, styles.markerOne]}><Ionicons name="medical" size={15} color="#FFFFFF" /></View>
            <View style={[styles.marker, styles.markerTwo]}><Ionicons name="medical" size={15} color="#FFFFFF" /></View>
            <View style={styles.youMarker}><Ionicons name="navigate" size={18} color="#FFFFFF" /></View>
            <View style={styles.mapLabel}><Ionicons name="location" size={15} color="#238BC4" /><Text style={styles.mapLabelText}>{coords ? 'Sua região' : 'Mapa da sua região'}</Text></View>
          </View>
          <View style={styles.mapFooter}><Ionicons name="location-outline" size={17} color="#238BC4" /><Text style={styles.mapFooterText}>{coords ? 'Localização encontrada' : 'Aguardando localização'}</Text></View>
        </View>

        <Card variant="surface" style={styles.locationCard}>
          <View style={styles.locationIcon}><Ionicons name="navigate" size={20} color="#238BC4" /></View>
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>Sua localização</Text>
            {loading ? <ActivityIndicator size="small" color="#238BC4" /> : coords ? (
              <Text style={styles.coordinates}>{coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}</Text>
            ) : <Text style={styles.error}>{error}</Text>}
          </View>
        </Card>

        <Button title={loading ? 'Localizando...' : 'Buscar UBS no Google Maps'} onPress={coords ? abrirMaps : localizar}
          variant="dark" icon={coords ? 'map-outline' : 'locate-outline'} iconSize={20} style={styles.action} />
        <Text style={styles.note}>No Maps, pesquise “UBS” para ver unidades próximas e conferir endereço e rota.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8E4D9' },
  content: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 36 },
  heading: { color: '#262A3B', fontSize: 21, fontFamily: 'Poppins_700Bold' },
  intro: { color: '#626776', fontSize: 12, lineHeight: 19, marginTop: 5, marginBottom: 18, fontFamily: 'Poppins_400Regular' },
  mapCard: { overflow: 'hidden', backgroundColor: '#FFFFFF', borderRadius: 22, marginBottom: 16, elevation: 3, shadowColor: '#1E2136', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  mapCanvas: { height: 260, backgroundColor: '#E9E7DF', overflow: 'hidden' },
  road: { position: 'absolute', backgroundColor: '#FFFFFF', borderColor: '#DCD9D0', borderWidth: 1 },
  roadOne: { width: 520, height: 29, top: 105, left: -40, transform: [{ rotate: '-28deg' }] },
  roadTwo: { width: 440, height: 23, top: 155, left: -70, transform: [{ rotate: '48deg' }] },
  roadThree: { width: 390, height: 18, top: 35, left: 25, transform: [{ rotate: '65deg' }] },
  park: { position: 'absolute', backgroundColor: '#C8DFC2', borderRadius: 14 },
  parkOne: { width: 88, height: 62, top: 18, left: 18, transform: [{ rotate: '-15deg' }] },
  parkTwo: { width: 95, height: 56, bottom: 18, right: 16, transform: [{ rotate: '-20deg' }] },
  marker: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#238BC4', alignItems: 'center', justifyContent: 'center', position: 'absolute', elevation: 4 },
  markerOne: { top: 52, right: 64 }, markerTwo: { bottom: 45, left: 66 },
  youMarker: { width: 44, height: 44, borderRadius: 23, backgroundColor: '#D90808', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 113, left: '48%', elevation: 5 },
  mapLabel: { position: 'absolute', top: 12, right: 12, backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' },
  mapLabelText: { color: '#262A3B', fontSize: 10, marginLeft: 3, fontFamily: 'Poppins_500Medium' },
  mapFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 13 },
  mapFooterText: { color: '#626776', fontSize: 11, marginLeft: 7, fontFamily: 'Poppins_500Medium' },
  locationCard: { minHeight: 76, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center' },
  locationIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#E7F3F8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  locationText: { flex: 1 }, locationTitle: { color: '#262A3B', fontSize: 12, fontFamily: 'Poppins_500Medium' },
  coordinates: { color: '#687080', fontSize: 11, marginTop: 3, fontFamily: 'Poppins_400Regular' },
  error: { color: '#A54141', fontSize: 10, lineHeight: 15, marginTop: 3, fontFamily: 'Poppins_400Regular' },
  action: { marginTop: 18, flexDirection: 'row' },
  note: { color: '#737887', fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 10, fontFamily: 'Poppins_400Regular' },
});
