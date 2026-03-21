# ZapBot

> Bot de WhatsApp em Node.js com arquitetura orientada a estados, focado em resiliência de conexão e evolução incremental.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-F59E0B?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)
![Baileys](https://img.shields.io/badge/Baileys-6.7.x-25D366?style=flat-square)
![Licença](https://img.shields.io/badge/licen%C3%A7a-ISC-0A66C2?style=flat-square)

---

## Visão Geral

O ZapBot é uma aplicação Node.js que conecta ao WhatsApp via protocolo não-oficial usando a biblioteca [Baileys](https://github.com/WhiskeySockets/Baileys). O projeto não é uma biblioteca para instalar via `npm` — é um bot completo, pensado para ser clonado, executado e evoluído.

O objetivo principal não é entregar um produto pronto, mas construir uma base técnica sólida: com ciclo de vida bem definido, estados de conexão explícitos, reconexão resiliente e uma estrutura que facilite a adição de novas funcionalidades sem quebrar o que já existe.

O projeto também serve como laboratório prático para aprender arquitetura de software, organização de código, GitHub flow, abertura de issues e colaboração em projetos reais.

---

## Status do Projeto

O projeto está em desenvolvimento ativo. O foco atual está na consolidação da base arquitetural — conexão, reconexão e organização do código — antes de expandir para funcionalidades de automação.

| Fase | Status |
|---|---|
| Bootstrap e ciclo de vida da aplicação | ✅ Concluído |
| Conexão e máquina de estados | ✅ Concluído |
| Reconexão com backoff exponencial | ✅ Concluído |
| Logger estruturado | ✅ Concluído |
| Health endpoint HTTP | 🔜 Planejado |
| Normalização de mensagens | 🔜 Planejado |
| Roteamento e comandos | 🔜 Planejado |
| Persistência de sessão em banco | 🔜 Planejado |

---

## Funcionalidades Atuais

- **Bootstrap centralizado** — a inicialização e o encerramento da aplicação passam por um único ponto (`AppBootstrap`), que registra sinais do processo e coordena o shutdown de forma limpa.
- **Conexão com o WhatsApp via Baileys** — autenticação por QR Code exibido no terminal.
- **Persistência de sessão local** — a sessão é salva em `auth/` usando `useMultiFileAuthState`, evitando que o QR Code precise ser escaneado a cada reinicialização.
- **Máquina de estados explícita** — o ciclo de conexão é controlado por estados bem definidos (`idle`, `connecting`, `qr_waiting`, `connected`, `reconnecting`, `logged_out`, `failed`, `shutting_down`), o que torna o comportamento do sistema previsível e rastreável.
- **Reconexão automática com backoff exponencial e jitter** — em caso de queda de conexão, o sistema tenta reconectar com intervalos crescentes e variação aleatória para evitar picos de carga.
- **Logger estruturado com Pino** — os logs são emitidos em formato JSON, configuráveis por nível (`LOG_LEVEL`) e ambiente (`NODE_ENV`).
- **Configuração centralizada** — parâmetros de ambiente e conexão ficam em `src/config/`, sem espalhamento pelo código.

---

## Roadmap

### v0.2 — Base Operacional
- Endpoint HTTP de health (`/health`) expondo o estado atual da conexão
- Snapshot do estado de conexão acessível externamente

### v0.3 — Persistência e Confiabilidade
- Abstração de `SessionStore` desacoplada do sistema de arquivos
- Migração da sessão para SQLite
- Fila de envio de mensagens (`OutboundQueue`) com persistência, tolerante a oscilações de conexão

### v0.4 — Camada de Mensagens
- `MessageNormalizer` para transformar o evento bruto do Baileys em um formato interno estável
- `MessageRouter` para separar o recebimento da mensagem da lógica de processamento
- Primeiros comandos funcionais

### v0.5 — Operação e Observabilidade
- Documentação de deploy em Ubuntu com `systemd`
- Diagrama formal de componentes e transição de estados
- Métricas e eventos estruturados para observabilidade ampliada

---

## Tecnologias Utilizadas

| Tecnologia | Papel no projeto |
|---|---|
| [Node.js](https://nodejs.org/) (18+) | Runtime principal da aplicação |
| [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) | Biblioteca de conexão com o WhatsApp |
| [Pino](https://getpino.io/) | Logger estruturado em JSON |
| [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal) | Exibição do QR Code no terminal |

---

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado na sua máquina:

- **Node.js** versão 18 ou superior — [como instalar](https://nodejs.org/en/download)
- **npm** (já vem junto com o Node.js)
- **Git** — [como instalar](https://git-scm.com/downloads)

Para verificar se já tem o Node.js instalado, rode no terminal:

```bash
node --version
npm --version
```

---

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/jeanmattcs/zapbot.git
cd zapbot
npm install
```

---

## Configuração de Ambiente

O projeto não exige um arquivo `.env` obrigatório para rodar localmente — os valores padrão já estão definidos em `src/config/app.config.js`. Se quiser sobrescrever algum parâmetro, crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
# Ambiente da aplicação: development | production
NODE_ENV=development

# Nível de log: trace | debug | info | warn | error
LOG_LEVEL=info

# Nome da sessão do WhatsApp (afeta o nome da pasta em auth/)
SESSION_NAME=zapbot

# Configurações de reconexão
RECONNECT_MAX_RETRIES=5
RECONNECT_BASE_DELAY_MS=2000
RECONNECT_MAX_DELAY_MS=60000
```

> **Atenção:** nunca comite o arquivo `auth/` no repositório. Ele contém as credenciais da sessão do WhatsApp. O `.gitignore` já está configurado para ignorá-lo.

---

## Como Executar

```bash
npm start
```

Na primeira execução, um QR Code será exibido no terminal. Abra o WhatsApp no celular, vá em **Dispositivos vinculados** e escaneie o código.

Após a autenticação, a sessão é salva localmente. Nas próximas execuções, o bot reconecta automaticamente sem precisar escanear o QR Code novamente.

---

## Estrutura do Projeto

```
zapbot/
├── src/
│   ├── app/
│   │   └── app-bootstrap.js         # Inicialização e encerramento da aplicação
│   ├── config/
│   │   ├── app.config.js            # Configuração geral (ambiente, logger)
│   │   └── whatsapp.config.js       # Parâmetros de conexão e reconexão
│   ├── observability/
│   │   └── logger.js                # Instância configurada do Pino
│   ├── services/
│   │   └── whatsapp.service.js      # Camada de compatibilidade com o serviço legado
│   ├── whatsapp/
│   │   ├── connection-state.js      # Definição dos estados e transições válidas
│   │   └── whatsapp-connection-manager.js  # Gerenciador de conexão e reconexão
│   └── index.js                     # Ponto de entrada da aplicação
├── auth/                            # Sessão do WhatsApp (gerado em runtime, não commitado)
├── .gitignore
├── package.json
└── README.md
```

**Responsabilidades de cada parte:**

- `src/index.js` — ponto de entrada. Instancia o `AppBootstrap` e inicia a aplicação.
- `app/app-bootstrap.js` — coordena o ciclo de vida: inicializa dependências, registra sinais do processo (`SIGINT`, `SIGTERM`) e garante shutdown limpo.
- `config/` — centraliza todos os parâmetros configuráveis. Nenhuma parte do sistema deve ler `process.env` diretamente fora daqui.
- `observability/logger.js` — exporta a instância única do logger, já configurada com nível e formato corretos para o ambiente.
- `whatsapp/whatsapp-connection-manager.js` — dono exclusivo da conexão com o WhatsApp. Cria o socket Baileys, controla a máquina de estados, dispara reconexões e processa eventos de mensagem.
- `whatsapp/connection-state.js` — define os estados possíveis e as transições válidas entre eles.
- `services/whatsapp.service.js` — camada de compatibilidade mantida durante a refatoração.

---

## Fluxo do Sistema

O diagrama abaixo mostra o que acontece desde a inicialização até o recebimento de uma mensagem:

```
1. node src/index.js
       │
       ▼
2. AppBootstrap.start()
   ├── instancia o Logger
   ├── instancia o WhatsAppConnectionManager
   └── registra handlers para SIGINT / SIGTERM
       │
       ▼
3. WhatsAppConnectionManager.connect()
   ├── estado: idle → connecting
   ├── cria o socket Baileys com useMultiFileAuthState
   └── aguarda eventos de conexão
       │
       ├── [sessão nova] → estado: connecting → qr_waiting
       │       └── exibe QR Code no terminal
       │               └── [QR escaneado] → estado: connected
       │
       └── [sessão salva] → estado: connecting → connected
               │
               ▼
4. Conexão estabelecida
   └── sistema fica ouvindo eventos de mensagem
           │
           ▼
5. Mensagem recebida (messages.upsert)
   └── WhatsAppConnectionManager processa o evento bruto
           │
           ▼
6. [queda de conexão]
   ├── estado: connected → reconnecting
   ├── aguarda delay com backoff exponencial + jitter
   └── volta para o passo 3 (até atingir RECONNECT_MAX_RETRIES)
           │
           └── [máximo de tentativas] → estado: failed → encerramento
```

---

## Como Contribuir

Este projeto usa um fluxo baseado em issues, branches e pull requests. Se você é iniciante, esse fluxo também serve como prática de colaboração em projetos reais.

### Passo a passo

**1. Abra ou escolha uma issue**

Toda contribuição começa por uma issue. Se você encontrou um bug ou tem uma sugestão, abra uma issue descrevendo o problema ou a proposta. Se já existe uma issue que te interessa, comente que vai trabalhar nela.

**2. Faça um fork do repositório**

Clique em **Fork** no GitHub para criar uma cópia do projeto na sua conta.

**3. Clone seu fork e crie uma branch**

```bash
git clone https://github.com/seu-usuario/zapbot.git
cd zapbot
git checkout -b feat/nome-da-sua-feature
# ou
git checkout -b fix/nome-do-bug
```

Use prefixos descritivos: `feat/` para novas funcionalidades, `fix/` para correções, `docs/` para documentação.

**4. Faça as alterações e commit**

```bash
git add .
git commit -m "feat: adiciona endpoint de health check"
```

Escreva mensagens de commit claras e no imperativo. Evite mensagens genéricas como "ajustes" ou "correções".

**5. Abra um Pull Request**

Envie sua branch para o GitHub e abra um Pull Request para a branch `main` do repositório original. No PR, descreva o que foi feito e referencie a issue relacionada (ex: `Closes #12`).

---

## Documentação Adicional

- [Documentação do Baileys](https://github.com/WhiskeySockets/Baileys) — referência completa da biblioteca de conexão com o WhatsApp
- [Documentação do Pino](https://getpino.io/#/) — referência do logger estruturado utilizado no projeto
- [Guia de GitHub Flow](https://docs.github.com/pt/get-started/using-github/github-flow) — fluxo de colaboração utilizado no projeto

---

## Licença

Distribuído sob a licença ISC. Consulte o arquivo [LICENSE](./LICENSE) para mais informações.
