// Sistema de "Tinder" fictício — roleplay de namoro/casamento entre membros
// do grupo. Tudo é brincadeira interna, não envolve nenhum dado real de
// terceiros: só nome, idade, gênero, bio etc. que a própria pessoa escolhe
// informar sobre si mesma.

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "tinder.json");
const PHOTO_DIR = path.join(__dirname, "..", "data", "tinder_photos");

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return { profiles: {}, relationships: {}, pending: {} };
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function getProfile(jid) {
  return load().profiles[jid] || null;
}

function criarPerfil(jid, nome) {
  const data = load();
  if (data.profiles[jid]) return false;
  data.profiles[jid] = {
    nome: nome || "Sem nome",
    idade: null,
    genero: null,
    filtro: null,
    sexualidade: null,
    bio: "Sem bio ainda.",
    temFoto: false,
    criadoEm: new Date().toISOString(),
  };
  save(data);
  return true;
}

function apagarPerfil(jid) {
  const data = load();
  if (!data.profiles[jid]) return false;
  delete data.profiles[jid];
  // também limpa relacionamento e pedidos pendentes envolvendo essa pessoa
  delete data.relationships[jid];
  for (const [k, v] of Object.entries(data.relationships)) {
    if (v.with === jid) delete data.relationships[k];
  }
  for (const [k, v] of Object.entries(data.pending)) {
    if (k === jid || v.from === jid) delete data.pending[k];
  }
  save(data);
  return true;
}

function atualizarCampo(jid, campo, valor) {
  const data = load();
  if (!data.profiles[jid]) return false;
  data.profiles[jid][campo] = valor;
  save(data);
  return true;
}

function marcarFoto(jid) {
  return atualizarCampo(jid, "temFoto", true);
}

function perfilAleatorio(jidExcluir) {
  const data = load();
  const candidatos = Object.keys(data.profiles).filter((j) => j !== jidExcluir);
  if (candidatos.length === 0) return null;
  const jid = candidatos[Math.floor(Math.random() * candidatos.length)];
  return { jid, ...data.profiles[jid] };
}

function relacionamentoAtual(jid) {
  const data = load();
  return data.relationships[jid] || null;
}

function criarPedido(fromJid, toJid, tipo) {
  const data = load();
  if (data.pending[toJid]) return { erro: "já existe um pedido pendente para essa pessoa" };
  if (data.relationships[toJid]) return { erro: "essa pessoa já está em um relacionamento" };
  if (data.relationships[fromJid]) return { erro: "você já está em um relacionamento" };
  data.pending[toJid] = { from: fromJid, tipo, criadoEm: new Date().toISOString() };
  save(data);
  return { ok: true };
}

function cancelarPedido(fromJid) {
  const data = load();
  const alvo = Object.entries(data.pending).find(([, v]) => v.from === fromJid);
  if (!alvo) return false;
  delete data.pending[alvo[0]];
  save(data);
  return true;
}

function aceitarPedido(toJid) {
  const data = load();
  const pedido = data.pending[toJid];
  if (!pedido) return null;
  delete data.pending[toJid];
  data.relationships[toJid] = { tipo: pedido.tipo, with: pedido.from, desde: new Date().toISOString() };
  data.relationships[pedido.from] = { tipo: pedido.tipo, with: toJid, desde: new Date().toISOString() };
  save(data);
  return { with: pedido.from, tipo: pedido.tipo };
}

function recusarPedido(toJid) {
  const data = load();
  const pedido = data.pending[toJid];
  if (!pedido) return null;
  delete data.pending[toJid];
  save(data);
  return { from: pedido.from };
}

function terminarRelacionamento(jid, tipoEsperado) {
  const data = load();
  const rel = data.relationships[jid];
  if (!rel || rel.tipo !== tipoEsperado) return null;
  const parceiro = rel.with;
  delete data.relationships[jid];
  delete data.relationships[parceiro];
  save(data);
  return { with: parceiro };
}

function listarCasamentos() {
  const data = load();
  const vistos = new Set();
  const casais = [];
  for (const [jid, rel] of Object.entries(data.relationships)) {
    if (rel.tipo !== "casamento") continue;
    const chave = [jid, rel.with].sort().join("|");
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    casais.push({ a: jid, b: rel.with, desde: rel.desde });
  }
  return casais;
}

function photoPath(jid) {
  return path.join(PHOTO_DIR, `${jid.replace(/[^0-9a-zA-Z]/g, "_")}.jpg`);
}

module.exports = {
  getProfile,
  criarPerfil,
  apagarPerfil,
  atualizarCampo,
  marcarFoto,
  perfilAleatorio,
  relacionamentoAtual,
  criarPedido,
  cancelarPedido,
  aceitarPedido,
  recusarPedido,
  terminarRelacionamento,
  listarCasamentos,
  photoPath,
  PHOTO_DIR,
};
