import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const BLOOD_SCREEN_BACKGROUND = require('../../assets/blood_screen_background.png');

export default function BloodRiverBackground() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <Image
        source={BLOOD_SCREEN_BACKGROUND}
        resizeMode="cover"
        accessible={false}
        style={styles.artwork}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#FFF7E9',
  },
  artwork: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '125%',
    left: '-15%',
  },
});
