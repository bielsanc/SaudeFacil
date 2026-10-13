import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import axios from 'axios';

import Header from '../components/Header';
import FruitSearchInput from '../components/FruitSearchInput';

const FRUIT_API = 'https://www.fruityvice.com/api/fruit';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const FRUIT_API_URL = Platform.OS === 'web'
  ? (process.env.EXPO_PUBLIC_FRUIT_API_PROXY || 'http://localhost:3001/api/fruit')
  : FRUIT_API;
const DEEPL_BATCH_API_URL = process.env.EXPO_PUBLIC_TRANSLATION_API_PROXY
  || 'http://localhost:3001/api/translate/batch';
const FRUIT_CATALOG = [
  { apiName: 'Apple', portugueseName: 'Maçã', aliases: ['apple', 'maçã', 'maca'] },
  { apiName: 'Apricot', portugueseName: 'Damasco', aliases: ['apricot', 'damasco'] },
  { apiName: 'Avocado', portugueseName: 'Abacate', aliases: ['avocado', 'abacate'] },
  { apiName: 'Banana', portugueseName: 'Banana', aliases: ['banana'] },
  { apiName: 'Blackberry', portugueseName: 'Amora', aliases: ['blackberry', 'amora', 'amora preta'] },
  { apiName: 'Blueberry', portugueseName: 'Mirtilo', aliases: ['blueberry', 'mirtilo'] },
  { apiName: 'Cherry', portugueseName: 'Cereja', aliases: ['cherry', 'cereja'] },
  { apiName: 'Cranberry', portugueseName: 'Oxicoco', aliases: ['cranberry', 'oxicoco'] },
  { apiName: 'Dragonfruit', portugueseName: 'Pitaya', aliases: ['dragonfruit', 'pitaya', 'pitaia', 'fruta do dragão', 'fruta do dragao'] },
  { apiName: 'Durian', portugueseName: 'Durião', aliases: ['durian', 'durião', 'duriao'] },
  { apiName: 'Feijoa', portugueseName: 'Feijoa', aliases: ['feijoa', 'goiaba serra'] },
  { apiName: 'Fig', portugueseName: 'Figo', aliases: ['fig', 'figo'] },
  { apiName: 'Gooseberry', portugueseName: 'Groselha', aliases: ['gooseberry', 'groselha'] },
  { apiName: 'Grape', portugueseName: 'Uva', aliases: ['grape', 'grapes', 'uva', 'uvas'] },
  { apiName: 'GreenApple', englishName: 'Green Apple', portugueseName: 'Maçã verde', aliases: ['greenapple', 'green apple', 'maçã verde', 'maca verde'] },
  { apiName: 'Guava', portugueseName: 'Goiaba', aliases: ['guava', 'goiaba'] },
  { apiName: 'Kiwi', portugueseName: 'Kiwi', aliases: ['kiwi'] },
  { apiName: 'Lemon', portugueseName: 'Limão siciliano', aliases: ['lemon', 'limão', 'limao', 'limão siciliano', 'limao siciliano'] },
  { apiName: 'Lime', portugueseName: 'Limão-taiti', aliases: ['lime', 'lima', 'limão taiti', 'limao taiti'] },
  { apiName: 'Lychee', portugueseName: 'Lichia', aliases: ['lychee', 'lichia', 'litchi'] },
  { apiName: 'Mango', portugueseName: 'Manga', aliases: ['mango', 'manga'] },
  { apiName: 'Melon', portugueseName: 'Melão', aliases: ['melon', 'melão', 'melao'] },
  { apiName: 'Orange', portugueseName: 'Laranja', aliases: ['orange', 'laranja'] },
  { apiName: 'Papaya', portugueseName: 'Mamão', aliases: ['papaya', 'mamão', 'mamao'] },
  { apiName: 'Passionfruit', portugueseName: 'Maracujá', aliases: ['passionfruit', 'passion fruit', 'maracujá', 'maracuja'] },
  { apiName: 'Peach', portugueseName: 'Pêssego', aliases: ['peach', 'pêssego', 'pessego'] },
  { apiName: 'Pear', portugueseName: 'Pera', aliases: ['pear', 'pera'] },
  { apiName: 'Persimmon', portugueseName: 'Caqui', aliases: ['persimmon', 'caqui'] },
  { apiName: 'Pineapple', portugueseName: 'Abacaxi', aliases: ['pineapple', 'abacaxi'] },
  { apiName: 'Plum', portugueseName: 'Ameixa', aliases: ['plum', 'ameixa'] },
  { apiName: 'Pomegranate', portugueseName: 'Romã', aliases: ['pomegranate', 'romã', 'roma'] },
  { apiName: 'Raspberry', portugueseName: 'Framboesa', aliases: ['raspberry', 'framboesa'] },
  { apiName: 'Strawberry', portugueseName: 'Morango', aliases: ['strawberry', 'morango'] },
  { apiName: 'Tangerine', portugueseName: 'Tangerina', aliases: ['tangerine', 'tangerina', 'mexerica'] },
  { apiName: 'Tomato', portugueseName: 'Tomate', aliases: ['tomato', 'tomate'] },
  { apiName: 'Watermelon', portugueseName: 'Melancia', aliases: ['watermelon', 'melancia'] },
];

