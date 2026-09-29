// Todos os jogos usam um "sessions" em memória por chatId.
// Cada chat só pode ter UM jogo de sessão ativo por vez (exceto comandos
// diretos como /ppt, /dado, /moeda, /eununca, /vdddsf que não usam sessão).

const sessions = {}; // chatId -> { type, ...estado }

function limparSessao(chatId) {
  delete sessions[chatId];
}

function getSessionType(chatId) {
  return sessions[chatId] ? sessions[chatId].type : null;
}

// ---------------------------------------------------------------------
// FORCA
// ---------------------------------------------------------------------
const palavrasForca = ["javascript", "whatsapp", "abacaxi", "computador", "bicicleta", "chocolate"];

function iniciarForca(chatId) {
  const palavra = palavrasForca[Math.floor(Math.random() * palavrasForca.length)];
  sessions[chatId] = { type: "forca", palavra, letrasCertas: new Set(), erros: 0, maxErros: 6 };
  return renderForca(chatId);
}

function renderForca(chatId) {
  const s = sessions[chatId];
  const exibir = s.palavra.split("").map((l) => (s.letrasCertas.has(l) ? l : "_")).join(" ");
  return `🎮 *JOGO DA FORCA*\n\nPalavra: ${exibir}\nErros: ${s.erros}/${s.maxErros}\n\nMande uma letra para tentar.`;
}

function tentarLetraForca(chatId, letra) {
  const s = sessions[chatId];
  letra = (letra || "").toLowerCase().trim();
  if (letra.length !== 1) return { fim: false, msg: "Manda só uma letra por vez." };

  if (s.palavra.includes(letra)) s.letrasCertas.add(letra);
  else s.erros++;

  const ganhou = s.palavra.split("").every((l) => s.letrasCertas.has(l));
  const perdeu = s.erros >= s.maxErros;

  if (ganhou) {
    limparSessao(chatId);
    return { fim: true, venceu: true, msg: `🎉 Você acertou! A palavra era *${s.palavra}*.` };
  }
  if (perdeu) {
    limparSessao(chatId);
    return { fim: true, venceu: false, msg: `💀 Você perdeu! A palavra era *${s.palavra}*.` };
  }
  return { fim: false, msg: renderForca(chatId) };
}

function revelarForca(chatId) {
  const s = sessions[chatId];
  if (!s || s.type !== "forca") return null;
  limparSessao(chatId);
  return s.palavra;
}

// ---------------------------------------------------------------------
// ADIVINHAR NÚMERO
// ---------------------------------------------------------------------
function iniciarAdivinha(chatId) {
  const numero = Math.floor(Math.random() * 100) + 1;
  sessions[chatId] = { type: "adivinha", numero, tentativas: 0 };
  return "🎮 *ADIVINHE O NÚMERO*\n\nPensei em um número de 1 a 100. Tente adivinhar!";
}

function tentarAdivinha(chatId, valor) {
  const s = sessions[chatId];
  const n = parseInt(valor, 10);
  if (isNaN(n)) return { fim: false, msg: "Manda um número válido." };
  s.tentativas++;
  if (n === s.numero) {
    limparSessao(chatId);
    return { fim: true, venceu: true, msg: `🎉 Acertou em ${s.tentativas} tentativa(s)! Era o *${s.numero}*.` };
  }
  return { fim: false, msg: n < s.numero ? "📈 Mais alto!" : "📉 Mais baixo!" };
}

// ---------------------------------------------------------------------
// QUIZ GERAL
// ---------------------------------------------------------------------
const perguntasQuiz = [
  { pergunta: "Qual é a capital do Brasil?", resposta: "brasilia" },
  { pergunta: "Quantos lados tem um triângulo?", resposta: "3" },
  { pergunta: "Qual é o maior planeta do sistema solar?", resposta: "jupiter" },
];

function iniciarQuiz(chatId) {
  const q = perguntasQuiz[Math.floor(Math.random() * perguntasQuiz.length)];
  sessions[chatId] = { type: "quiz", resposta: q.resposta };
  return `🎮 *QUIZ*\n\n${q.pergunta}`;
}

