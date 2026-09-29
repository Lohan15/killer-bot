// Comandos administrativos de grupo usando a API do Baileys.
// Todos exigem que o BOT seja admin do grupo para funcionar.

async function ban(sock, groupId, targetJid) {
  await sock.groupParticipantsUpdate(groupId, [targetJid], "remove");
}

async function promover(sock, groupId, targetJid) {
  await sock.groupParticipantsUpdate(groupId, [targetJid], "promote");
}

async function rebaixar(sock, groupId, targetJid) {
  await sock.groupParticipantsUpdate(groupId, [targetJid], "demote");
}

async function fecharGrupo(sock, groupId) {
  await sock.groupSettingUpdate(groupId, "announcement"); // só admins enviam mensagem
}

async function abrirGrupo(sock, groupId) {
  await sock.groupSettingUpdate(groupId, "not_announcement"); // todos podem enviar
}

async function pegarLink(sock, groupId) {
  const code = await sock.groupInviteCode(groupId);
  return `https://chat.whatsapp.com/${code}`;
}

// Mute: mantemos uma lista em memória de números mutados por grupo.
// Quando o usuário mutado manda mensagem, o bot apaga (precisa ser admin).
const mutados = {}; // groupId -> Set(jid)

function mutar(groupId, jid) {
  if (!mutados[groupId]) mutados[groupId] = new Set();
  mutados[groupId].add(jid);
}

function desmutar(groupId, jid) {
  if (mutados[groupId]) mutados[groupId].delete(jid);
}

function estaMutado(groupId, jid) {
  return mutados[groupId] && mutados[groupId].has(jid);
}

async function apagarMensagem(sock, groupId, messageKey) {
  await sock.sendMessage(groupId, { delete: messageKey });
}

module.exports = {
  ban,
  promover,
  rebaixar,
  fecharGrupo,
  abrirGrupo,
  pegarLink,
  mutar,
  desmutar,
  estaMutado,
  apagarMensagem,
};
