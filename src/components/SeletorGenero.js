import React, { useEffect, useRef } from 'react';
import { View, Pressable, Image, Animated, StyleSheet } from 'react-native';

function GenderAvatar({ source, selected, onPress }) {
  const scale = useRef(new Animated.Value(selected ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1 : 0.88,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [selected, scale]);

  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <Animated.View
        style={[
          styles.avatarWrap,
          { transform: [{ scale }] },
          selected && styles.avatarWrapSelected,
        ]}
      >
        <Image source={source} style={styles.avatar} />
      </Animated.View>
    </Pressable>
  );
}

export default function GenderSelector({ genero, setGenero }) {
  return (
    <View style={styles.row}>
      <GenderAvatar
        source={require('../../assets/homem.png')}
        selected={genero === 'masculino'}
        onPress={() => setGenero('masculino')}
      />
      <GenderAvatar
        source={require('../../assets/mulher.png')}
        selected={genero === 'feminino'}
        onPress={() => setGenero('feminino')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    opacity: 0.55,
  },
  avatarWrapSelected: {
    borderColor: '#FF751F',
    opacity: 1,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
