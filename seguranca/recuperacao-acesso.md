# Recuperação de acesso — regras para o servidor

**Tela pronta (v0.5.1) · servidor no Ciclo 2 (Contas reais) · História US05**

> **Atualização 11/11/2026 — Firebase:** quem faz a parte do servidor agora é o **Firebase Authentication**
> (`firebase/firebase.js`). Mudou: link vale **1 hora** (padrão do Firebase), senha com hash do Google (não Argon2id),
> e-mails pelo Firebase (sem Brevo/domínio próprio por enquanto), login só por e-mail no MVP.
> Ainda **não** existe: "nova senha igual à anterior" e o e-mail "Sua senha foi alterada".
> As seções abaixo ficam como referência para um servidor próprio no futuro.

A tela já está pronta (pop-ups na página de login). Este arquivo diz **o que o servidor tem de fazer** quando existir.

---

## 1. Como funciona para a pessoa

### Esqueceu a senha?
1. Digita o e-mail cadastrado e clica em **Enviar link de recuperação**.
2. Recebe sempre a **mesma mensagem**, exista ou não a conta.
3. Se a conta existe, chega um e-mail com o link (vale **30 minutos**, **uso único**).
4. O link abre o site e mostra o pop-up **Criar nova senha**.
5. Digita e confirma a nova senha → senha trocada → volta ao login.

### Esqueceu o login?
| Opção | O que a pessoa informa | O que o site faz | O que **nunca** mostra |
|---|---|---|---|
| Não lembro meu e-mail | CPF ou CNPJ | Confere o formato e sugere usar o documento para entrar | O e-mail da conta |
| Não lembro meu CPF/CNPJ | E-mail | Confere o formato e sugere usar o e-mail para entrar | O documento |
| Esqueci os dois | — | Mostra o botão do Suporte | Nada é recuperado sem confirmar a identidade |

A resposta é igual exista ou não a conta (ninguém descobre quem tem cadastro).
A confirmação de identidade pelo Suporte será definida depois.

---

## 2. Regras de segurança (obrigatórias no servidor)

### Link de recuperação
- Token aleatório de **32 bytes** gerado com gerador seguro (ex.: `crypto.randomBytes(32)` / `secrets.token_urlsafe(32)`).
- Guardar **só o hash** do token (SHA-256). O token puro vai só no e-mail.
- Validade: **30 minutos**. **Uso único.**
- Novo pedido **invalida** os links anteriores da mesma conta.
- O link usa o endereço **fixo** do site (configuração), nunca o cabeçalho `Host` do pedido.
- Formato do link: `https://<site>/login-cadastro/index.html#redefinir=<token>`
  (o token vai depois do `#`: não aparece nos registros do servidor web nem no `Referer`).
- A página de login usa `Referrer-Policy: no-referrer`.

### Respostas e limites
- Mesma mensagem e **tempo de resposta parecido** para conta que existe e que não existe.
- Limite de pedidos (sugestão): **3 por e-mail a cada 15 minutos** e **10 por IP a cada hora**. Acima disso: HTTP 429.
- Limite também para tentativas de token inválido (evita adivinhar links).
- **Não bloquear a conta** por causa de pedidos de recuperação (alguém poderia travar a conta de outra pessoa).

### Nova senha
- Mesma regra da tela (`componentes/senha/senha.js`): **mínimo 12 caracteres**, máximo 128; letras, números, espaços e símbolos.
- Recusar senhas comuns/previsíveis (de preferência, também conferir uma lista de senhas vazadas).
- Recusar se for **igual à senha atual** (comparar com o hash) → código `SENHA_IGUAL`.
  Mensagem: "A nova senha não pode ser igual à sua senha anterior."
- Guardar com **Argon2id** (mínimo OWASP: memória 19 MiB, 2 iterações, paralelismo 1). bcrypt só se Argon2id não existir (custo ≥ 10; ele só lê 72 bytes).
- Nunca guardar, registrar em log ou enviar a senha em texto.

### Depois da troca
- Marcar o token como usado e **apagar os outros tokens** da conta.
- **Encerrar todas as sessões** da conta.
- **Não** entrar automaticamente: a pessoa faz login com a nova senha.
- Enviar e-mail de aviso: "Sua senha foi alterada" (sem a senha), com o caminho para o Suporte se não foi ela.

---

## 3. Rotas da API (contrato com a tela)

Configuradas em `configuracoes/config.js` → `api.rotas`. A tela usa `servicos/recuperacao.js`.

| Rota | Envia | Responde |
|---|---|---|
| `POST /auth/recuperar-senha` | `{ email }` | sempre `{ codigo: "ENVIADO" }` · 429 se passar do limite |
| `POST /auth/recuperar-senha/validar` | `{ token }` | `{ codigo: "OK" }` ou `{ codigo: "LINK_INVALIDO" }` |
| `POST /auth/recuperar-senha/redefinir` | `{ token, novaSenha }` | `OK` · `LINK_INVALIDO` · `SENHA_IGUAL` · `SENHA_FRACA` |

"Esqueceu o login?" **não** precisa de rota hoje: a resposta é a mesma para todos, então nada é consultado.

---

## 4. Serviços separados (organização do servidor)

| Serviço | Faz | Não faz |
|---|---|---|
| **Identificação** | Descobre o tipo do identificador, normaliza, procura a conta | Não confere senha |
| **Autenticação** | Confere a senha (Argon2id), cria e encerra sessões | Não envia e-mail |
| **Recuperação de senha** | Cria/valida/usa tokens, aplica limites, troca a senha | Não monta e-mails |
| **Envio de e-mails** | Monta e envia os e-mails (modelo + provedor) | Não decide regras de conta |

Na tela, as mesmas partes estão em `servicos/identificadores.js` e `servicos/recuperacao.js`.

---

## 5. Configuração do envio de e-mails (Ciclo 2)

1. Escolher um provedor **grátis e sem prazo** (regra do projeto). Exemplo conferido em 06/11/2026: **Brevo**, plano grátis com 300 e-mails/dia. Planos mudam: conferir de novo antes de usar.
2. Ter um **domínio próprio** e configurar no DNS: **SPF**, **DKIM** e **DMARC** (sem isso, os e-mails caem no spam).
3. Remetente fixo, ex.: `nao-responda@<dominio>`.
4. Variáveis no `.env` do servidor (nunca no GitHub — ver `chaves-api/`):

```
EMAIL_PROVEDOR=brevo
EMAIL_API_CHAVE=
EMAIL_REMETENTE=nao-responda@seu-dominio.com.br
SITE_URL=https://seu-dominio.com.br
RECUPERACAO_VALIDADE_MIN=30
RECUPERACAO_LIMITE_POR_EMAIL=3
RECUPERACAO_JANELA_MIN=15
```

5. Modelos de e-mail: "Link para criar nova senha" e "Sua senha foi alterada". Texto simples, sem imagens externas.

---

## 6. O que funciona hoje (demonstração, sem servidor)

- Os 4 pop-ups, com progresso guardado ao fechar e confirmação de cancelamento.
- Um "servidor de demonstração" dentro de `servicos/recuperacao.js` imita as respostas:
  link com token de verdade (só o hash fica guardado na aba), 30 min, uso único, limite de 3 pedidos/15 min.
- O link aparece na tela (na versão real ele só vai por e-mail).
- Senha atual de teste para a regra "igual à anterior": **Porta verde da cozinha**.

Referências: [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) · [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
