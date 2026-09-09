import { useMemo, useState } from 'react';

const META_PADRAO = 0; // ml, usado enquanto o peso não é informado
const ML_POR_KG = 35; // fórmula simplificada: 35ml de água por kg de peso

export function useAgua() {
  const [peso, setPeso] = useState('');
  const [consumido, setConsumido] = useState(0);

  const meta = useMemo(() => {
    const pesoNumerico = parseFloat(String(peso).replace(',', '.'));
    if (!Number.isFinite(pesoNumerico) || pesoNumerico <= 0) return META_PADRAO;
    return Math.round(pesoNumerico * ML_POR_KG);
  }, [peso]);

  const progresso = useMemo(() => {
    if (!meta) return 0;
    return Math.min(consumido / meta, 1);
  }, [consumido, meta]);

  const adicionarAgua = (quantidadeMl) => {
    setConsumido((atual) => atual + quantidadeMl);
  };

  const resetarConsumo = () => setConsumido(0);

  return {
    peso,
    setPeso,
    meta,
    consumido,
    progresso,
    adicionarAgua,
    resetarConsumo,
  };
}
