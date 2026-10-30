# Suporte

**Sprint 2 · Épico E8 Ajuda e confiança · ✅ Pronto (demonstração) · falta definir os e-mails oficiais**

O lugar para tirar dúvidas sobre a plataforma e mandar ideias de melhoria.
Tem também um assistente que responde na hora e ajuda o prestador com contas do dia a dia.

## Para quem
Para todos: visitantes e quem já entrou na conta.

## O que entrega
- **Botões Dúvidas e Sugestões:** abrem um campo de texto. O texto fica guardado enquanto a aba estiver aberta.
  - Lixeira → pede confirmação antes de apagar.
  - Enviar → abre o e-mail da pessoa com o texto pronto.
- **Assistente S.D** (demonstração):
  - responde dúvidas da plataforma e anota ideias;
  - faz contas: área, perímetro, volume, porcentagem, desconto, conversão de medidas e regra de três;
  - não envia links nem imagens, não fala de preços e não responde fora do tema;
  - quando não sabe, oferece 2 caminhos: **Sobre a plataforma** (prepara um resumo para a equipe) ou **Dúvida externa**;
  - o envio só funciona depois que os e-mails oficiais forem definidos;
  - a conversa some ao sair da página.
- **E-mails do suporte** no fim da página.

## Histórias atendidas
- **US27** — tirar dúvidas e enviar sugestões.
- **US32** — canal para o usuário pedir seus direitos da LGPD (quando o e-mail oficial existir).
- **US40** — assistente com IA (futuro; as regras já estão escritas).

## Pronto quando
- [x] Dúvidas, sugestões e assistente funcionam na tela.
- [ ] E-mails oficiais do suporte definidos.
- [ ] Envio direto pelo servidor, sem depender do app de e-mail (Sprint 5).

## Como testar
Abra `suporte/index.html`, escreva uma dúvida e peça ao assistente: "área 3 x 4".

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página e janelas (popups). |
| `suporte.css` | Visual da página. |
| `suporte.js` | Botões, campos de texto, janelas, chat e e-mails. |
| `assistente.js` | Respostas do assistente (hoje locais; no futuro, pelo servidor). |
| `assistente-regras.md` | Instruções para a futura IA do assistente. |

**Onde mudar:**
- E-mails do suporte → `suporte.js`, lista `EMAILS` (vazia = "E-mail em definição" e envio bloqueado).
- Ligar a IA e limites do chat → `assistente.js`, objeto `CONFIG`.
- Respostas sobre a plataforma → `assistente.js`, objeto `PLATAFORMA`.

> Para mostrar quem está enviando, o servidor deve preencher `data-logado`, `data-tipo` e `data-nome` no `<body>`. Sem login, aparece "Visitante (sem login)".
