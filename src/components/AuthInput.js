
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ICON_SETS = { ion: Ionicons, mci: MaterialCommunityIcons };

export default function AuthInput({
  label, iconName, iconSet = 'ion', value, onChangeText, placeholder,
  secure = false, error, compact = false, onPress, style, inputRef, onSubmitEditing, returnKeyType,
  ...rest
}) {

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const Icon = ICON_SETS[iconSet];
  const size = compact ? 17 : 22;

  const conteudo = (
    <View style={[styles.field, compact && styles.fieldCompact, !!error && styles.fieldError]}>
      {!!iconName && <Icon name={iconName} size={size} color="#282B49" style={styles.icon} />}

      {onPress ? (
  
        <Text numberOfLines={1} style={[styles.input, compact && styles.inputCompact, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
      ) : (
        <TextInput
          ref={inputRef}
          style={[styles.input, compact && styles.inputCompact]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B6F80"
          secureTextEntry={secure && !mostrarSenha}
          autoCapitalize={secure ? 'none' : rest.autoCapitalize}
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          {...rest}
        />
      )}

      {secure && (
        <Pressable onPress={() => setMostrarSenha((v) => !v)} hitSlop={10}
          accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
          <Ionicons name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'} size={size} color="#282B49" />
        </Pressable>
      )}
      {!!onPress && <Ionicons name="chevron-down" size={size - 2} color="#282B49" />}
    </View>
  );

  return (
    <View style={[styles.wrapper, style]}>
      {!!label && <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>}
      {onPress ? <Pressable onPress={onPress}>{conteudo}</Pressable> : conteudo}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  label: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#4A4A4A', marginBottom: 6, marginLeft: 8 },
  labelCompact: { fontSize: 11, marginBottom: 3, marginLeft: 4 },
  field: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8',
    borderRadius: 26, paddingHorizontal: 16, height: 52, borderWidth: 1.5, borderColor: 'transparent',
  },
  fieldCompact: { height: 40, borderRadius: 20, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  fieldError: { borderColor: '#D14343' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#282B49', paddingVertical: 0, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  inputCompact: { fontSize: 11 },
  placeholder: { color: '#6B6F80' },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#D14343', marginTop: 3, marginLeft: 10 },
});
