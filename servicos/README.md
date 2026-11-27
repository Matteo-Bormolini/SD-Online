# Serviços (conversa com serviços de fora)

As telas **não** falam direto com o login nem com APIs de fora: elas chamam um arquivo daqui.
Se um dia o Firebase for trocado por um servidor próprio, só estes arquivos mudam; as telas continuam iguais.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `identificadores.js` | Reconhece o que a pessoa digitou: e-mail, CPF ou CNPJ (com letras também). No MVP a tela de login aceita só e-mail; telefone fica preparado e desligado. |
| `recuperacao.js` | Nova senha: pede o link por e-mail, confere o link e troca a senha (pelo Firebase). |
| `consulta-cnpj.js` | Consulta o CNPJ do prestador na Receita (CNPJá; reserva CNPJ.ws). Grátis, sem chave. APIs no bloco 1. |

## Como mudar
- Servidor próprio (futuro): `configuracoes/config.js` → `api` (hoje vazio).
- Novo jeito de entrar (ex.: telefone): já está listado como `ativo: false` em `identificadores.js`.

## Situação
✅ pronto · ⬜ a fazer · ⏸️ pago (depois do MVP)

- ✅ `recuperacao.js`: nova senha pelo e-mail, com o pop-up do site (conta real, 11/11/2026). O link vale 1 hora.
- ✅ `consulta-cnpj.js` (11/11/2026): bloqueia só CNPJ inativo; o resto vai para o adm. Desligado pelo botão do adm "Conferir CPF e CNPJ" (modo teste).
- ✅ `identificadores.js`: login por e-mail (MVP).
- ⬜ Entrar com CPF/CNPJ e telefone (US49) — depois do MVP.
- ⏸️ Consulta do CNPJ feita pelo servidor (Cloud Functions).

**Para o MVP esta pasta está pronta.**
