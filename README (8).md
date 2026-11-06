# Serviços (conversa com o servidor)

**Sprint 2 (estrutura) e Sprint 5 (servidor) · Épico E2 Conta · 🟡 Pronto para a demonstração**

As telas **não** falam direto com o servidor. Elas chamam um serviço daqui,
e o serviço decide: usar a API real ou, enquanto ela não existe, a demonstração.
Assim, quando o servidor ficar pronto, as telas não mudam.

## O que entrega

| Arquivo | O que faz | Usado por |
|---|---|---|
| `identificadores.js` | Reconhece e confere o que a pessoa digitou para entrar: **e-mail, CPF ou CNPJ** (inclusive o CNPJ alfanumérico). Esconde parte do valor quando precisar mostrar. | Login e "Esqueceu o login?" |
| `recuperacao.js` | Pede o link de nova senha, confere o link e troca a senha. | Pop-ups de recuperação |

## Preparado para o futuro
- **Novos jeitos de entrar** (nome de login, telefone principal…): já estão listados em `identificadores.js` como `ativo: false`.
  Para ligar: escrever as regras do novo tipo, trocar para `ativo: true` aqui **e** no servidor.
- **Nome completo** não deve virar jeito de entrar: muitas pessoas têm o mesmo nome.
- Cada conta pode ter **vários identificadores**; cada um pode ser ligado/desligado para o login e precisa ser **confirmado** (ex.: código no e-mail ou SMS) antes de valer. Modelo em [`base-de-dados/`](../base-de-dados/).

## Histórias atendidas
- **US04** — entrar com segurança.
- **US05** — recuperar senha ou login.

## Pronto quando
- [x] Telas usam só os serviços (nada de `fetch` espalhado pelas páginas).
- [x] Modo demonstração imita as respostas do servidor.
- [ ] `configuracoes/config.js` → `api.base` preenchido com o servidor real (Sprint 5).

## Parte técnica
- Endereço e rotas da API: `configuracoes/config.js` → `api`.
- Regras que o servidor tem de seguir: [`seguranca/recuperacao-acesso.md`](../seguranca/recuperacao-acesso.md).
- Ordem dos scripts: depois de `componentes/utilidades/utilidades.js` (e de `componentes/senha/senha.js`), antes do script da página.
- Envio de e-mails **não** existe no navegador: é um serviço só do servidor.
