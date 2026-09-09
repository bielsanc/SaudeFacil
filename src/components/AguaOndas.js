import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, Dimensions, Image, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// No navegador (react-native-web), Animated.loop com useNativeDriver:true
// costuma tocar apenas uma vez e travar. No iOS/Android o driver nativo
// funciona normalmente e é mais performático, então usamos JS driver só na web.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// Altura padrão de cada faixa de onda
const ONDA_ALTURA = 120;

// Posições dos níveis da água (1200ml -> 0ml)
const TOPO_ONDA_1 = SCREEN_HEIGHT * 0.28; // 1200ml
const TOPO_ONDA_2 = SCREEN_HEIGHT * 0.38; // 650ml
const TOPO_ONDA_3 = SCREEN_HEIGHT * 0.48; // 300ml
const TOPO_ONDA_4 = SCREEN_HEIGHT * 0.58; // 0ml

// A foca fica sentada por cima da onda de "0ml" quando nada foi bebido,
// e sobe até ficar por cima da onda de "1200ml" quando a meta é atingida.
const FOCA_TOP_VAZIO = TOPO_ONDA_4 - 60;
const FOCA_TOP_CHEIO = TOPO_ONDA_1 - 60;
const FOCA_PERCURSO = FOCA_TOP_VAZIO - FOCA_TOP_CHEIO;

// Gera um caminho de onda (duas "corcovas") que começa e termina na mesma
// altura em x=0 e x=width, para encaixar perfeitamente quando duplicado
// lado a lado no loop de animação.
function criarCaminhoOnda(width, height) {
  const meio = height * 0.35;
  const crista = height * 0.05;
  const vale = height * 0.65;

  return [
    `M0,${meio}`,
    `C${width * 0.25},${crista} ${width * 0.25},${vale} ${width * 0.5},${meio}`,
    `C${width * 0.75},${crista} ${width * 0.75},${vale} ${width},${meio}`,
    `L${width},${height}`,
    `L0,${height}`,
    'Z',
  ].join(' ');
}

function CamadaDeOndaSvg({ top, duration, reverse, gradientId, cores }) {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      { iterations: -1 }
    );

    animacao.start();

    return () => {
      animacao.stop();
    };
  }, [translateX, duration]);

  const interpolado = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? [-SCREEN_WIDTH, 0] : [0, -SCREEN_WIDTH],
  });

  const caminho = useMemo(() => criarCaminhoOnda(SCREEN_WIDTH, ONDA_ALTURA), []);

  return (
    <View style={[styles.ondaContainer, { top }]} pointerEvents="none">
      <Animated.View style={[styles.ondaFaixa, { transform: [{ translateX: interpolado }] }]}>
        {/* Renderiza o SVG duas vezes lado a lado para um loop infinito perfeito */}
        {[0, 1].map((copia) => (
          <Svg key={copia} width={SCREEN_WIDTH} height={ONDA_ALTURA}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                {cores.map((cor, index) => (
                  <Stop
                    key={index}
                    offset={cor.offset}
                    stopColor={cor.color}
                    stopOpacity={cor.opacity ?? 1}
                  />
                ))}
              </LinearGradient>
            </Defs>
            <Path d={caminho} fill={`url(#${gradientId})`} />
          </Svg>
        ))}
      </Animated.View>
    </View>
  );
}

function MarcadorDeNivel({ label, top }) {
  return (
    <View style={[styles.marcador, { top }]} pointerEvents="none">
      <View style={styles.marcadorTraco} />
      <Animated.Text style={styles.marcadorTexto}>{label}</Animated.Text>
    </View>
  );
}

