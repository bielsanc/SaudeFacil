import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { carregarAguaHoje, salvarAguaHoje } from '../services/authStorage';

const META_PADRAO = 0;
const ML_POR_KG = 35;

export function useAgua() {
  const { user, updateUser } = useAuth();
  const [peso, setPesoState] = useState(String(user?.peso || ''));
  const [consumido, setConsumido] = useState(0);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    carregarAguaHoje()
      .then((dados) => {
        if (!ativo) return;
        setConsumido(dados.consumido || 0);
        setPesoState(String(user?.peso || dados.peso || ''));
        setCarregado(true);
      })
      .catch((error) => console.warn('Não foi possível carregar o consumo de água:', error.message));
    return () => { ativo = false; };
  }, [user?.peso]);

  const pesoNumerico = useMemo(() => Number(String(peso).replace(',', '.')), [peso]);
  const meta = useMemo(() => {
    if (!Number.isFinite(pesoNumerico) || pesoNumerico <= 0) return META_PADRAO;
    return Math.round(pesoNumerico * ML_POR_KG);
  }, [pesoNumerico]);

  useEffect(() => {
    if (!carregado || !Number.isFinite(pesoNumerico) || pesoNumerico <= 0) return undefined;
    const timer = setTimeout(() => {
      salvarAguaHoje({ consumido, peso: pesoNumerico }).catch((error) =>
        console.warn('Não foi possível salvar o consumo de água:', error.message));
      if (Math.abs(Number(user?.peso) - pesoNumerico) > 0.01) {
        updateUser({ peso: pesoNumerico }).catch((error) =>
          console.warn('Não foi possível atualizar o peso do perfil:', error.message));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [carregado, consumido, pesoNumerico]);

  const setPeso = (valor) => setPesoState(String(valor).replace(',', '.').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'));
  const progresso = meta > 0 ? Math.min(consumido / meta, 1) : 0;
  const adicionarAgua = (quantidadeMl) => setConsumido((atual) => atual + quantidadeMl);
  const resetarConsumo = () => setConsumido(0);

  return { peso, setPeso, meta, consumido, progresso, adicionarAgua, resetarConsumo, carregado };
}
