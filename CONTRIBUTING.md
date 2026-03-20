# Contribuindo com o ZapBot

Esse documento explica como contribuir com o projeto, o fluxo de trabalho esperado
e os padrões que o time segue.

---

## Fluxo de Trabalho

### 1. Fork e clone

Faça um fork do repositório e clone o seu fork localmente:

git clone https://github.com/jeanmattcs/zapbot.git

cd zapbot

### 2. Crie uma branch

Crie uma branch com um nome descritivo, referenciando o número da Issue:

git checkout -b feat/123-nome-da-task

Padrões de prefixo:

- `feat/` — nova funcionalidade
- `fix/` — correção de bug
- `refactor/` — refatoração sem mudança de comportamento
- `chore/` — tarefas de manutenção, limpeza

### 3. Implemente a task

Leia a Issue com atenção antes de começar.
Tire dúvidas antes de codar, não depois.

### 4. Teste localmente

npm install

npm start

Certifique-se de que o bot inicia sem erros e que o comportamento descrito na Issue funciona.

### 5. Abra o Pull Request

Abra o PR do seu fork para a branch `main` do repositório original.

---

## Padrão de Pull Request

Todo PR deve conter:

**O que foi feito**
Descreva o que foi implementado de forma objetiva.

**Por quê**
Explique o motivo da mudança. Qual problema ela resolve?

**Como testar**
Descreva os passos para validar o que foi feito.

Exemplo:

---

### O que foi feito

Adicionei validação para rejeitar mensagens com texto vazio antes de processar.

### Por quê

Sem essa validação, mensagens vazias chegavam ao fluxo de processamento e
causavam comportamento inesperado.

### Como testar

1. Rodar o bot com `npm start`
2. Enviar uma mensagem vazia
3. Verificar que nenhum log de processamento aparece no terminal

---

## Padrões de Código

- Use `const` por padrão. `let` apenas quando necessário. Nunca `var`.
- Nomes em inglês para variáveis, funções e arquivos.
- Comentários em português quando necessário.
- Não deixe `console.log` de debug no código final. Use o logger (`this.logger`).
- Mantenha funções pequenas e com responsabilidade única.

---

## Dúvidas

me chame no meu discord :)
apenasmateus
