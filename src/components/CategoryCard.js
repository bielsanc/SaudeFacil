import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';

export default function CategoryCard({ title, icon, onPress }) {
  return (
    <Card
      variant="category"
      style={styles.card}
      pressedStyle={styles.cardPressed}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.icon} />
      </View>

      <Text 
        style={styles.title} 
        numberOfLines={2}
        adjustsFontSizeToFit={true} // Diminui o texto automaticamente em telas pequenas
        minimumFontScale={0.75}    // Permite diminuir até 75% do tamanho original antes de quebrar
      >
        {title}
      </Text>

      <View style={styles.arrowIcon}>
        <Ionicons name="chevron-forward" size={12} color="#8A8F9E" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31%',
    paddingVertical: 10,
    paddingLeft: 5,
    paddingRight: 14, // Espaço reservado para a seta no canto
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    height: 70,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    width: 30, // Reduzido levemente para dar mais espaço ao texto
    height: 30,
    borderRadius: 15,
    backgroundColor: '#262A3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  title: {
    flex: 1,
    fontSize: 10,
    lineHeight: 12,
    color: '#262A3B',
    textAlign: 'left',
    fontFamily: 'Poppins_500Medium',
  },
  arrowIcon: {
    position: 'absolute',
    bottom: 6,
    right: 4,
  },
});