function FocaAnimada({ progresso = 0 }) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const nivelAnim = useRef(new Animated.Value(progresso)).current;

  // Balanço/flutuação contínua (idle), independente do nível de água
  useEffect(() => {
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
      { iterations: -1 }
    );

    animacao.start();

    return () => {
      animacao.stop();
    };
  }, [bobAnim]);

  // A foca sobe suavemente sempre que o progresso (consumido/meta) muda,
  // ou seja, sempre que a pessoa adiciona mais água.
  useEffect(() => {
    Animated.spring(nivelAnim, {
      toValue: progresso,
      friction: 6,
      tension: 40,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [progresso, nivelAnim]);

  const bobTranslateY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const nivelTranslateY = nivelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -FOCA_PERCURSO],
    extrapolate: 'clamp',
  });

  const rotate = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  });

  return (
    <Animated.Image
      source={require('../../assets/foca.png')}
      style={[
        styles.foca,
        {
          top: FOCA_TOP_VAZIO,
          transform: [
            { translateY: Animated.add(bobTranslateY, nivelTranslateY) },
            { rotate },
          ],
        },
      ]}
      resizeMode="contain"
    />
  );
}

// Paleta de gradiente de cada camada de onda, da mais distante (clara,
// perto do topo/1200ml) para a mais próxima (mais saturada, perto do 0ml).
const GRADIENTE_ONDA_1 = [
  { offset: '0', color: '#D7F1FF', opacity: 0.85 },
  { offset: '1', color: '#7FD0F5', opacity: 0.9 },
];
const GRADIENTE_ONDA_2 = [
  { offset: '0', color: '#9BDCFA', opacity: 0.88 },
  { offset: '1', color: '#4CB4E8', opacity: 0.92 },
];
const GRADIENTE_ONDA_3 = [
  { offset: '0', color: '#6BC4EF', opacity: 0.9 },
  { offset: '1', color: '#2A93CE', opacity: 0.95 },
];
const GRADIENTE_ONDA_4 = [
  { offset: '0', color: '#3AA6DE', opacity: 0.96 },
  { offset: '1', color: '#0B6FA0', opacity: 1 },
];

export default function AguaOndas({ progresso = 0 }) {
  return (
    <View style={styles.cena}>
      {/* Fundo do Céu */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            <LinearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#EAF6FC" />
              <Stop offset="0.3" stopColor="#BCE5FA" />
              <Stop offset="0.6" stopColor="#5BB4E5" />
              <Stop offset="1" stopColor="#1C7FA8" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#ceu)" />
        </Svg>
      </View>

      {/* Marcadores de Nível */}
      <MarcadorDeNivel label="1200ml" top={TOPO_ONDA_1 - 12} />
      <MarcadorDeNivel label="650ml" top={TOPO_ONDA_2 - 12} />
      <MarcadorDeNivel label="300ml" top={TOPO_ONDA_3 - 12} />
      <MarcadorDeNivel label="0ml" top={TOPO_ONDA_4 - 12} />

      {/* Camadas de Ondas Animadas em SVG com gradiente */}
      <CamadaDeOndaSvg
        top={TOPO_ONDA_1}
        duration={9000}
        gradientId="waveGrad1"
        cores={GRADIENTE_ONDA_1}
      />
      <CamadaDeOndaSvg
        top={TOPO_ONDA_2}
        duration={12000}
        reverse
        gradientId="waveGrad2"
        cores={GRADIENTE_ONDA_2}
      />
      <CamadaDeOndaSvg
        top={TOPO_ONDA_3}
        duration={10000}
        gradientId="waveGrad3"
        cores={GRADIENTE_ONDA_3}
      />

      {/* Foca Animada: sobe conforme o progresso de água consumida */}
      <FocaAnimada progresso={progresso} />

      {/* Última Onda */}
      <CamadaDeOndaSvg
        top={TOPO_ONDA_4}
        duration={14000}
        reverse
        gradientId="waveGrad4"
        cores={GRADIENTE_ONDA_4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cena: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  marcador: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  marcadorTraco: {
    width: 22,
    height: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
    borderRadius: 2,
  },
  marcadorTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
  },
  ondaContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  ondaFaixa: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
    height: ONDA_ALTURA,
  },
  foca: {
    position: 'absolute',
    right: 10,
    width: 170,
    height: 170,
    zIndex: 3,
  },
});
