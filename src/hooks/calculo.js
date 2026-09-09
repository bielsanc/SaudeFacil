import { useState } from 'react';

// Categorias de IMC exibidas na tela de resultado, na mesma ordem do
// gráfico em arco (grafico1.png ... grafico5.png) e dos ícones de
// pessoa (magreza.png, abaixoPeso.png, normalPeso.png, acimaPeso.png,
// obesidade.png).
export const CATEGORIAS_IMC = [
  { key: 'magreza', label: 'Magreza', range: '<17.0', min: -Infinity, max: 17.0 },
  { key: 'abaixoPeso', label: 'Abaixo do Peso', range: '17.0 - 18.4', min: 17.0, max: 18.5 },
  { key: 'normal', label: 'Normal', range: '18.5 - 24.9', min: 18.5, max: 25.0 },
  { key: 'acimaPeso', label: 'Acima do Peso', range: '25.0 - 29.9', min: 25.0, max: 30.0 },
  { key: 'obesidade', label: 'Obesidade', range: '30.0>', min: 30.0, max: Infinity },
];

export function useImcCalculator() {
// Altere os valores iniciais do useState para o menor valor do range
const [idade, setIdade] = useState(1);   // Começa em 1 (ou no seu menor valor min)
const [altura, setAltura] = useState(50); // Começa no valor mínimo da régua (50 cm)
const [peso, setPeso] = useState(20);    // Começa no menor peso (20 kg)
  const [genero, setGenero] = useState('feminino');

  const calcularIMC = () => {
    const altMetros = Number(altura) / 100;
    const pesoKg = Number(peso);

    if (!altMetros || !pesoKg || altMetros <= 0 || pesoKg <= 0) {
      return { imc: null, categoria: null, categoriaIndex: -1, diferenca: '0.0' };
    }

    const imc = pesoKg / (altMetros * altMetros);
    const categoriaIndex = CATEGORIAS_IMC.findIndex((c) => imc >= c.min && imc < c.max);
    const categoria = CATEGORIAS_IMC[categoriaIndex] || CATEGORIAS_IMC[CATEGORIAS_IMC.length - 1];

    const pesoIdealMedio = 21.7 * (altMetros * altMetros);
    const diferenca = pesoKg - pesoIdealMedio;

    return {
      imc: imc.toFixed(1),
      categoria: categoria.label,
      categoriaIndex: categoriaIndex === -1 ? CATEGORIAS_IMC.length - 1 : categoriaIndex,
      diferenca: diferenca.toFixed(1),
    };
  };

  const resultado = calcularIMC();

  return {
    idade,
    setIdade,
    altura,
    setAltura,
    peso,
    setPeso,
    genero,
    setGenero,
    resultado,
  };
}
