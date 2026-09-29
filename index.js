const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const pino = require("pino");
const qrcode = require("qrcode-terminal");

const config = require("./config");
const menu = require("./lib/menu");
const zoeira = require("./lib/zoeira");
const games = require("./lib/games");
const admin = require("./lib/admin");
const stats = require("./lib/stats");
const rank = require("./lib/rank");
const tinder = require("./lib/tinder");

function mention(jid) {
  return `@${jid.split("@")[0]}`;
}

const antilinkAtivo = {}; // groupId -> boolean
const cidadeDormeSessions = {}; // groupId -> { jid: papel }

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\nEscaneie o QR code abaixo com o WhatsApp (Aparelhos conectados):\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Conexão fechada.", shouldReconnect ? "Reconectando..." : "Deslogado.");
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log(`✅ ${config.botName} BOT conectado com sucesso!`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const chatId = m.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    const senderJid = isGroup ? m.key.participant : chatId;

    const texto =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      "";

    stats.registerUser(senderJid);

    // Antilink: apaga links de grupo do WhatsApp se ativado
    if (isGroup && antilinkAtivo[chatId] && /chat\.whatsapp\.com\//.test(texto)) {
      try {
        await admin.apagarMensagem(sock, chatId, m.key);
        await sock.sendMessage(chatId, {
          text: "🚫 Link de grupo não é permitido aqui!",
        });
      } catch (e) {
        console.log("Não consegui apagar (o bot precisa ser admin):", e.message);
      }
      return;
    }

    // Se existe uma sessão de jogo ativa nesse chat e a mensagem não é comando,
    // trata como resposta do jogo.
    if (!texto.startsWith(config.prefix) && games.getSessionType(chatId)) {
      const resultado = games.processarResposta(chatId, senderJid, texto.trim());
      if (resultado && resultado.msg) {
        if (resultado.fim && (resultado.venceu || resultado.vencedor)) {
          const vencedorJid = resultado.vencedor || senderJid;
          rank.addPoint(vencedorJid, m.pushName || vencedorJid);
        }
        const mentions = resultado.vencedor ? [resultado.vencedor] : [];
        await sock.sendMessage(chatId, { text: resultado.msg, mentions }, { quoted: m });
      }
      return;
    }

    if (!texto.startsWith(config.prefix)) return;

    const [cmdRaw, ...args] = texto.slice(config.prefix.length).trim().split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: m });

    try {
      switch (cmd) {
        // ---------- MENUS ----------
        case "menu":
        case "start":
          await reply(
            menu.menuPrincipal({
              nick: m.pushName || "Usuário",
              vip: config.vip,
              totalUsers: stats.totalUsers(),
            })
          );
          break;
        case "menuadm":
          await reply(menu.menuAdm());
          break;
        case "menuzoeira":
          await reply(menu.menuZoeira());
          break;
        case "menujogos":
          await reply(menu.menuJogos());
          break;
        case "menutinder":
          await reply(menu.menuTinder());
          break;

        // ---------- GERAL ----------
        case "ping":
          await reply("🏓 Pong! Bot online.");
          break;
        case "perfil":
          await reply(`👤 *PERFIL*\n\nNome: ${m.pushName || "Desconhecido"}\nID: ${senderJid}`);
          break;
        case "help":
          await reply(`Use ${config.prefix}menu para ver todas as opções.`);
          break;

        // ---------- ZOEIRA ----------
        case "piada":
          await reply(zoeira.piada());
          break;
        case "fato":
          await reply(`🧠 Você sabia? ${zoeira.fato()}`);
          break;
        case "elogio":
          await reply(zoeira.elogio());
          break;
        case "indireta":
          await reply(zoeira.indireta());
          break;
        case "cantada":
          await reply(zoeira.cantada());
          break;
        case "trocadilho":
          await reply(zoeira.trocadilho());
          break;
        case "roleta": {
          if (!isGroup) {
            await reply("Esse comando só funciona em grupos.");
            break;
          }
          const meta = await sock.groupMetadata(chatId);
          const participantes = meta.participants.map((p) => p.id).filter((id) => id !== senderJid);
          const sorteado = zoeira.roleta(participantes);
          await sock.sendMessage(chatId, {
            text: `🔫 A roleta apontou para @${sorteado.split("@")[0]}!`,
            mentions: [sorteado],
          });
          break;
        }

        // ---------- JOGOS ----------
        case "forca":
          await reply(games.iniciarForca(chatId));
          break;
        case "adivinha":
          await reply(games.iniciarAdivinha(chatId));
          break;
        case "quiz":
          await reply(games.iniciarQuiz(chatId));
          break;
        case "dado":
          await reply(`🎲 Você tirou: *${games.dado()}*`);
          break;
        case "moeda":
          await reply(`🪙 Deu: *${games.moeda()}*`);
          break;
        case "adivinharnmr":
          await reply(games.iniciarAdivinha(chatId));
          break;
        case "caraoucoroa":
          await reply(`🪙 Deu: *${games.moeda()}*`);
          break;
        case "rfc": {
          const palavra = games.revelarForca(chatId);
          await reply(palavra ? `A palavra era *${palavra}*.` : "Não tem jogo da forca ativo nesse chat.");
          break;
        }
        case "rank": {
          const top = rank.topRank(10);
          if (top.length === 0) {
            await reply("Ninguém pontuou ainda. Jogue para entrar no ranking!");
          } else {
            const lista = top
              .map((u, i) => `${i + 1}. ${u.name} - ${u.points} pts`)
              .join("\n");
            await reply(`🏆 *RANKING*\n\n${lista}`);
          }
          break;
        }
        case "quizanimais":
          await reply(games.iniciarQuizAnimais(chatId));
          break;
        case "revelarquiz": {
          const resp = games.revelarQuizAnimais(chatId);
          await reply(resp ? `A resposta era *${resp}*.` : "Não tem quiz de animais ativo nesse chat.");
          break;
        }
        case "anagrama":
          await reply(games.iniciarAnagrama(chatId));
          break;
        case "revelaranagrama": {
          const palavra = games.revelarAnagrama(chatId);
          await reply(palavra ? `A palavra era *${palavra}*.` : "Não tem anagrama ativo nesse chat.");
          break;
        }
        case "jogodavelha": {
          if (!isGroup) { await reply("Só funciona em grupos."); break; }
          if (games.getSessionType(chatId)) { await reply("Já tem um jogo rolando nesse chat. Use /resetvelha para cancelar."); break; }
          const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid;
          if (!mentioned || !mentioned.length) { await reply("Marque com quem você quer jogar: /jogodavelha @pessoa"); break; }
          const oponente = mentioned[0];
          if (oponente === senderJid) { await reply("Chama outra pessoa pra jogar 😅"); break; }
          const texto2 = games.iniciarVelha(chatId, senderJid, oponente);
          await sock.sendMessage(chatId, { text: texto2, mentions: [senderJid, oponente] });
          break;
        }
        case "resetvelha":
          if (games.getSessionType(chatId) === "velha") { games.limparSessao(chatId); await reply("🔄 Jogo da velha cancelado."); }
          else await reply("Não tem jogo da velha ativo nesse chat.");
          break;
        case "campominado":
          await reply(games.iniciarCampoMinado(chatId));
          break;
        case "resetmina":
          if (games.getSessionType(chatId) === "campominado") { games.limparSessao(chatId); await reply("🔄 Campo minado reiniciado."); }
          else await reply("Não tem campo minado ativo nesse chat.");
          break;
        case "wordle":
          await reply(games.iniciarWordle(chatId));
          break;
        case "stopwordle":
          if (games.getSessionType(chatId) === "wordle") { games.limparSessao(chatId); await reply("🔄 Wordle encerrado."); }
          else await reply("Não tem wordle ativo nesse chat.");
          break;
        case "mastermind":
          await reply(games.iniciarMastermind(chatId));
          break;
        case "stopmm":
          if (games.getSessionType(chatId) === "mastermind") { games.limparSessao(chatId); await reply("🔄 Mastermind encerrado."); }
          else await reply("Não tem mastermind ativo nesse chat.");
          break;
        case "ppt": {
          if (!args[0]) { await reply(`Use: ${config.prefix}ppt pedra/papel/tesoura`); break; }
          const resultadoPPT = games.jogarPPT(args[0]);
          if (!resultadoPPT) { await reply("Escolha pedra, papel ou tesoura."); break; }
          const txt = resultadoPPT.resultado === "empate" ? "🤝 Empate!" : resultadoPPT.resultado === "venceu" ? "🎉 Você venceu!" : "💀 Você perdeu!";
          if (resultadoPPT.resultado === "venceu") rank.addPoint(senderJid, m.pushName || senderJid);
          await reply(`Você: ${args[0]} | Bot: ${resultadoPPT.bot}\n\n${txt}`);
          break;
        }
        case "eununca":
          await reply(`🍻 ${games.euNunca()}`);
          break;
        case "vdddsf":
          await reply(`🎯 ${games.verdadeOuDesafio()}`);
          break;
        case "cassino": {
          const reels = ["🍒", "🍋", "🍇", "🔔", "💎", "7️⃣"];
          const spin = [0, 0, 0].map(() => reels[Math.floor(Math.random() * reels.length)]);
          const ganhou = spin[0] === spin[1] && spin[1] === spin[2];
          if (ganhou) rank.addPoint(senderJid, m.pushName || senderJid);
          await reply(`🎰 [ ${spin.join(" | ")} ]\n\n${ganhou ? "🎉 Deu a combinação! Você ganhou." : "💨 Não dessa vez, tenta de novo."}`);
          break;
        }
        case "cidadedorme": {
          if (!isGroup) { await reply("Só funciona em grupos."); break; }
          const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
          if (mentioned.length < 3) { await reply("Marque pelo menos 3 pessoas: /cidadedorme @p1 @p2 @p3 ..."); break; }
          const papeis = games.sortearPapeisCidadeDorme(mentioned);
          cidadeDormeSessions[chatId] = papeis;
          for (const [jid, papel] of Object.entries(papeis)) {
            try {
              await sock.sendMessage(jid, { text: `🌙 *CIDADE DORME*\n\nSeu papel nessa partida: ${papel}\n\nMantenha em segredo!` });
            } catch (e) {
              console.log("Não consegui mandar DM pra", jid, e.message);
            }
          }
          await sock.sendMessage(chatId, {
            text: `🌙 *CIDADE DORME* começou com ${mentioned.length} jogadores!\n\nOs papéis foram enviados no privado de cada um. Conduzam a rodada de discussão/votação por aqui mesmo. Use ${config.prefix}stopcidadedorme para encerrar e revelar os papéis.`,
            mentions: mentioned,
          });
          break;
        }
        case "stopcidadedorme": {
          if (!isGroup) { await reply("Só funciona em grupos."); break; }
          const papeis = cidadeDormeSessions[chatId];
          if (!papeis) { await reply("Não tem partida de Cidade Dorme rolando aqui."); break; }
          delete cidadeDormeSessions[chatId];
          const linhas = Object.entries(papeis).map(([jid, papel]) => `${mention(jid)}: ${papel}`);
          await sock.sendMessage(chatId, {
            text: `🌅 Partida encerrada! Papéis revelados:\n\n${linhas.join("\n")}`,
            mentions: Object.keys(papeis),
          });
          break;
        }

        // ---------- ADMIN (só em grupo, só admins) ----------
        case "ban":
        case "promover":
        case "rebaixar":
        case "mute":
        case "desmute": {
          if (!isGroup) {
            await reply("Esse comando só funciona em grupos.");
            break;
          }
          const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid;
          if (!mentioned || mentioned.length === 0) {
            await reply("Marque a pessoa (@usuario) para usar esse comando.");
            break;
          }
          const target = mentioned[0];

          if (cmd === "ban") await admin.ban(sock, chatId, target);
          if (cmd === "promover") await admin.promover(sock, chatId, target);
          if (cmd === "rebaixar") await admin.rebaixar(sock, chatId, target);
          if (cmd === "mute") admin.mutar(chatId, target);
          if (cmd === "desmute") admin.desmutar(chatId, target);

          await reply(`✅ Comando *${cmd}* aplicado com sucesso.`);
          break;
        }
        case "fechargp":
          if (!isGroup) { await reply("Só funciona em grupos."); break; }
          await admin.fecharGrupo(sock, chatId);
          await reply("🔒 Grupo fechado. Só admins podem enviar mensagens.");
          break;
        case "abrirgp":
          if (!isGroup) { await reply("Só funciona em grupos."); break; }
          await admin.abrirGrupo(sock, chatId);
          await reply("🔓 Grupo aberto. Todos podem enviar mensagens.");
          break;
        case "linkgp":
          if (!isGroup) { await reply("Só funciona em grupos."); break; }
          const link = await admin.pegarLink(sock, chatId);
          await reply(`🔗 Link do grupo:\n${link}`);
          break;
        case "antilink":
          if (!isGroup) { await reply("Só funciona em grupos."); break; }
          if (args[0] === "on") {
            antilinkAtivo[chatId] = true;
            await reply("✅ Antilink ativado.");
          } else if (args[0] === "off") {
            antilinkAtivo[chatId] = false;
            await reply("❌ Antilink desativado.");
          } else {
            await reply(`Use: ${config.prefix}antilink on  ou  ${config.prefix}antilink off`);
          }
          break;

        // ---------- TINDER (roleplay de namoro/casamento) ----------
        case "rgtinder": {
          if (tinder.getProfile(senderJid)) {
            await reply("Você já tem um perfil. Use /meutinder para ver.");
            break;
          }
          const nome = args.join(" ") || m.pushName || "Sem nome";
          tinder.criarPerfil(senderJid, nome);
          await reply(
            `💘 Perfil criado, ${nome}!\n\nAgora personalize com:\n${config.prefix}tinderidade, ${config.prefix}setgene, ${config.prefix}setfiltro, ${config.prefix}setsex, ${config.prefix}tinderbio, ${config.prefix}tinderfoto`
          );
          break;
        }
        case "meutinder": {
          const p = tinder.getProfile(senderJid);
          if (!p) {
            await reply(`Você ainda não tem perfil. Use ${config.prefix}rgtinder <nome>.`);
            break;
          }
          const rel = tinder.relacionamentoAtual(senderJid);
          const relTexto = rel
            ? `\n💞 ${rel.tipo === "casamento" ? "Casado(a)" : "Namorando"} com ${mention(rel.with)}`
            : "\n💔 Solteiro(a)";
          const texto =
            `💘 *PERFIL TINDER*\n\n` +
            `Nome: ${p.nome}\n` +
            `Idade: ${p.idade ?? "não informado"}\n` +
            `Gênero: ${p.genero ?? "não informado"}\n` +
            `Sexualidade: ${p.sexualidade ?? "não informado"}\n` +
            `Filtro: ${p.filtro ?? "não informado"}\n` +
            `Bio: ${p.bio}` +
            relTexto;
          if (p.temFoto && fs.existsSync(tinder.photoPath(senderJid))) {
            await sock.sendMessage(chatId, {
              image: fs.readFileSync(tinder.photoPath(senderJid)),
              caption: texto,
              mentions: rel ? [rel.with] : [],
            });
          } else {
            await sock.sendMessage(chatId, { text: texto, mentions: rel ? [rel.with] : [] });
          }
          break;
        }
        case "tinder": {
          const p = tinder.perfilAleatorio(senderJid);
          if (!p) {
            await reply("Ainda não tem ninguém cadastrado no Tinder por aqui.");
            break;
          }
          const texto =
            `💘 *PERFIL SORTEADO*\n\n` +
            `Nome: ${p.nome}\n` +
            `Idade: ${p.idade ?? "não informado"}\n` +
            `Bio: ${p.bio}`;
          if (p.temFoto && fs.existsSync(tinder.photoPath(p.jid))) {
            await sock.sendMessage(chatId, { image: fs.readFileSync(tinder.photoPath(p.jid)), caption: texto });
          } else {
            await reply(texto);
          }
          break;
        }
        case "tindernome":
          if (!tinder.getProfile(senderJid)) { await reply(`Crie seu perfil com ${config.prefix}rgtinder primeiro.`); break; }
          if (!args.length) { await reply(`Use: ${config.prefix}tindernome <nome>`); break; }
          tinder.atualizarCampo(senderJid, "nome", args.join(" "));
          await reply("✅ Nome atualizado.");
          break;
        case "tinderidade":
          if (!tinder.getProfile(senderJid)) { await reply(`Crie seu perfil com ${config.prefix}rgtinder primeiro.`); break; }
          if (!args[0] || isNaN(parseInt(args[0]))) { await reply(`Use: ${config.prefix}tinderidade <idade>`); break; }
          tinder.atualizarCampo(senderJid, "idade", parseInt(args[0]));
          await reply("✅ Idade atualizada.");
          break;
        case "setgene":
          if (!tinder.getProfile(senderJid)) { await reply(`Crie seu perfil com ${config.prefix}rgtinder primeiro.`); break; }
          if (!args.length) { await reply(`Use: ${config.prefix}setgene <texto>`); break; }
          tinder.atualizarCampo(senderJid, "genero", args.join(" "));
          await reply("✅ Gênero atualizado.");
          break;
        case "setfiltro":
          if (!tinder.getProfile(senderJid)) { await reply(`Crie seu perfil com ${config.prefix}rgtinder primeiro.`); break; }
          if (!args.length) { await reply(`Use: ${config.prefix}setfiltro <texto>`); break; }
          tinder.atualizarCampo(senderJid, "filtro", args.join(" "));
          await reply("✅ Filtro atualizado.");
          break;
        case "setsex":
          if (!tinder.getProfile(senderJid)) { await reply(`Crie seu perfil com ${config.prefix}rgtinder primeiro.`); break; }
          if (!args.length) { await reply(`Use: ${config.prefix}setsex <texto>`); break; }
          tinder.atualizarCampo(senderJid, "sexualidade", args.join(" "));
          await reply("✅ Atualizado.");
          break;
        case "tinderbio":
          if (!tinder.getProfile(senderJid)) { await reply(`Crie seu perfil com ${config.prefix}rgtinder primeiro.`); break; }
          if (!args.length) { await reply(`Use: ${config.prefix}tinderbio <texto>`); break; }
          tinder.atualizarCampo(senderJid, "bio", args.join(" "));
          await reply("✅ Bio atualizada.");
          break;
        case "tinderfoto": {
          if (!tinder.getProfile(senderJid)) { await reply(`Crie seu perfil com ${config.prefix}rgtinder primeiro.`); break; }
          const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
          const alvoMsg = quoted ? { message: quoted } : m;
          const temImagem = quoted?.imageMessage || m.message.imageMessage;
          if (!temImagem) {
            await reply("Marque (responda) uma foto junto com o comando, ou mande a foto com a legenda /tinderfoto.");
            break;
          }
          try {
            const buffer = await downloadMediaMessage(alvoMsg, "buffer", {});
            fs.mkdirSync(tinder.PHOTO_DIR, { recursive: true });
            fs.writeFileSync(tinder.photoPath(senderJid), buffer);
            tinder.marcarFoto(senderJid);
            await reply("✅ Foto de perfil atualizada.");
          } catch (e) {
            await reply("⚠️ Não consegui baixar a foto, tenta de novo.");
          }
          break;
        }
        case "sairtinder":
          if (!tinder.apagarPerfil(senderJid)) { await reply("Você não tem perfil no Tinder."); break; }
          await reply("👋 Perfil removido do Tinder.");
          break;
        case "namoracomigo":
        case "casacomigo": {
          const tipo = cmd === "casacomigo" ? "casamento" : "namoro";
          const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid;
          if (!mentioned || !mentioned.length) { await reply("Marque a pessoa (@usuario) para fazer o pedido."); break; }
          const alvo = mentioned[0];
          if (alvo === senderJid) { await reply("Você não pode namorar/casar com você mesmo(a) 💀"); break; }
          if (!tinder.getProfile(senderJid) || !tinder.getProfile(alvo)) {
            await reply(`Os dois precisam ter perfil no Tinder (${config.prefix}rgtinder) para isso.`);
            break;
          }
          const res = tinder.criarPedido(senderJid, alvo, tipo);
          if (res.erro) { await reply(`❌ Não deu: ${res.erro}.`); break; }
          await sock.sendMessage(chatId, {
            text: `💌 ${mention(senderJid)} pediu ${tipo === "casamento" ? "em casamento" : "em namoro"} ${mention(alvo)}!\n\n${mention(alvo)}, use ${config.prefix}aceitar ou ${config.prefix}recusar.`,
            mentions: [senderJid, alvo],
          });
          break;
        }
        case "aceitar": {
          const res = tinder.aceitarPedido(senderJid);
          if (!res) { await reply("Você não tem nenhum pedido pendente."); break; }
          await sock.sendMessage(chatId, {
            text: `🎉 ${mention(senderJid)} aceitou ${res.tipo === "casamento" ? "o pedido de casamento" : "namorar"} com ${mention(res.with)}! 💍`,
            mentions: [senderJid, res.with],
          });
          break;
        }
        case "recusar": {
          const res = tinder.recusarPedido(senderJid);
          if (!res) { await reply("Você não tem nenhum pedido pendente."); break; }
          await sock.sendMessage(chatId, {
            text: `💔 ${mention(senderJid)} recusou o pedido de ${mention(res.from)}.`,
            mentions: [senderJid, res.from],
          });
          break;
        }
        case "cancelar":
          if (!tinder.cancelarPedido(senderJid)) { await reply("Você não tem nenhum pedido enviado pra cancelar."); break; }
          await reply("✅ Pedido cancelado.");
          break;
        case "terminar": {
          const res = tinder.terminarRelacionamento(senderJid, "namoro");
          if (!res) { await reply("Você não está namorando ninguém."); break; }
          await sock.sendMessage(chatId, {
            text: `💔 ${mention(senderJid)} terminou com ${mention(res.with)}.`,
            mentions: [senderJid, res.with],
          });
          break;
        }
        case "divorciar": {
          const res = tinder.terminarRelacionamento(senderJid, "casamento");
          if (!res) { await reply("Você não é casado(a) com ninguém."); break; }
          await sock.sendMessage(chatId, {
            text: `💔 ${mention(senderJid)} se divorciou de ${mention(res.with)}.`,
            mentions: [senderJid, res.with],
          });
          break;
        }
        case "listacasamento": {
          const casais = tinder.listarCasamentos();
          if (!casais.length) { await reply("Ninguém casado por aqui ainda."); break; }
          const mentions = [];
          const linhas = casais.map((c, i) => {
            mentions.push(c.a, c.b);
            return `${i + 1}. ${mention(c.a)} 💍 ${mention(c.b)}`;
          });
          await sock.sendMessage(chatId, { text: `💍 *CASAIS*\n\n${linhas.join("\n")}`, mentions });
          break;
        }

        default:
          // comando desconhecido, ignora silenciosamente
          break;
      }
    } catch (err) {
      console.error("Erro ao processar comando:", err);
      await reply("⚠️ Ocorreu um erro ao executar esse comando. (Confira se o bot é admin do grupo, quando necessário.)");
    }
  });
}

startBot();
