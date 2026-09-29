# KILLER BOT 😈🔪

Bot de WhatsApp com menu de comandos (admin, tinder, zoeira e jogos), feito
com [Baileys](https://github.com/WhiskeySockets/Baileys) — não precisa de
navegador/Chrome, só Node.js.

---

## Índice

1. [Estrutura do projeto](#estrutura-do-projeto)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação](#instalação)
4. [Rodando o bot](#rodando-o-bot)
5. [Adicionando ao seu grupo](#adicionando-ao-seu-grupo)
6. [Como testar (leia isso!)](#como-testar-leia-isso)
7. [Lista de comandos](#lista-de-comandos)
8. [Deixando o bot online 24h](#deixando-o-bot-online-24h)
9. [Problemas comuns](#problemas-comuns)
10. [O que não foi implementado (e por quê)](#o-que-não-foi-implementado-e-por-quê)

---

## Estrutura do projeto

```
killer-bot/
├── index.js          # conexão com o WhatsApp e roteamento dos comandos
├── config.js         # nome do bot, prefixo, número do dono
├── lib/
│   ├── menu.js        # texto dos menus estilizados
│   ├── zoeira.js       # piadas, cantadas, elogios, roleta russa, etc.
│   ├── games.js        # forca, velha, anagrama, wordle, mastermind, etc.
│   ├── admin.js         # ban, promover, mute, fechar/abrir grupo, antilink
│   ├── tinder.js        # roleplay de namoro/casamento entre membros
│   ├── stats.js          # contador de usuários que já usaram o bot
│   └── rank.js            # ranking de pontos dos jogos
└── data/              # onde ficam salvos os JSON de usuários, ranking e perfis
```

## Pré-requisitos

- **Node.js 18 ou superior** instalado no computador que vai rodar o bot
  (baixe em [nodejs.org](https://nodejs.org), versão LTS).
- **Um número de WhatsApp para ser o bot.** Pode ser um chip extra, um
  WhatsApp Business, ou até seu número principal — mas leia a seção
  [Como testar](#como-testar-leia-isso) antes de decidir, porque isso
  muda como você testa os comandos.
- O computador (ou servidor) precisa ficar **ligado e com internet**
  enquanto o bot estiver rodando — se desligar, o bot fica offline.

## Instalação

1. Baixe e extraia a pasta `killer-bot` no seu computador.
2. Abra um terminal **dentro da pasta** e rode:

   ```bash
   npm install
   ```

3. (Opcional) Edite `config.js`:

   ```js
   module.exports = {
     botName: "KILLER",
     prefix: "/",              // pode trocar para "!" ou outro símbolo
     ownerNumber: "55DDDNUMERO", // seu número, sem espaços/símbolos
     vip: true,
   };
   ```

## Rodando o bot

```bash
npm start
```

Vai aparecer um **QR code desenhado no terminal**. No celular que será o
bot: **WhatsApp → Configurações → Aparelhos conectados → Conectar um
aparelho** → escaneie o QR.

Depois de conectar, o terminal mostra:

```
✅ KILLER BOT conectado com sucesso!
```

A sessão fica salva na pasta `auth_info/` — nas próximas vezes que rodar
`npm start`, não precisa escanear de novo (a menos que apague essa pasta
ou desconecte pelo celular).

## Adicionando ao seu grupo

1. No WhatsApp, adicione o número que virou o bot como participante do
   grupo (normalmente, como qualquer contato).
2. Para os **comandos de admin funcionarem** (ban, mute, fechar/abrir
   grupo, promover, antilink), torne esse número **administrador do
   grupo**: toque no grupo → Ver participantes → toque no nome do bot →
   Tornar admin do grupo.

## Como testar (leia isso!)

Essa é a parte que mais confunde no início:

> **O bot ignora mensagens enviadas pelo próprio número que ele está
> usando.** Isso está no código (`m.key.fromMe`), de propósito, pra
> evitar loop de mensagens.

Ou seja: se você escanear o QR code com o **seu número pessoal** e
depois mandar `/menu` nesse mesmo grupo **usando esse mesmo número**,
**nada vai acontecer** — não é bug, é o comportamento esperado.

Formas de testar corretamente:

- **Ideal:** use um **número separado** (chip extra, WhatsApp Business,
  celular de outra pessoa) como o bot, e teste os comandos do seu
  número pessoal normal.
- **Se só tem um número:** peça pra alguém do grupo mandar os comandos
  pra você ver funcionando.
- **Se quiser que o bot também responda aos seus próprios comandos**
  (modo "self-bot"), dá pra ajustar o código removendo a checagem de
  `fromMe` — mas isso tem risco de efeitos colaterais estranhos (o bot
  "conversando sozinho"). Me peça se quiser essa versão.

## Lista de comandos

Prefixo padrão: `/` (definido em `config.js`)

### Menus
`/menu` · `/menuadm` · `/menutinder` · `/menuzoeira` · `/menujogos`

### Admin (grupo + bot precisa ser admin)
`/ban @p` · `/promover @p` · `/rebaixar @p` · `/mute @p` · `/desmute @p` ·
`/fechargp` · `/abrirgp` · `/linkgp` · `/antilink on|off`

### Tinder (roleplay — 100% brincadeira interna)
`/rgtinder <nome>` · `/meutinder` · `/tinder` · `/tindernome` ·
`/tinderidade` · `/setgene` · `/setfiltro` · `/setsex` · `/tinderbio` ·
`/tinderfoto` (respondendo uma foto) · `/sairtinder` ·
`/namoracomigo @p` · `/casacomigo @p` · `/aceitar` · `/recusar` ·
`/cancelar` · `/terminar` · `/divorciar` · `/listacasamento`

> `/aceitar` e `/recusar` não estavam no menu original, mas são
> necessários pra outra pessoa confirmar o pedido de namoro/casamento.

### Zoeira
`/piada` · `/fato` · `/elogio` · `/indireta` · `/cantada` ·
`/trocadilho` · `/roleta`

### Jogos
`/jogodavelha @p` · `/resetvelha` · `/anagrama` · `/revelaranagrama` ·
`/quizanimais` · `/revelarquiz` · `/forca` · `/rfc` · `/campominado` ·
`/resetmina` · `/cassino` · `/ppt <pedra|papel|tesoura>` · `/dado` ·
`/caraoucoroa` · `/adivinharnmr` · `/wordle` · `/stopwordle` ·
`/mastermind` · `/stopmm` · `/eununca` · `/vdddsf` ·
`/cidadedorme @p1 @p2 @p3...` · `/stopcidadedorme` · `/rank`

### Geral
`/ping` · `/perfil` · `/help`

## Deixando o bot online 24h

Rodar no seu PC só funciona enquanto o terminal estiver aberto e o PC
ligado. Para deixar o bot online o tempo todo, sem depender do seu
computador:

1. Contrate um **VPS** (ex: um servidor Linux Ubuntu simples).
2. Instale Node.js e o projeto nele (mesmo passo a passo acima).
3. Use o **PM2** (`npm install -g pm2`) para rodar o bot em segundo
   plano e reiniciar sozinho se cair:

   ```bash
   pm2 start index.js --name killer-bot
   pm2 save
   pm2 startup
   ```

Posso te ajudar com esse passo a passo específico quando quiser migrar.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Mando comando e nada acontece | Você está usando o mesmo número que é o bot (veja [Como testar](#como-testar-leia-isso)) |
| Comando de admin dá erro | O bot não é administrador do grupo |
| QR code não aparece | O terminal não suporta desenhar QR — tente outro terminal/console |
| Bot desconecta sozinho | Sessão expirada ou WhatsApp desconectou o "aparelho" pelo celular — rode `npm start` de novo e escaneie outra vez |
| `npm install` dá erro | Confirme que instalou o Node.js 18+ (`node -v`) |

## O que não foi implementado (e por quê)

Alguns comandos do menu original ficaram de fora por representarem
ferramentas de assédio, fraude ou vigilância não consentida:

- Rótulos ofensivos e rankings públicos deles (`/gay`, `/feio`, `/rico`,
  `/puta`, `/corno`, `/nazista` etc. e seus `/rank*`)
- Puxada de dados reais de terceiros (`/tel`, `/cpf`, `/placa`, `/rg`,
  `/score`, `/chassi`)
- Geração de documento falso (`/gerarcpf`, `/docfake`)
- Stalking de rede social / puxar foto de perfil (`/getpp`, `/igstalk`)
- Mensagens anônimas (`/ngl`) — abre espaço pra ofensa sem identificação

O restante do menu original está implementado ou é candidato aos
próximos blocos (Figurinhas, Alteradores de áudio/vídeo).
