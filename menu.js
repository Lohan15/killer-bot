const config = require("../config");

function header() {
  return (
    "ꪶ╌┈───────╌╌╌┈⊰••⊱╌╌╌┈───────╌╌ꫂ\n" +
    "┏┳━┳┓\n" +
    "┃┃┃┃┣━┳┓┏━┳━┳━━┳━┓\n" +
    "┃┃┃┃┃┻┫┗┫━┫╋┃┃┃┃┻┫\n" +
    "┗━┻━┻━┻━┻━┻━┻┻┻┻━┛\n" +
    `ㅤㅤㅤㅤㅤ𝗞𝗜𝗟𝗟𝗘𝗥 𝗕𝗢𝗧\n` +
    "ꪶ╌┈───────╌╌╌┈⊰••⊱╌╌╌┈───────╌╌ꫂ"
  );
}

function menuPrincipal({ nick, vip, totalUsers }) {
  const data = new Date();
  return `${header()}

『 𝐈͢𝐍𝐅͢𝐎 』
╔╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╗
⏤͟͟͞͞ ꦿ𝙉𝙄͢𝘾𝙆: ${nick}
⏤͟͟͞͞ ꦿ𝘿𝘼͢𝙏𝘼: ${data.toLocaleDateString("pt-BR")}
⏤͟͟͞͞ ꦿ𝙃𝙊͢𝙍𝘼: ${data.toLocaleTimeString("pt-BR")}
⏤͟͟͞͞ ꦿ𝙑͢𝙄𝙋: ${vip ? "Sim ✅" : "Não ❌"}
⏤͟͟͞͞ ꦿ𝙏𝙊͢𝙏𝘼𝙇 𝘿͢𝙀 𝙐͢𝙎𝙐𝘼́𝙍͢𝙄𝙊𝙎 ->『 ${totalUsers} 』
╚╗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╔╝

ㅤㅤㅤㅤㅤ『 𝐌͢𝐄𝐍͢𝐔𝐒 』
╚╗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╔╝
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}menuadm
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}menutinder
 ┋ ೈ፝͜͡🤪 ${config.prefix}menuzoeira
 ┋ ೈ፝͜͡🎮 ${config.prefix}menujogos
 ┋ ೈ፝͜͡🤖 ${config.prefix}ping
 ┋ ೈ፝͜͡👤 ${config.prefix}perfil
 ┋ ೈ፝͜͡🆘 ${config.prefix}help
╚╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╝`;
}

function menuAdm() {
  return `${header()}

ㅤㅤㅤㅤㅤ『 𝐌͢𝐄𝐍͢𝐔 𝐀͢𝐃𝐌𝐈͢𝐍 』
╚╗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╔╝
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}ban @user
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}promover @user
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}rebaixar @user
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}mute @user
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}desmute @user
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}fechargp
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}abrirgp
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}linkgp
 ┋ ೈ፝͜͡🧑🏼‍💻 ${config.prefix}antilink on/off
╚╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╝`;
}

function menuZoeira() {
  return `${header()}

ㅤㅤㅤㅤㅤ『 𝐌͢𝐄𝐍͢𝐔 𝐙͢𝐎𝐄𝐈͢𝐑𝐀 』
╚╗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╔╝
 ┋ ೈ፝͜͡🤪 ${config.prefix}roleta
 ┋ ೈ፝͜͡🤪 ${config.prefix}piada
 ┋ ೈ፝͜͡🤪 ${config.prefix}fato
 ┋ ೈ፝͜͡🤪 ${config.prefix}elogio
 ┋ ೈ፝͜͡🤪 ${config.prefix}indireta
 ┋ ೈ፝͜͡🤪 ${config.prefix}cantada
 ┋ ೈ፝͜͡🤪 ${config.prefix}trocadilho
 ┋ ೈ፝͜͡🤪 ${config.prefix}shipp @user1 @user2
╚╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╝`;
}

function menuTinder() {
  return `${header()}

ㅤㅤㅤㅤㅤ『 𝐌͢𝐄𝐍͢𝐔 𝐓͢𝐈𝐍𝐃𝐄͢𝐑 』
╚╗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╔╝
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}rgtinder <nome>
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}meutinder
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}tinder
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}tindernome <nome>
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}tinderidade <idade>
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}setgene <texto>
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}setfiltro <texto>
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}setsex <texto>
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}tinderbio <texto>
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}tinderfoto (marcar foto)
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}sairtinder
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}namoracomigo @user
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}terminar
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}casacomigo @user
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}divorciar
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}cancelar
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}aceitar
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}recusar
 ┋ ೈ፝͜͡❤️‍🔥 ${config.prefix}listacasamento
╚╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╝`;
}

function menuJogos() {
  return `${header()}

ㅤㅤㅤㅤㅤ『 𝐌͢𝐄𝐍͢𝐔 𝐉͢𝐎𝐆𝐎𝐒 』
╚╗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╔╝
 ┋ ೈ፝͜͡🎮 ${config.prefix}jogodavelha @user
 ┋ ೈ፝͜͡🎮 ${config.prefix}resetvelha
 ┋ ೈ፝͜͡🎮 ${config.prefix}anagrama
 ┋ ೈ፝͜͡🎮 ${config.prefix}revelaranagrama
 ┋ ೈ፝͜͡🎮 ${config.prefix}quizanimais
 ┋ ೈ፝͜͡🎮 ${config.prefix}revelarquiz
 ┋ ೈ፝͜͡🎮 ${config.prefix}eununca
 ┋ ೈ፝͜͡🎮 ${config.prefix}vdddsf
 ┋ ೈ፝͜͡🎮 ${config.prefix}forca
 ┋ ೈ፝͜͡🎮 ${config.prefix}rfc
 ┋ ೈ፝͜͡🎮 ${config.prefix}campominado
 ┋ ೈ፝͜͡🎮 ${config.prefix}resetmina
 ┋ ೈ፝͜͡🎮 ${config.prefix}cassino
 ┋ ೈ፝͜͡🎮 ${config.prefix}ppt pedra/papel/tesoura
 ┋ ೈ፝͜͡🎮 ${config.prefix}dado
 ┋ ೈ፝͜͡🎮 ${config.prefix}caraoucoroa
 ┋ ೈ፝͜͡🎮 ${config.prefix}adivinharnmr
 ┋ ೈ፝͜͡🎮 ${config.prefix}wordle
 ┋ ೈ፝͜͡🎮 ${config.prefix}stopwordle
 ┋ ೈ፝͜͡🎮 ${config.prefix}mastermind
 ┋ ೈ፝͜͡🎮 ${config.prefix}stopmm
 ┋ ೈ፝͜͡🎮 ${config.prefix}cidadedorme @p1 @p2 @p3
 ┋ ೈ፝͜͡🎮 ${config.prefix}stopcidadedorme
 ┋ ೈ፝͜͡🎮 ${config.prefix}rank
╚╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╝`;
}

module.exports = { menuPrincipal, menuAdm, menuZoeira, menuJogos, menuTinder };
