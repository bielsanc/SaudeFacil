import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, View } from 'react-native';

import { BLOOD_CELLS } from './bloodCells';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PATH_LENGTH,
  getPathAngle,
  getPathPoint,
  projectOnPath,
} from './bloodFlowPath';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const SAMPLES = 40;
const VESSEL = require('../../assets/vessel_clean.png');

// Pseudo-aleatorio deterministico (mesmo resultado em toda renderizacao).
const rand = (i, salt) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Cada hemacia anda apenas um trecho da curva ao redor da posicao original:
// as grandes (primeiro plano) andam menos e mais devagar, as pequenas mais.
const MAX_ROTATION = 22; // graus, limite da rotacao relativa
const MAX_OFFSET = 90; // px do canvas: distancia lateral maxima considerada ao girar em curvas

function buildRbcConfig(cell, index) {
  const area = cell.width * cell.height;
  const big = area > 40000;
  const medium = area > 8000;
  const window = big ? 0.05 : medium ? 0.09 : 0.13; // fracao da trajetoria
  const speed = (big ? 28 : medium ? 42 : 55) * (0.85 + rand(index, 1) * 0.3); // px/s no canvas
  // cell.cx / cell.cy (opcionais) = centro exato da hemacia no canvas 1024x1536;
  // sem eles usa o centro da caixa left/top/width/height.
  const centerX = cell.cx ?? cell.left + cell.width / 2;
  const centerY = cell.cy ?? cell.top + cell.height / 2;
  const p0 = projectOnPath(centerX, centerY);
  // v0: ponto da janela onde a hemacia comeca (a posicao original da arte).
  const v0 = p0 + window * 0.5 > 1 ? 0.85 : p0 - window * 0.5 < 0 ? 0.15 : 0.5;
  // deslocamento da hemacia em relacao ao eixo do vaso (limitado)
  const base = getPathPoint(p0);
  let ox = centerX - base.x;
  let oy = centerY - base.y;
  const len = Math.hypot(ox, oy);
  if (len > MAX_OFFSET) {
    ox = (ox / len) * MAX_OFFSET;
    oy = (oy / len) * MAX_OFFSET;
  }
  return {
    cell,
    window,
    p0,
    v0,
    ox,
    oy,
    duration: Math.round(((window * PATH_LENGTH) / speed) * 1000),
    lateralAmp: 2 + rand(index, 2) * 4, // poucos pixels, perpendicular a curva
    lateralPhase: rand(index, 3) * Math.PI * 2,
    scaleAmp: 0.015 + rand(index, 4) * 0.01,
    scalePhase: rand(index, 5) * Math.PI * 2,
    spin: 0.5 + rand(index, 6) * 0.3, // quanto da direcao da curva vira rotacao
  };
}

function RedBloodCell({ config, autoPlay }) {
  const { cell, window, p0, v0, ox, oy, duration, lateralAmp, lateralPhase, scaleAmp, scalePhase, spin } = config;
  const progress = useRef(new Animated.Value(v0)).current;

  const ranges = useMemo(() => {
    const base = getPathPoint(p0);
    const baseAngle = getPathAngle(p0);
    const input = [];
    const tx = [];
    const ty = [];
    const rot = [];
    const scl = [];
    let prevAngle = 0;
    for (let i = 0; i < SAMPLES; i += 1) {
      const v = i / (SAMPLES - 1);
      const u = Math.min(1, Math.max(0, p0 + (v - v0) * window));
      const pt = getPathPoint(u);
      const angle = getPathAngle(u);
      let rel = angle - baseAngle;
      while (rel - prevAngle > 180) rel -= 360;
      while (rel - prevAngle < -180) rel += 360;
      prevAngle = rel;
      const relRad = (rel * Math.PI) / 180;
      const rad = (angle * Math.PI) / 180;
      // a hemacia gira como corpo rigido em torno do eixo: continua na mesma
      // posicao lateral do vaso, mesmo nas curvas fechadas.
      const rotX = ox * Math.cos(relRad) - oy * Math.sin(relRad) - ox;
      const rotY = ox * Math.sin(relRad) + oy * Math.cos(relRad) - oy;
      // deslocamento lateral organico (pequeno), perpendicular a trajetoria
      const lateral = Math.sin(v * Math.PI * 2 + lateralPhase) * lateralAmp;
      input.push(v);
      tx.push(pt.x - base.x + rotX - Math.sin(rad) * lateral);
      ty.push(pt.y - base.y + rotY + Math.cos(rad) * lateral);
      // rotacao suave e limitada (sem mudancas bruscas)
      const smooth = MAX_ROTATION * Math.tanh((rel * spin) / MAX_ROTATION);
      rot.push(`${smooth.toFixed(2)}deg`);
      scl.push(1 + Math.sin(v * Math.PI * 2 + scalePhase) * scaleAmp);
    }
    return { input, tx, ty, rot, scl };
  }, [p0, v0, ox, oy, window, lateralAmp, lateralPhase, scaleAmp, scalePhase, spin]);

  useEffect(() => {
    if (!autoPlay) return undefined;
    progress.setValue(v0);
    // primeiro trecho: da posicao original ate o fim da janela; depois loop continuo.
    const animation = Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: duration * (1 - v0),
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(progress, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      ),
    ]);
    animation.start();
    return () => animation.stop();
  }, [autoPlay, duration, progress, v0]);

  const translateX = progress.interpolate({ inputRange: ranges.input, outputRange: ranges.tx });
  const translateY = progress.interpolate({ inputRange: ranges.input, outputRange: ranges.ty });
  const rotate = progress.interpolate({ inputRange: ranges.input, outputRange: ranges.rot });
  const scale = progress.interpolate({ inputRange: ranges.input, outputRange: ranges.scl });
  // some/aparece nas pontas da janela para o loop nao ter salto visivel
  const opacity = progress.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.Image
      source={cell.source}
      resizeMode="stretch"
      style={{
        position: 'absolute',
        left: cell.left,
        top: cell.top,
        width: cell.width,
        height: cell.height,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }, { scale }],
      }}
    />
  );
}

/**
 * Fluxo de sangue animado. Ocupa exatamente o espaco que o pai der (largura) e
 * mantem a proporcao 1024:1536. Fundo e vaso sao estaticos; so as hemacias se movem.
 * Toda a composicao e montada em 1024x1536 e escalada de uma vez (largura / 1024).
 */
export default function BloodFlowAnimation({ style, autoPlay = true }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const configs = useMemo(() => BLOOD_CELLS.map(buildRbcConfig), []);

  const onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const scale = size.width / CANVAS_WIDTH;
  const canvasTransform = [{ scale }];

  return (
    <View style={[styles.container, style]} onLayout={onLayout} pointerEvents="none">
      {size.width > 0 && (
        <View style={[styles.canvas, { transform: canvasTransform }]}>
          <Image source={VESSEL} resizeMode="stretch" style={styles.vessel} />
          {configs.map((config, index) => (
            <RedBloodCell key={index} config={config} autoPlay={autoPlay} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  canvas: { position: 'absolute', left: 0, top: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  vessel: { position: 'absolute', left: 0, top: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
});
