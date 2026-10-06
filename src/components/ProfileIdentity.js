import React, { useState } from 'react';
import { View, Text, TextInput, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PhotoPickerSheet from './PhotoPickerSheet';
import Button from './Button';

const PLACEHOLDER_AVATAR = require('../../assets/pessoaIcon.png');
const AVATAR_SIZE = 128;

export default function ProfileIdentity({ photoUri, onChangePhoto, name, setName, email, setEmail }) {
  const [sheetVisible, setSheetVisible] = useState(false);

  const tirarFoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permissão negada', 'É necessário permitir o acesso à câmera para tirar uma foto.');
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) onChangePhoto(result.assets[0].uri);
  };

  const escolherGaleria = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria para escolher uma foto.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) onChangePhoto(result.assets[0].uri);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
          <Image source={photoUri ? { uri: photoUri } : PLACEHOLDER_AVATAR} style={photoUri ? styles.avatarPhoto : styles.avatarPlaceholder} />
        </View>
        <Button variant="camera" onPress={() => setSheetVisible(true)} icon="camera" iconSize={16} color="#FFFFFF" style={styles.cameraBadge} />
      </View>

      <View style={styles.identityBlock}>
        <TextInput style={styles.nameInput} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#9A9FAE" textAlign="center" />
        <TextInput style={styles.emailInput} value={email} onChangeText={setEmail} placeholder="seuemail@exemplo.com" placeholderTextColor="#B3B7C2" keyboardType="email-address" autoCapitalize="none" textAlign="center" />
      </View>

      <PhotoPickerSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onTirarFoto={tirarFoto} onEscolherGaleria={escolherGaleria} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#F4F1EA' },
  avatarWrapper: { alignItems: 'center', marginTop: -(AVATAR_SIZE / 2) - 6, zIndex: 6 },
  avatarRing: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: '#F4F1EA', padding: 5, shadowColor: '#1E2136', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 6 },
  avatarPhoto: { width: '100%', height: '100%', borderRadius: AVATAR_SIZE / 2, resizeMode: 'cover' },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: AVATAR_SIZE / 2, backgroundColor: '#EFECE1', resizeMode: 'contain', padding: 18 },
  cameraBadge: { position: 'absolute', bottom: 2, right: '32%' },
  identityBlock: { alignItems: 'center', marginTop: 10, paddingHorizontal: 24 },
  nameInput: { width: '100%', fontSize: 19, color: '#262A3B', fontFamily: 'Poppins_700Bold', padding: 0, textAlign: 'center' },
  emailInput: { width: '100%', fontSize: 13, color: '#8A8F9E', fontFamily: 'Poppins_400Regular', marginTop: 2, padding: 0, textAlign: 'center' },
});