function responderQuiz(chatId, resposta) {
  const s = sessions[chatId];
  const acertou = (resposta || "").trim().toLowerCase() === s.resposta;
  limparSessao(chatId);
  return { fim: true, venceu: acertou, msg: acertou ? "🎉 Resposta correta!" : `❌ Errou! A resposta era *${s.resposta}*.` };
}

// ---------------------------------------------------------------------
// QUIZ DE ANIMAIS
// ---------------------------------------------------------------------
const perguntasAnimais = [
  { pergunta: "Qual é o maior mamífero do mundo?", resposta: "baleia azul" },
  { pergunta: "Qual animal é conhecido como 'rei da selva'?", resposta: "leao" },
  { pergunta: "Quantas patas tem uma aranha?", resposta: "8" },
  { pergunta: "Qual é o animal terrestre mais rápido?", resposta: "guepardo" },
  { pergunta: "Qual ave não voa e é a maior do mundo?", resposta: "avestruz" },
];

function normalizar(txt) {
  return (txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function iniciarQuizAnimais(chatId) {
  const q = perguntasAnimais[Math.floor(Math.random() * perguntasAnimais.length)];
  sessions[chatId] = { type: "quizanimais", pergunta: q.pergunta, resposta: normalizar(q.resposta) };
  return `🐾 *QUIZ DE ANIMAIS*\n\n${q.pergunta}`;
}

function responderQuizAnimais(chatId, resposta) {
  const s = sessions[chatId];
  const acertou = normalizar(resposta) === s.resposta;
  if (acertou) limparSessao(chatId);
  return {
    fim: acertou,
    venceu: acertou,
    msg: acertou ? "🎉 Resposta correta!" : "❌ Errou, tenta de novo (ou use /revelarquiz).",
  };
}

function revelarQuizAnimais(chatId) {
  const s = sessions[chatId];
  if (!s || s.type !== "quizanimais") return null;
  limparSessao(chatId);
  return s.resposta;
}

// ---------------------------------------------------------------------
// ANAGRAMA
// ---------------------------------------------------------------------
const palavrasAnagrama = ["cachorro", "elefante", "girassol", "montanha", "biblioteca", "futebol"];

function embaralhar(palavra) {
  const letras = palavra.split("");
  for (let i = letras.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letras[i], letras[j]] = [letras[j], letras[i]];
  }
  const embaralhada = letras.join("");
  return embaralhada === palavra ? embaralhar(palavra) : embaralhada;
}

function iniciarAnagrama(chatId) {
  const palavra = palavrasAnagrama[Math.floor(Math.random() * palavrasAnagrama.length)];
  sessions[chatId] = { type: "anagrama", palavra };
  return `🔤 *ANAGRAMA*\n\nDesembaralhe: *${embaralhar(palavra).toUpperCase()}*`;
}

function tentarAnagrama(chatId, tentativa) {
  const s = sessions[chatId];
  const acertou = normalizar(tentativa) === normalizar(s.palavra);
  if (acertou) limparSessao(chatId);
  return { fim: acertou, venceu: acertou, msg: acertou ? `🎉 Isso aí! Era *${s.palavra}*.` : "❌ Errou, tenta de novo (ou use /revelaranagrama)." };
}

function revelarAnagrama(chatId) {
  const s = sessions[chatId];
  if (!s || s.type !== "anagrama") return null;
  limparSessao(chatId);
  return s.palavra;
}

// ---------------------------------------------------------------------
// JOGO DA VELHA (2 jogadores)
// ---------------------------------------------------------------------
function novoTabuleiro() {
  return Array(9).fill(null);
}

function renderVelha(board) {
  const s = board.map((v, i) => (v ? (v === "X" ? "❌" : "⭕") : `${i + 1}️⃣`));
  return `${s[0]}${s[1]}${s[2]}\n${s[3]}${s[4]}${s[5]}\n${s[6]}${s[7]}${s[8]}`;
}

function checarVencedorVelha(board) {
  const linhas = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of linhas) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((v) => v)) return "empate";
  return null;
}

