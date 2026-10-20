/**
 * validacao.js
 * Máscaras (formatam enquanto o usuário digita) e validadores dos formulários.
 */

/** Mantém só os dígitos de um texto. */
const soDigitos = (t) => String(t || '').replace(/\D/g, '');

/** (11) 98765-4321  — aceita 10 ou 11 dígitos. */
export function mascaraTelefone(texto) {
  const d = soDigitos(texto).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** dd/mm/aaaa */
export function mascaraData(texto) {
  const d = soDigitos(texto).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Aceita números com vírgula ou ponto ("62,5" ou "62.5"). */
export const paraNumero = (t) => parseFloat(String(t || '').replace(',', '.'));

export const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());

/**
 * Converte "dd/mm/aaaa" em Date. Retorna null se a data não existir
 * (ex.: 31/02/2000), estiver no futuro ou for de mais de 120 anos atrás.
 */
export function parseData(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto || '');
  if (!m) return null;
  const [, dd, mm, aaaa] = m.map(Number);
  const data = new Date(aaaa, mm - 1, dd);
  // O JS "corrige" datas inválidas (31/02 vira 03/03); comparar de volta detecta isso.
  if (data.getFullYear() !== aaaa || data.getMonth() !== mm - 1 || data.getDate() !== dd) return null;
  const hoje = new Date();
  if (data > hoje) return null;
  if (hoje.getFullYear() - aaaa > 120) return null;
  return data;
}

/** Idade em anos completos a partir de "dd/mm/aaaa". */
export function calcularIdade(texto) {
  const nasc = parseData(texto);
  if (!nasc) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const jaFezAniversario =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
  if (!jaFezAniversario) idade -= 1;
  return idade;
}

/** Tipos sanguíneos (mesma lista da tela de Sangue, com o sinal "−" tipográfico). */
export const TIPOS_SANGUINEOS = ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'];