const FRUIT_BY_ALIAS = Object.fromEntries(
  FRUIT_CATALOG.flatMap((fruit) => fruit.aliases.map((alias) => [normalizeFruitName(alias), fruit])),
);
const FRUIT_BY_API_NAME = Object.fromEntries(
  FRUIT_CATALOG.map((fruit) => [normalizeFruitName(fruit.apiName), fruit]),
);
let fruitTranslationsRequest;

export default function FruitScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [fruit, setFruit] = useState(null);
  const [fruitImage, setFruitImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [deepLNames, setDeepLNames] = useState({});
  const latestRequest = useRef(0);
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    let active = true;
    requestFruitTranslations()
      .then((translations) => {
        if (active) setDeepLNames(translations);
      })
      .catch(() => {
        // O catálogo em português continua disponível se a chave DeepL não estiver configurada.
      });
    return () => {
      active = false;
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00B969" />
      </View>
    );
  }

  const searchFruit = async () => {
    const typedName = query.trim();
    if (!typedName) {
      setFruit(null);
      setFruitImage(null);
      setSearchError('Digite o nome de uma fruta para buscar.');
      return;
    }

    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    const normalizedName = normalizeFruitName(typedName);
    const knownFruit = FRUIT_BY_ALIAS[normalizedName]
      || FRUIT_CATALOG.find((item) => normalizeFruitName(deepLNames[normalizeFruitName(item.apiName)]) === normalizedName);

    setSearching(true);
    setFruit(null);
    setFruitImage(null);
    setImageLoading(false);
    setSearchError('');

    try {
      const apiName = knownFruit?.apiName || typedName;

      const response = await axios.get(`${FRUIT_API_URL}/${encodeURIComponent(apiName)}`, {
        timeout: 12000,
      });
      if (requestId !== latestRequest.current) return;

      // A busca é digitada em português; preserve esse nome para evitar traduções
      // incorretas de nomes próprios de frutas feitas pelo serviço de tradução.
      const displayFruit = FRUIT_BY_API_NAME[normalizeFruitName(response.data.name)] || knownFruit;
      const displayName = deepLNames[normalizeFruitName(response.data.name)] || displayFruit?.portugueseName || typedName;
      setFruit({ ...response.data, displayName });
      setSearching(false);
      setImageLoading(true);

      try {
        const image = await searchFruitImage(apiName);
        if (requestId === latestRequest.current) setFruitImage(image);
      } catch {
        // Os dados nutricionais continuam disponíveis mesmo se a busca de imagem falhar.
      }
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      if (error.response?.status === 404) {
        setSearchError('Não encontramos essa fruta. Tente outro nome.');
      } else {
        setSearchError('Não foi possível buscar agora. Confira a conexão e tente novamente.');
      }
    } finally {
      if (requestId === latestRequest.current) {
        setSearching(false);
        setImageLoading(false);
      }
    }
  };

  const clearSearch = (text) => {
    latestRequest.current += 1;
    setSearching(false);
    setQuery(text);
    if (fruit || searchError || searching) {
      setFruit(null);
      setFruitImage(null);
      setSearchError('');
    }
    setImageLoading(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.layout}>
        <Image
          source={require('../../assets/frutas.png')}
          resizeMode="contain"
          accessible={false}
          pointerEvents="none"
          style={[styles.backgroundIllustration, { width, height: width }]}
        />

        <View style={styles.foreground}>
          <Header
            variant="fruit"
            title="Fruta"
            icon={require('../../assets/fruta.png')}
            leftIcon="home"
            onGoBack={() => navigation.navigate('Home')}
          />

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FruitSearchInput
              value={query}
              onChangeText={clearSearch}
              onSubmitEditing={searchFruit}
              onSearch={searchFruit}
            />

            <View style={styles.illustrationSpace} />

            {searching ? (
              <View style={styles.feedback}>
                <ActivityIndicator color="#00B969" />
                <Text style={styles.feedbackText}>Buscando fruta...</Text>
              </View>
            ) : fruit ? (
              <FruitDetails fruit={fruit} image={fruitImage} imageLoading={imageLoading} />
            ) : searchError ? (
              <Text style={styles.errorText}>{searchError}</Text>
            ) : (
              <>
                <Text style={styles.title}>Encontre informações{ '\n' }sobre sua fruta favorita!</Text>
                <Text style={styles.description}>
                  Digite o nome da fruta e toque na lupa{ '\n' }ou pressione buscar no teclado
                </Text>

                <View style={styles.heartDecoration} accessible={false}>
                  <View style={[styles.ray, styles.rayLeftTop]} />
                  <View style={[styles.ray, styles.rayLeftMiddle]} />
                  <View style={[styles.ray, styles.rayLeftBottom]} />
                  <Ionicons name="heart" size={43} color="#68B83F" />
                  <View style={[styles.ray, styles.rayRightTop]} />
                  <View style={[styles.ray, styles.rayRightMiddle]} />
                  <View style={[styles.ray, styles.rayRightBottom]} />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  layout: { flex: 1, position: 'relative', overflow: 'hidden' },
  foreground: { flex: 1, zIndex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32, alignItems: 'stretch' },
  backgroundIllustration: {
    position: 'absolute',
    top: 88,
    left: 0,
    zIndex: 0,
  },
  illustrationSpace: { height: 205, marginTop: 5 },
  feedback: { alignItems: 'center', justifyContent: 'center', paddingVertical: 22, gap: 8 },
  feedbackText: { color: '#555555', fontSize: 13, fontFamily: 'Poppins_500Medium' },
  errorText: { marginTop: 10, color: '#B42318', textAlign: 'center', fontSize: 13, fontFamily: 'Poppins_500Medium' },
  resultCard: { padding: 18, borderRadius: 20, backgroundColor: '#FFFFFF', elevation: 3, shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  resultImageFrame: { height: 180, marginTop: -18, marginHorizontal: -18, marginBottom: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF6E7' },
  resultImage: { width: '100%', height: '100%' },
  imagePlaceholder: { color: '#55704E', fontSize: 12, fontFamily: 'Poppins_400Regular' },
  imageCredit: { marginTop: 8, marginBottom: 2, color: '#61715F', fontSize: 10, lineHeight: 14, fontFamily: 'Poppins_400Regular', textDecorationLine: 'underline' },
  resultName: { color: '#111111', fontSize: 22, fontFamily: 'Poppins_700Bold', textTransform: 'capitalize' },
  resultTaxonomy: { marginTop: 2, color: '#666666', fontSize: 12, fontFamily: 'Poppins_400Regular' },
  nutritionTitle: { marginTop: 16, marginBottom: 8, color: '#006B3F', fontSize: 15, fontFamily: 'Poppins_700Bold' },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nutritionItem: { width: '48%', padding: 10, borderRadius: 12, backgroundColor: '#EAF6E7' },
  nutritionLabel: { color: '#55704E', fontSize: 11, fontFamily: 'Poppins_400Regular' },
  nutritionValue: { marginTop: 2, color: '#183D24', fontSize: 14, fontFamily: 'Poppins_700Bold' },
  title: {
    marginTop: 7,
    color: '#00B969',
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.45,
    transform: [{ rotate: '-2deg' }],
  },
  description: {
    marginTop: 9,
    color: '#0759C7',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  heartDecoration: {
    width: 140,
    height: 60,
    alignSelf: 'center',
    marginTop: 61,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: { position: 'absolute', width: 24, height: 5, borderRadius: 3, backgroundColor: '#70B93E' },
  rayLeftTop: { left: 10, top: 9, transform: [{ rotate: '42deg' }] },
  rayLeftMiddle: { left: 4, top: 28, transform: [{ rotate: '4deg' }] },
  rayLeftBottom: { left: 16, top: 47, transform: [{ rotate: '-52deg' }] },
  rayRightTop: { right: 10, top: 9, transform: [{ rotate: '-42deg' }] },
  rayRightMiddle: { right: 4, top: 28, transform: [{ rotate: '-4deg' }] },
  rayRightBottom: { right: 16, top: 47, transform: [{ rotate: '52deg' }] },
});

function FruitDetails({ fruit, image, imageLoading }) {
  const nutritionLabels = [
    ['calories', 'Calorias', 'kcal'],
    ['carbohydrates', 'Carboidratos', 'g'],
    ['protein', 'Proteínas', 'g'],
    ['fat', 'Gorduras', 'g'],
    ['sugar', 'Açúcares', 'g'],
  ];

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultImageFrame}>
        {image ? (
          <Image
            source={{ uri: image.uri }}
            resizeMode="cover"
            style={styles.resultImage}
            accessible
            accessibilityLabel={`Imagem de ${fruit.displayName || fruit.name}`}
          />
        ) : imageLoading ? (
          <ActivityIndicator color="#00B969" />
        ) : (
          <Text style={styles.imagePlaceholder}>Imagem indisponível</Text>
        )}
      </View>
      {image?.sourceUrl ? (
        <Text
          style={styles.imageCredit}
          onPress={() => Linking.openURL(image.sourceUrl)}
          accessibilityRole="link"
        >
          Imagem: {image.author || 'Wikimedia Commons'}{image.license ? ` · ${image.license}` : ''}
        </Text>
      ) : null}
      <Text style={styles.resultName}>{fruit.displayName || fruit.name}</Text>
      <Text style={styles.resultTaxonomy}>
        Família: {fruit.family} · Gênero: {fruit.genus} · Ordem: {fruit.order}
      </Text>
      <Text style={styles.nutritionTitle}>Informações por 100 g</Text>
      <View style={styles.nutritionGrid}>
        {nutritionLabels.map(([key, label, unit]) => (
          <View key={key} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>{label}</Text>
            <Text style={styles.nutritionValue}>
              {fruit.nutritions?.[key] ?? '—'} {unit}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

async function searchFruitImage(fruitName) {
  const response = await axios.get(COMMONS_API, {
    params: {
      action: 'query',
      format: 'json',
      generator: 'search',
      gsrsearch: `${fruitName} fruit`,
      gsrnamespace: 6,
      gsrlimit: 8,
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: 720,
      origin: '*',
    },
    timeout: 10000,
  });

  const pages = Object.values(response.data?.query?.pages || {});
  const candidates = pages.filter((page) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url);
  const matchingPage = candidates.find((page) => page.title.toLowerCase().includes(fruitName.toLowerCase()));
  const page = matchingPage || candidates[0];
  const imageInfo = page?.imageinfo?.[0];
  if (!imageInfo) return null;

  const metadata = imageInfo.extmetadata || {};
  return {
    uri: imageInfo.thumburl || imageInfo.url,
    sourceUrl: imageInfo.descriptionurl || page.fullurl,
    author: cleanMetadata(metadata.Artist?.value || metadata.Credit?.value),
    license: cleanMetadata(metadata.LicenseShortName?.value),
  };
}

function requestFruitTranslations() {
  if (!fruitTranslationsRequest) {
    fruitTranslationsRequest = axios.post(DEEPL_BATCH_API_URL, {
      texts: FRUIT_CATALOG.map((fruit) => fruit.englishName || fruit.apiName.replace(/([a-z])([A-Z])/g, '$1 $2')),
    }, { timeout: 15000 })
      .then((response) => {
        const translations = response.data?.translations;
        if (!Array.isArray(translations) || translations.length !== FRUIT_CATALOG.length) {
          throw new Error('DeepL returned an incomplete fruit catalog');
        }
        return Object.fromEntries(FRUIT_CATALOG.map((fruit, index) => [
          normalizeFruitName(fruit.apiName),
          translations[index]?.text?.trim() || fruit.portugueseName,
        ]));
      })
      .catch((error) => {
        fruitTranslationsRequest = null;
        throw error;
      });
  }
  return fruitTranslationsRequest;
}

function normalizeFruitName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function cleanMetadata(value) {
  return value
    ?.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
