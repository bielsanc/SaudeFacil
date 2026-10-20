/**
 * AuthContext.js
 * ---------------------------------------------------------------
 * Contexto global de autenticação. Qualquer tela pode fazer:
 *
 *   const { user, signIn, signUp, signOut, updateUser } = useAuth();
 *
 * - user === null  -> ninguém logado (o router mostra Login/Cadastro)
 * - user !== null  -> logado (o router mostra o app)
 * - loading        -> ainda lendo a sessão salva no aparelho
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  autenticar, cadastrarUsuario, carregarSessao,
  iniciarSessao, encerrarSessao, atualizarUsuario,
} from '../services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao abrir o app, restaura a sessão salva (se existir).
  useEffect(() => {
    carregarSessao()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /** Login: valida credenciais, grava a sessão e atualiza o estado. */
  const signIn = useCallback(async (email, senha) => {
    const usuario = await autenticar(email, senha);
    await iniciarSessao(usuario.email);
    setUser(usuario);
  }, []);

  /** Cadastro: cria a conta e já entra logado. */
  const signUp = useCallback(async (dados) => {
    const usuario = await cadastrarUsuario(dados);
    await iniciarSessao(usuario.email);
    setUser(usuario);
  }, []);

  /** Logout: apaga só a sessão; a conta continua salva no aparelho. */
  const signOut = useCallback(async () => {
    await encerrarSessao();
    setUser(null);
  }, []);

  /** Atualiza dados do perfil e reflete na tela imediatamente. */
  const updateUser = useCallback(async (campos) => {
    const atualizado = await atualizarUsuario(user.email, campos);
    setUser(atualizado);
    return atualizado;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook de atalho para consumir o contexto. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
