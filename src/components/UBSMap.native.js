import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';

const INITIAL_REGION = { latitude: -14.235, longitude: -51.9253, latitudeDelta: 28, longitudeDelta: 28 };

export default function UBSMap({ coords, unidades }) {
  const points = [...(coords ? [coords] : []), ...unidades.map(({ latitude, longitude }) => ({ latitude, longitude }))];
  const region = points.length
    ? {
        latitude: (Math.min(...points.map((point) => point.latitude)) + Math.max(...points.map((point) => point.latitude))) / 2,
        longitude: (Math.min(...points.map((point) => point.longitude)) + Math.max(...points.map((point) => point.longitude))) / 2,
        latitudeDelta: Math.max((Math.max(...points.map((point) => point.latitude)) - Math.min(...points.map((point) => point.latitude))) * 1.6, 0.012),
        longitudeDelta: Math.max((Math.max(...points.map((point) => point.longitude)) - Math.min(...points.map((point) => point.longitude))) * 1.6, 0.012),
      }
    : INITIAL_REGION;
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={region}
      region={coords ? region : undefined}
      showsUserLocation={Boolean(coords)}
      showsMyLocationButton={Boolean(coords)}
      showsCompass
      loadingEnabled
    >
      {unidades.map((unidade) => (
        <Marker
          key={String(unidade.id)}
          coordinate={{ latitude: unidade.latitude, longitude: unidade.longitude }}
          onCalloutPress={() => {
            const destination = `${unidade.latitude},${unidade.longitude}`;
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`);
          }}
          pinColor="#238BC4"
        >
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{unidade.nome}</Text>
              {unidade.endereco ? <Text style={styles.calloutDetails}>{unidade.endereco}</Text> : null}
              {unidade.distanciaKm != null ? <Text style={styles.calloutDetails}>{unidade.distanciaKm} km de você</Text> : null}
              <Text style={styles.calloutLink}>Abrir rota no Google Maps</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  callout: { minWidth: 180, maxWidth: 260, padding: 4 },
  calloutTitle: { color: '#262A3B', fontSize: 13, fontFamily: 'Poppins_700Bold' },
  calloutDetails: { marginTop: 3, color: '#626776', fontSize: 11, fontFamily: 'Poppins_400Regular' },
  calloutLink: { marginTop: 7, color: '#238BC4', fontSize: 11, fontFamily: 'Poppins_500Medium' },
});
