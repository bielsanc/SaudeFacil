import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ITEM_HEIGHT = 10; // Espaçamento entre cada traço

export default function HeightRuler({ min = 50, max = 220, value = 50, onChange }) {
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const offset = Math.max(0, (value - min) * ITEM_HEIGHT);
    scrollViewRef.current?.scrollTo({ y: offset, animated: true });
  }, [value, min]);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const calculatedValue = Math.round(offsetY / ITEM_HEIGHT) + min;
    
    if (calculatedValue >= min && calculatedValue <= max && calculatedValue !== value) {
      onChange(calculatedValue);
    }
  };

  return (
    <View style={styles.container}>
      {/* Indicador Laranja e Valor Atual Fixo no Centro */}
      <View style={styles.indicatorContainer} pointerEvents="none">
        <Text style={styles.arrow}>►</Text>
        <Text style={styles.activeValueText}>{value}</Text>
      </View>

      {/* Régua Rolável */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: max - min + 1 }, (_, i) => {
          const currentVal = min + i;
          const isMajorTick = currentVal % 10 === 0;
          const isMediumTick = currentVal % 5 === 0;

          return (
            <View key={currentVal} style={styles.tickRow}>
              {isMajorTick && (
                <Text style={styles.tickLabel}>{currentVal}</Text>
              )}
              <View
                style={[
                  styles.tick,
                  isMajorTick ? styles.majorTick : isMediumTick ? styles.mediumTick : styles.smallTick,
                ]}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300, // Define altura limite fixa para o scroll funcionar
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    top: '50%',
    left: 10,
    marginTop: -14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  arrow: {
    fontSize: 14,
    color: '#FF751F',
    marginRight: 4,
  },
  activeValueText: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#000000',
  },
  scrollContent: {
    paddingVertical: 145, // Espaçamento para o primeiro/último valor alinharem ao centro
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: ITEM_HEIGHT,
    paddingRight: 16,
  },
  tickLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginRight: 8,
    fontFamily: 'Poppins_400Regular',
  },
  tick: {
    backgroundColor: '#C7C7CC',
    borderRadius: 1,
  },
  smallTick: {
    width: 10,
    height: 1,
  },
  mediumTick: {
    width: 16,
    height: 1.5,
  },
  majorTick: {
    width: 24,
    height: 2,
    backgroundColor: '#2C2C2E',
  },
});
