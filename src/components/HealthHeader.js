import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HealthHeader({ title, subtitle, icon, onBack, overview = false }) {
  const navigation = useNavigation();
  return (
    <View style={[styles.wrap, overview && styles.overview]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.logoButton} accessibilityRole="button" accessibilityLabel="Ir para início">
          <Image source={require('../../assets/logo1.png')} style={styles.logo} resizeMode="contain" />
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Pressable onPress={() => navigation.navigate('Notificacoes')} style={styles.notification} accessibilityRole="button" accessibilityLabel="Notificações">
          <Ionicons name="notifications-outline" size={22} color="#FFF" />
        </Pressable>
      </View>
      {overview ? (
        <>
          <View style={styles.heroRow}>
            {icon ? <Image source={icon} style={styles.heroIcon} resizeMode="contain" /> : null}
            <View style={styles.heroCopy}>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#242A4D', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 18 },
  overview: { paddingBottom: 24 },
  headerRow: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoButton: { width: 62, height: 60, justifyContent: 'center' },
  logo: { width: 58, height: 58 },
  title: { position: 'absolute', left: 68, right: 68, textAlign: 'center', color: '#FFF', fontSize: 17, fontFamily: 'Poppins_700Bold' },
  notification: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  heroRow: { marginTop: 16, flexDirection: 'row', alignItems: 'center' },
  heroIcon: { width: 66, height: 66, marginRight: 14 },
  heroCopy: { flex: 1 },
  subtitle: { color: '#E4E7F1', fontSize: 12, lineHeight: 17, fontFamily: 'Poppins_400Regular' },
});
