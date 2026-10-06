import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ITEM_WIDTH = 56;

export default function NumberWheelPicker({ min = 1, max = 120, value = 1, onChange }) {
  const scrollViewRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  // O input controla o valor e a roleta desliza até ele sem atualizar valores intermediários.
  useEffect(() => {
    if (!viewportWidth) return;
    const offset = Math.max(0, (value - min) * ITEM_WIDTH);
    scrollViewRef.current?.scrollTo({ x: offset, animated: true });
  }, [value, min, viewportWidth]);

  const selecionarFimDoMovimento = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const selected = Math.min(max, Math.max(min, min + Math.round(offset / ITEM_WIDTH)));
    if (selected !== value) onChange?.(selected);
  };

  const sidePadding = Math.max(0, (viewportWidth - ITEM_WIDTH) / 2);

  return (
    <View style={styles.container} onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        onMomentumScrollEnd={selecionarFimDoMovimento}
      >
        {Array.from({ length: max - min + 1 }, (_, index) => {
          const number = min + index;
          const selected = number === value;
          return (
            <View key={number} style={styles.item}>
              <Text style={selected ? styles.activeNumber : styles.sideNumber}>{number}</Text>
              {selected && <Text style={styles.arrow}>▲</Text>}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 68, justifyContent: 'center', overflow: 'hidden' },
  item: { width: ITEM_WIDTH, height: 58, alignItems: 'center', justifyContent: 'center' },
  sideNumber: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#000000', opacity: 0.3 },
  activeNumber: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: '#000000' },
  arrow: { fontSize: 10, color: '#FF751F', marginTop: -2 },
});
