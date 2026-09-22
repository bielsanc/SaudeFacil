import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import WaveDivider from './DivOnda';
import PhotoPickerSheet from './PhotoPickerSheet';

const PLACEHOLDER_AVATAR = require('../../assets/pessoaIcon.png');

export default function ProfileHeader({
  onGoBack,
  photoUri,
  onChangePhoto,
  name,
  setName,
  email,
  setEmail,
}) {
  const [sheetVisible, setSheetVisible] = useState(false);

  const tirarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão negada',
        'É necessário permitir o acesso à câmera para tirar uma foto.'
      );
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      onChangePhoto(resultado.assets[0].uri);
    }
  };

  const escolherGaleria = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão negada',
        'É necessário permitir o acesso à galeria para escolher uma foto.'
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      onChangePhoto(resultado.assets[0].uri);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={require('../../assets/fundoProfile.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.topRow}>
          <Pressable
            onPress={onGoBack}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>

         

          <Pressable
            onPress={() =>
              Alert.alert('Sair da conta', 'Deseja realmente sair?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: () => console.log('Logout') },
              ])
            }
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={10}
          >
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.waveContainer}>
          <WaveDivider color="#F4F1EA" style={styles.wave} />
        </View>
      </ImageBackground>

      {/* Avatar sobrepondo a transição entre o header roxo e o conteúdo */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
          <Image
            source={photoUri ? { uri: photoUri } : PLACEHOLDER_AVATAR}
            style={photoUri ? styles.avatarPhoto : styles.avatarPlaceholder}
          />
        </View>

        <Pressable
          onPress={() => setSheetVisible(true)}
          style={({ pressed }) => [styles.cameraBadge, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Ionicons name="camera" size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.identityBlock}>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor="#9A9FAE"
          textAlign="center"
        />
        <TextInput
          style={styles.emailInput}
          value={email}
          onChangeText={setEmail}
          placeholder="seuemail@exemplo.com"
          placeholderTextColor="#B3B7C2"
          keyboardType="email-address"
          autoCapitalize="none"
          textAlign="center"
        />
      </View>

      <PhotoPickerSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onTirarFoto={tirarFoto}
        onEscolherGaleria={escolherGaleria}
      />
    </View>
  );
}

const AVATAR_SIZE = 128;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F4F1EA',
  },
  background: {
    paddingTop: 54,
    paddingBottom: 46,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(40, 43, 73, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  topTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
  },
  waveContainer: {
    position: 'absolute',
    bottom: -2,
    left: -1,
    right: -1,
    height: 46,
    zIndex: 1,
  },
  wave: {
    width: '100%',
    height: '100%',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -(AVATAR_SIZE / 2) - 6,
    zIndex: 6,
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#F4F1EA',
    padding: 5,
    shadowColor: '#1E2136',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#EFECE1',
    resizeMode: 'contain',
    padding: 18,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: '32%',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#282B49',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F4F1EA',
  },
  identityBlock: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 24,
  },
  nameInput: {
    fontSize: 19,
    color: '#262A3B',
    fontFamily: 'Poppins_700Bold',
    padding: 0,
    minWidth: 140,
  },
  emailInput: {
    fontSize: 13,
    color: '#8A8F9E',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
    padding: 0,
    minWidth: 160,
  },
});
