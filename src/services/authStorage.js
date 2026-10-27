import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, limparToken, mensagemErroApi, salvarToken } from './api';

const SESSION_KEY = '@saudefacil:sessao';

function erroDaApi(error) {
  const code = mensagemErroApi(error);
  const err = new Error(code === 'ERR_NETWORK' || code === 'ECONNABORTED' ? 'SERVIDOR_INDISPONIVEL' : code);
  err.code = code;
  return err;
}

async function concluirAutenticacao(response) {
  const { user, token } = response.data;
  await Promise.all([
    salvarToken(token),
    AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user)),
  ]);
  return user;
}

export async function cadastrarUsuario(dados) {
  try {
    return await concluirAutenticacao(await api.post('/auth/register', dados));
  } catch (error) { throw erroDaApi(error); }
}

export async function autenticar(email, senha) {
  try {
    return await concluirAutenticacao(await api.post('/auth/login', { email, senha }));
  } catch (error) { throw erroDaApi(error); }
}

export async function carregarSessao() {
  const cached = await AsyncStorage.getItem(SESSION_KEY);
  const token = await AsyncStorage.getItem('@saudefacil:token');
  if (!token) return null;
  try {
    const { data } = await api.get('/auth/me');
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    return data.user;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 404) {
      await encerrarSessao();
      return null;
    }
    // Mantém a sessão visual em caso de indisponibilidade temporária da API.
    return cached ? JSON.parse(cached) : null;
  }
}

export async function encerrarSessao() {
  await Promise.all([limparToken(), AsyncStorage.removeItem(SESSION_KEY)]);
}

export async function atualizarUsuario(_email, campos) {
  try {
    const { data } = await api.patch('/auth/me', campos);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    return data.user;
  } catch (error) { throw erroDaApi(error); }
}

export async function salvarRegistroImc(registro) {
  try { await api.post('/imc', registro); }
  catch (error) { throw erroDaApi(error); }
}

export async function carregarAguaHoje() {
  try { return (await api.get('/water/today')).data; }
  catch (error) { throw erroDaApi(error); }
}

export async function salvarAguaHoje(registro) {
  try { await api.put('/water/today', registro); }
  catch (error) { throw erroDaApi(error); }
}
