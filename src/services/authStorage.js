/**
 * authStorage.js
 * ---------------------------------------------------------------
 * Camada de persistência LOCAL do app (sem servidor).
 *
 * Usa o AsyncStorage, que guarda pares chave/valor em texto:
 *  - Android/iOS: arquivo no armazenamento interno do app
 *  - Web: localStorage do navegador
 *
 * O que fica salvo:
 *  - USERS_KEY   -> objeto { "email@x.com": { ...dadosDoUsuario } }
 *  - SESSION_KEY -> e-mail do usuário logado (mantém o login ao reabrir o app)
 *
 * A senha NUNCA é salva em texto puro: guardamos um "salt" aleatório
 * e o hash SHA-256 de (salt + senha).
 * Obs.: para um app com servidor de verdade, o ideal é validar a senha
 * no backend (bcrypt/argon2). Aqui é a solução adequada para uso offline.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const USERS_KEY = '@saudefacil:usuarios';
const SESSION_KEY = '@saudefacil:sessao';

/** Normaliza o e-mail para que "Ana@x.com " e "ana@x.com" sejam o mesmo usuário. */
export const normalizarEmail = (email) => String(email || '').trim().toLowerCase();

/** Lê todos os usuários salvos. Se não houver nada (ou o JSON estiver corrompido), devolve {}. */
async function lerUsuarios() {
  try {
    const bruto = await AsyncStorage.getItem(USERS_KEY);
    return bruto ? JSON.parse(bruto) : {};
  } catch {
    return {};
  }
}

/** Grava o objeto completo de usuários. */
async function salvarUsuarios(usuarios) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
}

/** Gera um salt aleatório de 16 bytes em hexadecimal. */
async function gerarSalt() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Calcula o hash SHA-256 de salt + senha. */
const gerarHash = (salt, senha) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + senha);

/** Remove os campos sensíveis antes de entregar o usuário para as telas. */
function publico(usuario) {
  const { senhaHash, salt, ...resto } = usuario;
  return resto;
}

/**
 * Cria uma nova conta.
 * Lança Error('EMAIL_EXISTENTE') se o e-mail já estiver cadastrado.
 */
export async function cadastrarUsuario({ senha, ...dados }) {
  const email = normalizarEmail(dados.email);
  const usuarios = await lerUsuarios();

  if (usuarios[email]) throw new Error('EMAIL_EXISTENTE');

  const salt = await gerarSalt();
  const senhaHash = await gerarHash(salt, senha);

  const novo = { ...dados, email, salt, senhaHash, criadoEm: new Date().toISOString() };
  usuarios[email] = novo;
  await salvarUsuarios(usuarios);

  return publico(novo);
}

/**
 * Valida e-mail + senha.
 * Lança Error('CREDENCIAIS_INVALIDAS') se algo estiver errado.
 * (Mesma mensagem para "usuário não existe" e "senha errada" de propósito,
 * para não revelar quais e-mails estão cadastrados.)
 */
export async function autenticar(emailBruto, senha) {
  const email = normalizarEmail(emailBruto);
  const usuarios = await lerUsuarios();
  const usuario = usuarios[email];

  if (!usuario) throw new Error('CREDENCIAIS_INVALIDAS');

  const hash = await gerarHash(usuario.salt, senha);
  if (hash !== usuario.senhaHash) throw new Error('CREDENCIAIS_INVALIDAS');

  return publico(usuario);
}

/** Salva quem está logado para manter a sessão após fechar o app. */
export const iniciarSessao = (email) => AsyncStorage.setItem(SESSION_KEY, normalizarEmail(email));

/** Encerra a sessão (logout). Os dados da conta continuam salvos. */
export const encerrarSessao = () => AsyncStorage.removeItem(SESSION_KEY);

/** Recupera o usuário da sessão atual, ou null se não houver ninguém logado. */
export async function carregarSessao() {
  const email = await AsyncStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const usuarios = await lerUsuarios();
  return usuarios[email] ? publico(usuarios[email]) : null;
}

/** Atualiza campos do perfil (nome, peso, etc.) sem mexer na senha. */
export async function atualizarUsuario(emailBruto, campos) {
  const email = normalizarEmail(emailBruto);
  const usuarios = await lerUsuarios();
  if (!usuarios[email]) throw new Error('USUARIO_NAO_ENCONTRADO');

  // Impede que um update sobrescreva dados sensíveis por engano.
  const { senhaHash, salt, email: _ignorado, ...seguros } = campos;
  usuarios[email] = { ...usuarios[email], ...seguros };
  await salvarUsuarios(usuarios);

  return publico(usuarios[email]);
}