function iniciarVelha(chatId, jogador1, jogador2) {
  sessions[chatId] = {
    type: "velha",
    board: novoTabuleiro(),
    jogadores: [jogador1, jogador2],
    turno: 0,
  };
  return `🎮 *JOGO DA VELHA*\n\n${renderVelha(sessions[chatId].board)}\n\nVez de quem for ❌ jogar (mande um número de 1 a 9).`;
}

function jogarVelha(chatId, jid, posicaoTexto) {
  const s = sessions[chatId];
  if (s.jogadores[s.turno] !== jid) return { fim: false, msg: null };
  const pos = parseInt(posicaoTexto, 10) - 1;
  if (isNaN(pos) || pos < 0 || pos > 8 || s.board[pos]) {
    return { fim: false, msg: "Posição inválida ou já ocupada. Escolhe de 1 a 9." };
  }
  s.board[pos] = s.turno === 0 ? "X" : "O";
  const resultado = checarVencedorVelha(s.board);

  if (resultado === "empate") {
    limparSessao(chatId);
    return { fim: true, empate: true, msg: `${renderVelha(s.board)}\n\n🤝 Deu empate!` };
  }
  if (resultado) {
    const vencedor = s.jogadores[s.turno];
    limparSessao(chatId);
    return { fim: true, vencedor, msg: `${renderVelha(s.board)}\n\n🎉 Vitória!` };
  }
  s.turno = s.turno === 0 ? 1 : 0;
  return { fim: false, proximo: s.jogadores[s.turno], msg: `${renderVelha(s.board)}\n\nVez do próximo jogador (número de 1 a 9).` };
}

// ---------------------------------------------------------------------
// CAMPO MINADO (solo, grade 5x5)
// ---------------------------------------------------------------------
function gerarCampoMinado(tamanho = 5, minas = 4) {
  const total = tamanho * tamanho;
  const posicoesMinas = new Set();
  while (posicoesMinas.size < minas) {
    posicoesMinas.add(Math.floor(Math.random() * total));
  }
  return { tamanho, minas: posicoesMinas, reveladas: new Set() };
}

function renderCampoMinado(campo) {
  let out = "";
  for (let i = 0; i < campo.tamanho * campo.tamanho; i++) {
    if (campo.reveladas.has(i)) out += "🟩";
    else out += `${(i + 1).toString().padStart(2, "0")}`;
    out += i % campo.tamanho === campo.tamanho - 1 ? "\n" : " ";
  }
  return out;
}

function iniciarCampoMinado(chatId) {
  const campo = gerarCampoMinado(5, 4);
  sessions[chatId] = { type: "campominado", campo };
  return `💣 *CAMPO MINADO*\n\n${renderCampoMinado(campo)}\n\nMande o número da casa que quer abrir (1 a 25). ${campo.minas.size} minas escondidas.`;
}

function abrirCasaCampoMinado(chatId, valor) {
  const s = sessions[chatId];
  const campo = s.campo;
  const pos = parseInt(valor, 10) - 1;
  const total = campo.tamanho * campo.tamanho;
  if (isNaN(pos) || pos < 0 || pos >= total) return { fim: false, msg: `Escolhe um número de 1 a ${total}.` };
  if (campo.reveladas.has(pos)) return { fim: false, msg: "Essa casa já foi aberta." };

  if (campo.minas.has(pos)) {
    limparSessao(chatId);
    return { fim: true, venceu: false, msg: `💥 BOOM! Você pisou numa mina e perdeu.` };
  }
  campo.reveladas.add(pos);
  const venceu = campo.reveladas.size === total - campo.minas.size;
  if (venceu) {
    limparSessao(chatId);
    return { fim: true, venceu: true, msg: `${renderCampoMinado(campo)}\n\n🎉 Você limpou o campo todo!` };
  }
  return { fim: false, msg: `${renderCampoMinado(campo)}\n\nContinua...` };
}

// ---------------------------------------------------------------------
// WORDLE (palavra de 5 letras)
// ---------------------------------------------------------------------
const palavrasWordle = ["carro", "termo", "plano", "verde", "bruto", "fatia", "caixa", "gente"];

