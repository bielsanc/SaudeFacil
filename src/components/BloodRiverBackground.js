import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import { BLOOD_CELLS } from './bloodCells';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 1536;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function MovingBloodCell({ cell, index, scale }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay((index % 8) * 115),
        Animated.timing(progress, {
          toValue: 1,
          duration: 2800 + (index % 5) * 260,
          easing: Easing.linear,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [index, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, cell.dx * scale] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, cell.dy * scale] });

  return (
    <Animated.Image
      source={cell.source}
      resizeMode="stretch"
      style={[
        styles.cell,
        {
          left: cell.left * scale,
          top: cell.top * scale,
          width: cell.width * scale,
          height: cell.height * scale,
          zIndex: cell.order,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    />
  );
}

export default function BloodRiverBackground() {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);
  const canvasWidth = CANVAS_WIDTH * scale;
  const canvasHeight = CANVAS_HEIGHT * scale;
  const canvasStyle = {
    width: canvasWidth,
    height: canvasHeight,
    left: (width - canvasWidth) / 2,
    top: (height - canvasHeight) / 2,
  };

  return (
    <View pointerEvents="none" style={styles.viewport}>
      <View style={[styles.canvas, canvasStyle]}>
        <Image source={require('../../assets/blood/vessel.png')} resizeMode="stretch" style={styles.vessel} />
        {BLOOD_CELLS.map((cell, index) => (
          <MovingBloodCell key={index} cell={cell} index={index} scale={scale} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  canvas: { position: 'absolute', overflow: 'hidden' },
  vessel: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  cell: { position: 'absolute' },
});
