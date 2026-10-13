import React from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FruitSearchInput({ value, onChangeText, placeholder = 'Digite o nome da fruta...' }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#0755B8" style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7390B5"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar informações de uma fruta"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#E7F0FB',
    paddingHorizontal: 12,
  },
  icon: { marginRight: 9 },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    color: '#355B88',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
});
