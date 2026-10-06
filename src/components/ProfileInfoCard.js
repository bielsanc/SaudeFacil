import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Card from './Card';

function Field({ label, value, onChangeText, keyboardType, isLast }) {
  return (
    <View style={[styles.field, !isLast && styles.fieldSpacing]}>
      <Text style={styles.label}>{label}</Text>
      <Card variant="soft" style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          placeholderTextColor="#9A9FAE"
        />
      </Card>
    </View>
  );
}

export default function ProfileInfoCard({ fields }) {
  return (
    <Card variant="profile" style={styles.card}>
      {fields.map((item, index) => (
        <Field
          key={item.label}
          label={item.label}
          value={item.value}
          onChangeText={item.onChangeText}
          keyboardType={item.keyboardType}
          isLast={index === fields.length - 1}
        />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  field: {
    alignItems: 'center',
  },
  fieldSpacing: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#262A3B',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  inputBox: {
    width: '100%',
    backgroundColor: '#F4F1EA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 15,
    color: '#4A4E5C',
    fontFamily: 'Poppins_400Regular',
    padding: 0,
  },
});
