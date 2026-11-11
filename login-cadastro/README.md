# Entrar e criar conta

A porta de entrada: aqui a pessoa entra na conta ou cria uma nova.

## Quem vê
- Visitantes. Quem já entrou vê atalhos para o início, o perfil e Sair.

## O que tem
- **Entrar** com **e-mail** + senha (MVP; CPF/CNPJ voltam depois). Login real pelo Firebase (`firebase/firebase.js`).
- **Criar conta** em 3 tipos: Cliente CPF (casas), Cliente CNPJ (empresas e condomínios) e Prestador (CNPJ ou MEI).
- E-mail obrigatório. Endereço com CEP automático. Senha com 12 caracteres ou mais.
- Prestador: botão **Mostrar meus contatos** já vem **ligado** (com aviso se desligar).
- **Esqueceu a senha / o login?** em pop-ups (o progresso não se perde ao fechar).
- **Entrar como (Demonstração):** só aparece com `modoDemonstracao: true` em `configuracoes/config.js`.
- Depois de criar a conta: aviso para **confirmar o e-mail** + botão de reenviar.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `login-cadastro.css` / `login-cadastro.js` | Página, visual e regras. |
| `recuperacao.js` | Pop-ups de recuperação de acesso. |

## Cuidado
- Os links dos e-mails do Firebase (nova senha e confirmação) abrem **esta página** (configurar a "URL de ação" no console).

## Situação
✅ pronto · 🟡 só na demonstração · ⬜ a fazer

- ✅ Login, cadastro, sair e nova senha reais pelo Firebase (US03, US04, US05) — 11/11/2026.
- 🟡 Bloqueio por tentativas: o do próprio Firebase ("muitas tentativas").