function feedbackWordle(palpite, palavra) {
  const p = normalizar(palpite).split("");
  const w = normalizar(palavra).split("");
  const resultado = p.map((letra, i) => {
    if (letra === w[i]) return "🟩";
    if (w.includes(letra)) return "🟨";
    return "⬜";
  });
  return resultado.join("");
}

function iniciarWordle(chatId) {
  const palavra = palavrasWordle[Math.floor(Math.random() * palavrasWordle.length)];
  sessions[chatId] = { type: "wordle", palavra, tentativas: 0, maxTentativas: 6, historico: [] };
  return `🟩 *WORDLE*\n\nAdivinhe a palavra de 5 letras! Você tem 6 tentativas.`;
}

function tentarWordle(chatId, palpite) {
  const s = sessions[chatId];
  const limpo = normalizar(palpite);
  if (limpo.length !== 5) return { fim: false, msg: "A palavra precisa ter 5 letras." };

  s.tentativas++;
  const fb = feedbackWordle(limpo, s.palavra);
  s.historico.push(`${fb}  ${limpo.toUpperCase()}`);

  if (limpo === normalizar(s.palavra)) {
    limparSessao(chatId);
    return { fim: true, venceu: true, msg: `${s.historico.join("\n")}\n\n🎉 Acertou em ${s.tentativas} tentativa(s)!` };
  }
  if (s.tentativas >= s.maxTentativas) {
    limparSessao(chatId);
    return { fim: true, venceu: false, msg: `${s.historico.join("\n")}\n\n💀 Acabaram as tentativas! Era *${s.palavra}*.` };
  }
  return { fim: false, msg: `${s.historico.join("\n")}\n\nTentativa ${s.tentativas}/${s.maxTentativas}` };
}

// ---------------------------------------------------------------------
// MASTERMIND (4 dígitos, 0-9, sem repetir)
// ---------------------------------------------------------------------
function gerarSegredoMastermind() {
  const digitos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digitos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digitos[i], digitos[j]] = [digitos[j], digitos[i]];
  }
  return digitos.slice(0, 4);
}

function iniciarMastermind(chatId) {
  sessions[chatId] = { type: "mastermind", segredo: gerarSegredoMastermind(), tentativas: 0, maxTentativas: 10 };
  return `🧠 *MASTERMIND*\n\nAdivinhe a combinação secreta de 4 dígitos diferentes (0-9). Você tem 10 tentativas.\nMande no formato: 1234`;
}

function tentarMastermind(chatId, palpiteTexto) {
  const s = sessions[chatId];
  const palpite = (palpiteTexto || "").replace(/\D/g, "").split("").map(Number);
  if (palpite.length !== 4 || new Set(palpite).size !== 4) {
    return { fim: false, msg: "Manda 4 dígitos diferentes, tipo: 1234" };
  }

  s.tentativas++;
  let certos = 0;
  let posErrada = 0;
  palpite.forEach((d, i) => {
    if (s.segredo[i] === d) certos++;
    else if (s.segredo.includes(d)) posErrada++;
  });

  if (certos === 4) {
    limparSessao(chatId);
    return { fim: true, venceu: true, msg: `🎉 Acertou em ${s.tentativas} tentativa(s)! Era *${s.segredo.join("")}*.` };
  }
  if (s.tentativas >= s.maxTentativas) {
    limparSessao(chatId);
    return { fim: true, venceu: false, msg: `💀 Acabaram as tentativas! Era *${s.segredo.join("")}*.` };
  }
  return { fim: false, msg: `🎯 ${certos} certo(s) na posição certa | 🔄 ${posErrada} certo(s) na posição errada\nTentativa ${s.tentativas}/${s.maxTentativas}` };
}

