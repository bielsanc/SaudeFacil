import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredBaseURL = process.env.EXPO_PUBLIC_API_URL;

function getApiBaseURL() {
  if (Platform.OS === 'web') return configuredBaseURL || 'http://localhost:3000/api';

  const usesLoopback = !configuredBaseURL || /:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredBaseURL);
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (usesLoopback && expoHost) return `http://${expoHost}:3000/api`;
  return configuredBaseURL || 'http://localhost:3000/api';
}

const baseURL = getApiBaseURL();
const TOKEN_KEY = '@saudefacil:token';

export const api = axios.create({ baseURL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function salvarToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function limparToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function mensagemErroApi(error) {
  return error?.response?.data?.error || error?.message || 'ERRO_API';
}
