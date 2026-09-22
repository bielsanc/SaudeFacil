import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Modal reutilizável em formato de "bottom sheet" que sobe de baixo para cima.
 * Usado para escolher a origem de uma foto (câmera ou galeria), mas os
 * options são genéricos para poder ser reaproveitado em outras telas.
 */
export default function PhotoPickerSheet({
  visible,
  onClose,
  onTirarFoto,
  onEscolherGaleria,
  title = 'Foto de perfil',
  subtitle = 'Como você quer atualizar sua foto?',
}) {
  const translateY = useRef(new Animated.Value(320)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          mass: 0.9,
          stiffness: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const fechar = (callback) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 320,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose();
      callback && callback();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => fechar()}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => fechar()} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={() => fechar(onTirarFoto)}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#282B49' }]}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.optionTextGroup}>
              <Text style={styles.optionLabel}>Tirar foto</Text>
              <Text style={styles.optionHint}>Usar a câmera do aparelho</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#B3B7C2" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={() => fechar(onEscolherGaleria)}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#FF751F' }]}>
              <Ionicons name="image" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.optionTextGroup}>
              <Text style={styles.optionLabel}>Escolher da galeria</Text>
              <Text style={styles.optionHint}>Selecionar uma foto existente</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#B3B7C2" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.optionPressed]}
            onPress={() => fechar()}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(38, 42, 59, 0.55)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    paddingHorizontal: 20,
    shadowColor: '#1E2136',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E4E1D7',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    color: '#262A3B',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#8A8F9E',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F1EA',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextGroup: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    color: '#262A3B',
    fontFamily: 'Poppins_500Medium',
  },
  optionHint: {
    fontSize: 11,
    color: '#9A9FAE',
    fontFamily: 'Poppins_400Regular',
    marginTop: 1,
  },
  cancelBtn: {
    marginTop: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: '#D14343',
    fontFamily: 'Poppins_500Medium',
  },
});