// ---------------------------------------------------------------------
// CIDADE DORME (versão simplificada, distribui papéis por DM)
// ---------------------------------------------------------------------
function sortearPapeisCidadeDorme(participantes) {
  const embaralhados = [...participantes];
  for (let i = embaralhados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhados[i], embaralhados[j]] = [embaralhados[j], embaralhados[i]];
  }
  const qtdMafia = Math.max(1, Math.floor(embaralhados.length / 4));
  const papeis = {};
  embaralhados.forEach((jid, i) => {
    papeis[jid] = i < qtdMafia ? "🔪 Máfia" : "🙂 Cidadão";
  });
  return papeis;
}

// ---------------------------------------------------------------------
// PEDRA, PAPEL, TESOURA
// ---------------------------------------------------------------------
function jogarPPT(escolhaJogador) {
  const opcoes = ["pedra", "papel", "tesoura"];
  const escolha = normalizar(escolhaJogador);
  if (!opcoes.includes(escolha)) return null;
  const bot = opcoes[Math.floor(Math.random() * 3)];
  let resultado;
  if (escolha === bot) resultado = "empate";
  else if (
    (escolha === "pedra" && bot === "tesoura") ||
    (escolha === "papel" && bot === "pedra") ||
    (escolha === "tesoura" && bot === "papel")
  ) {
    resultado = "venceu";
  } else {
    resultado = "perdeu";
  }
  return { bot, resultado };
}

// ---------------------------------------------------------------------
// DADO / MOEDA
// ---------------------------------------------------------------------
function dado() {
  return Math.floor(Math.random() * 6) + 1;
}

function moeda() {
  return Math.random() < 0.5 ? "Cara" : "Coroa";
}

// ---------------------------------------------------------------------
// EU NUNCA / VERDADE OU DESAFIO
// ---------------------------------------------------------------------
const euNuncaLista = [
  "Eu nunca... colei numa prova.",
  "Eu nunca... dormi numa aula/reunião.",
  "Eu nunca... menti pra sair de um compromisso.",
  "Eu nunca... stalkeei o perfil de alguém à noite.",
  "Eu nunca... fingi que não vi a mensagem de alguém.",
];

const verdadeLista = [
  "Verdade: qual foi a mentira mais boba que você já contou?",
  "Verdade: quem daqui você chamaria pra sair?",
  "Verdade: qual seu maior medo bobo?",
];

const desafioLista = [
  "Desafio: manda um áudio cantando por 10 segundos.",
  "Desafio: troca o nome no grupo por 5 minutos.",
  "Desafio: manda a última foto da sua galeria (se puder).",
];

function euNunca() {
  return euNuncaLista[Math.floor(Math.random() * euNuncaLista.length)];
}

function verdadeOuDesafio() {
  const lista = Math.random() < 0.5 ? verdadeLista : desafioLista;
  return lista[Math.floor(Math.random() * lista.length)];
}

// ---------------------------------------------------------------------
// DISPATCHER GENÉRICO
// ---------------------------------------------------------------------
function processarResposta(chatId, jid, texto) {
  const tipo = getSessionType(chatId);
  if (!tipo) return null;
  switch (tipo) {
    case "forca":
      return tentarLetraForca(chatId, texto);
    case "adivinha":
      return tentarAdivinha(chatId, texto);
    case "quiz":
      return responderQuiz(chatId, texto);
    case "quizanimais":
      return responderQuizAnimais(chatId, texto);
    case "anagrama":
      return tentarAnagrama(chatId, texto);
    case "velha":
      return jogarVelha(chatId, jid, texto);
    case "campominado":
      return abrirCasaCampoMinado(chatId, texto);
    case "wordle":
      return tentarWordle(chatId, texto);
    case "mastermind":
      return tentarMastermind(chatId, texto);
    default:
      return null;
  }
}

module.exports = {
  getSessionType,
  limparSessao,
  processarResposta,
  iniciarForca,
  revelarForca,
  iniciarAdivinha,
  iniciarQuiz,
  iniciarQuizAnimais,
  revelarQuizAnimais,
  iniciarAnagrama,
  revelarAnagrama,
  iniciarVelha,
  renderVelha,
  iniciarCampoMinado,
  iniciarWordle,
  iniciarMastermind,
  sortearPapeisCidadeDorme,
  jogarPPT,
  dado,
  moeda,
  euNunca,
  verdadeOuDesafio,
};
