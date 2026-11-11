# Serviços (conversa com o servidor)

As telas **não** falam direto com o servidor: elas chamam um arquivo daqui.
Quando o servidor existir, só estes arquivos mudam; as telas continuam iguais.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `identificadores.js` | Reconhece o que a pessoa digitou para entrar: e-mail, CPF ou CNPJ (inclusive com letras). |
| `recuperacao.js` | Pede o link de nova senha, confere o link e troca a senha (hoje: demonstração). |
| `consulta-cnpj.js` | Consulta o CNPJ do prestador na Receita (CNPJá; reserva CNPJ.ws). Grátis, sem chave. APIs no bloco 1. |

## Como mudar
- Endereço do servidor: `configuracoes/config.js` → `api`.
- Novo jeito de entrar (ex.: telefone): já está listado como `ativo: false` em `identificadores.js`.

## Situação
- ✅ `recuperacao.js` ligado ao Firebase (11/11/2026). O link do e-mail vale 1 hora.
- 🟡 `identificadores.js`: o login usa só o e-mail no MVP (CPF/CNPJ continuam aqui para o futuro).
- ✅ `consulta-cnpj.js` (11/11/2026): bloqueia só CNPJ inativo; o resto vai para o adm. Desligado pelo botão do adm "Conferir CPF e CNPJ" (modo teste).
