function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const piadas = [
  "Por que o computador foi ao médico? Porque estava com vírus.",
  "O que o pato disse pra pata? Vem quá.",
  "Por que o livro de matemática está triste? Porque tem muitos problemas.",
];

const fatos = [
  "Os polvos têm três corações.",
  "O mel nunca estraga.",
  "Um dia em Vênus dura mais que um ano em Vênus.",
];

const elogios = [
  "Você é a prova de que a IA ainda tem muito o que aprender sobre carisma, porque o seu já é 10/10.",
  "Seu sorriso deveria ser considerado patrimônio nacional.",
  "Você é tão gente boa que até bug de sistema quer ser seu amigo.",
];

const indiretas = [
  "Tem gente que fala demais e entrega menos que boleto vencido.",
  "Some sem avisar, mas quando quer, aparece rapidinho...",
  "Bloqueado é bloqueado, não tem 'só pra ver stories'.",
];

const cantadas = [
  "Você é Wi-Fi? Porque eu tô sentindo uma conexão.",
  "Se beleza fosse crime, você já tava presa/preso há anos.",
  "Seu nome é Google? Porque tem tudo que eu procurava.",
];

const trocadilhos = [
  "Fui pescar e não peguei nada, foi um 'peixe-mistério'.",
  "O padeiro tava de mal humor, tava com a 'massa' cheia.",
  "O eletricista terminou o namoro porque não tinha mais 'conexão'.",
];

function roleta(participantes) {
  return pick(participantes);
}

module.exports = {
  piada: () => pick(piadas),
  fato: () => pick(fatos),
  elogio: () => pick(elogios),
  indireta: () => pick(indiretas),
  cantada: () => pick(cantadas),
  trocadilho: () => pick(trocadilhos),
  roleta,
};
