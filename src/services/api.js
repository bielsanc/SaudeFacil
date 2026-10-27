import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// No celular, use no .env o IP local do computador que executa o XAMPP.
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
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
