# Página Suporte — `suporte/`

Página pública (visitante e logado) para **dúvidas da plataforma** e **sugestões de melhoria**.
Segue o padrão do site: `configuracoes/base.css`, NavBar e Rodapé.

## Arquivos
| Arquivo | O que faz |
|---|---|
| `index.html` | Estrutura da página e popups |
| `suporte.css` | Visual da página (só tokens do `base.css`; claro e escuro) |
| `suporte.js` | Botões Dúvidas/Sugestões, balões, popups, chat e e-mails |
| `assistente.js` | Respostas do assistente (modo local hoje; servidor no futuro) |
| `assistente-regras.md` | Instruções para a futura IA do chat |

## O que a página tem
1. **Texto** informando que o canal é só para dúvidas da plataforma e sugestões.
2. **Botões Dúvidas | Sugestões** unidos, na largura toda, sem ícones e com brilho suave. Abrem um balão; ao fechar, o texto fica guardado (também se recarregar a aba).
   - Lixeira (canto esquerdo) → popup para confirmar a exclusão do texto.
   - Enviar (canto direito) → abre o e-mail do usuário com o texto preenchido.
3. **Assistente S.D** (demonstração, ícone de robô com capacete): dúvidas da plataforma, ideias e cálculos (área, perímetro, volume, %, desconto/aumento, conversão de medidas, regra de três).
   - Linha de escrever: [lixeira] [campo que cresce com o texto, sem rolagem] [enviar].
   - Conversa rola com o dedo; a alça abaixo dela aumenta/diminui a área (dedo, mouse ou setas).
   - "Não resolveu?" aparece sempre no fim da conversa, depois de cada resposta.
   - Não envia links/imagens, não fala de preços, não responde fora do tema.
   - Quando não sabe → popup com 2 saídas: **Sobre a plataforma** e **Dúvida externa** (avisa e mantém a conversa).
   - Sobre a plataforma: o usuário vê só **quem envia** e o **resumo**. A equipe recebe: quem enviou, resumo, o que o cliente precisa e a possível melhoria. Sem conversa, o envio fica bloqueado.
   - Conversa temporária (some ao sair). Limite interno de 20 mensagens × 300 caracteres (não aparece na tela).
4. **E-mails do suporte** no fim da página.

## Onde editar
- **E-mails:** `suporte.js` → `EMAILS` (vazio mostra "E-mail em definição" e bloqueia o envio).
- **Limites do chat / ligar IA:** `assistente.js` → `CONFIG` (`modo: "servidor"` + `endpoint`).
- **Respostas da plataforma:** `assistente.js` → `PLATAFORMA` (atualizar quando surgirem recursos novos).

## Observações
- O envio atual usa `mailto:` (abre o app de e-mail). Com o servidor pronto, trocar por envio direto.
- Quem envia: o servidor deve preencher `data-logado`, `data-tipo` e `data-nome` no `<body>`. Sem login aparece "Visitante (sem login)".
- Se `seguranca/permissoes.json` controlar páginas públicas, incluir `suporte` como liberada para `visitante`.
- Testado no Chromium (Playwright): 39 verificações (computador e celular com toque), 320 a 3840 px sem rolagem lateral, claro/escuro, axe-core WCAG 2.2 AA sem violações. Firefox e Safari não testados.
