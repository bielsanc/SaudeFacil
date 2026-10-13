import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FruitSearchInput({ value, onChangeText, onSubmitEditing, onSearch, placeholder = 'Digite o nome da fruta...' }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onSearch}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Buscar fruta"
        style={styles.searchButton}
      >
        <Ionicons name="search" size={20} color="#0755B8" />
      </Pressable>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
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
  searchButton: { marginRight: 9, justifyContent: 'center', alignItems: 'center' },
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
