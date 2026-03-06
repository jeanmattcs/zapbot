# ZapBot - WhatsApp Bot com Baileys

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-F59E0B?style=for-the-badge)](#status-do-projeto)
[![Roadmap](https://img.shields.io/badge/Roadmap-Ativo-0A66C2?style=for-the-badge)](#roadmap)
[![Contribuições](https://img.shields.io/badge/Contribui%C3%A7%C3%B5es-Bem--vindas-22C55E?style=for-the-badge)](#roadmap)

[![ZapBot Banner](https://capsule-render.vercel.app/api?type=waving&height=180&text=ZapBot&fontSize=48&fontAlignY=35&desc=WhatsApp%20automation%20engine%20in%20progress&descAlignY=55&fontColor=f8fafc&color=0:0f172a,100:1e293b)](https://github.com/jeanmattcs/zapbot)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-6.7.21-25D366?style=for-the-badge)](https://github.com/WhiskeySockets/Baileys)
[![Pino](https://img.shields.io/badge/Pino-10.3.1-1E293B?style=for-the-badge)](https://getpino.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-0A66C2?style=for-the-badge)](LICENSE)

Bot de WhatsApp em Node.js com autenticação por QR Code, reconexão automática e base pronta para automações.

## Status do Projeto

```txt
Estágio atual: MVP funcional
Saúde do projeto: Evolução ativa
Prioridade atual: Estabilizar reconexão + iniciar camada de comandos
```

### O que já está pronto

- Conexão WhatsApp com QR Code
- Persistência de sessão local (`auth/`)
- Reconexão automática com limite de tentativas
- Estrutura base para envio e recebimento de mensagens

## Visão Geral

- Conexão via `@whiskeysockets/baileys`
- Sessão persistida em `auth/`
- Reconexão controlada com limite de tentativas
- Estrutura simples para evoluir respostas automáticas

## Stack

- Node.js
- `@whiskeysockets/baileys`
- `pino`
- `qrcode-terminal`

## Estrutura do Projeto

```txt
zapbot/
├── src/
│   ├── config/
│   │   └── whatsapp.config.js
│   ├── services/
│   │   └── whatsapp.service.js
│   └── index.js
├── docs/
│   └── modelo-logico.md
├── auth/
├── package.json
└── README.md
```

## Fluxo da Conexão

```mermaid
flowchart TD
    A[Inicia app] --> B[Carrega auth state]
    B --> C[Cria socket Baileys]
    C --> D{QR recebido?}
    D -- Sim --> E[Exibe QR no terminal]
    D -- Nao --> F{Conexao aberta?}
    E --> F
    F -- Sim --> G[Bot conectado]
    F -- Nao --> H[Conexao fechada]
    H --> I{Pode reconectar?}
    I -- Sim --> J[Agenda retry]
    J --> B
    I -- Nao --> K[Encerra processo]
```

## Como Rodar

1. Instale dependências:
```bash
npm install
```

2. Inicie o bot:
```bash
npm start
```

3. Escaneie o QR Code no terminal com o WhatsApp.

## Configuração

Arquivo: `src/config/whatsapp.config.js`

- `sessionName`: nome da sessão persistida
- `qrcode.small`: tamanho do QR no terminal
- `reconnect.maxRetries`: máximo de tentativas
- `reconnect.retryDelay`: delay entre tentativas (ms)

## Comandos

- `npm start`: executa o bot

## Próximos Passos

- Implementar roteador de mensagens (comandos e intents)
- Adicionar camada de logs estruturados por contexto
- Criar testes para fluxo de reconexão
- Integrar com banco/fila para automações

## Roadmap

### v1.1 - Comandos e Respostas

- [ ] Comando `!ping`
- [ ] Comando `!help`
- [ ] Dispatcher por tipo de mensagem
- [ ] Respostas automáticas por palavra-chave

### v1.2 - Observabilidade e Qualidade

- [ ] Logs estruturados por request/message-id
- [ ] Testes unitários para `WhatsAppService`
- [ ] Testes de integração para reconexão
- [ ] Tratamento de erros com códigos padronizados

### v1.3 - Integrações

- [ ] Persistência em banco (SQLite/Postgres)
- [ ] Fila para processamento assíncrono
- [ ] Webhook/API para gatilhos externos
- [ ] Painel simples de status da conexão

## Licença

ISC. Veja [LICENSE](LICENSE).
