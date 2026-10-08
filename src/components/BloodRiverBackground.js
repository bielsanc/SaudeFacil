import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { LinearGradient, Path, Rect, Defs, Stop } from 'react-native-svg';

import BloodFlowAnimation from './BloodFlowAnimation';

// Fundo decorativo da tela de Sangue.
// O rio aparece apenas no canto superior direito, pequeno e atrás do conteúdo.
// A bolsa decorativa foi removida: a única bolsa continua sendo a do header.
export default function BloodRiverBackground() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  // Escala pensada para o viewport mobile da referência (aprox. 393 px de largura).
  // Mantemos o canvas completo em proporção 1024:1536 e recortamos somente a parte
  // superior onde o rio forma o "S" desejado.
  const riverWidth = Math.min(Math.max(size.width * 0.64, 205), 255);
  const riverHeight = riverWidth * (1536 / 1024);
  const riverFrameHeight = Math.min(235, Math.max(180, size.height * 0.27));
  const riverTop = 58;
  const riverRight = -8;
  const riverOffsetY = -4;

  return (
    <View pointerEvents="none" style={styles.root} onLayout={onLayout}>
      {size.width > 0 && (
        <>
          <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Path
              d={`M0 118 C${size.width * 0.18} 76 ${size.width * 0.38} 70 ${size.width * 0.56} 89 C${size.width * 0.69} 102 ${size.width * 0.71} 134 ${size.width * 0.62} 161 C${size.width * 0.52} 188 ${size.width * 0.40} 201 ${size.width * 0.43} 226 C${size.width * 0.47} 261 ${size.width * 0.68} 276 ${size.width * 0.73} 314 C${size.width * 0.77} 346 ${size.width * 0.65} 372 ${size.width * 0.50} 390 C${size.width * 0.38} 405 ${size.width * 0.24} 402 ${size.width * 0.12} 382 C${size.width * 0.02} 364 0 332 0 300 Z`}
              fill="#F5E7D0"
              opacity={0.9}
            />
            <Defs>
              <LinearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFF7E9" stopOpacity="0" />
                <Stop offset="1" stopColor="#FFF7E9" stopOpacity="0.98" />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={size.height * 0.68} width={size.width} height={size.height * 0.32} fill="url(#bottomFade)" />
          </Svg>

          <View
            style={[
              styles.riverFrame,
              {
                width: riverWidth,
                height: riverFrameHeight,
                top: riverTop,
                right: riverRight,
              },
            ]}
          >
            <View
              style={[
                styles.riverCanvas,
                {
                  width: riverWidth,
                  height: riverHeight,
                  top: riverOffsetY,
                },
              ]}
            >
              <BloodFlowAnimation style={{ width: riverWidth, height: riverHeight }} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  riverFrame: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 0,
  },
  riverCanvas: {
    position: 'absolute',
    left: 0,
  },
});
