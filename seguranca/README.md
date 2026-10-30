# Segurança e LGPD — quem pode ver o quê

**Sprints 1 a 5 · Épico E9 Servidor, segurança e LGPD · 🟡 Regras prontas na tela (falta o servidor)**

Esta pasta define o que cada tipo de pessoa pode ver no site.
O objetivo é simples: **cada pessoa vê só o que precisa, e nada além disso.**

## Para quem
Para proteger todos os usuários, e para guiar quem vai construir o servidor.

## O que entrega
- As regras de cada página para os 5 tipos: visitante, Cliente CPF, Cliente CNPJ, Prestador e Administrador.
- As regras de quais dados cada um pode ver. Exemplos:
  - CPF, telefone e endereço completo **nunca** são públicos;
  - um prestador **não** vê outros prestadores;
  - um cliente **não** vê outros clientes;
  - do Cliente CPF, o prestador vê só o primeiro nome e o bairro, e só quando há um pedido aberto e autorizado;
  - do Cliente CNPJ, o prestador vê só o que a empresa autorizou no cadastro.
- Uma página de consulta com tudo em tabela.

## Histórias atendidas
- **US04** — cada tipo de conta só vê as suas páginas.
- **US31** — o servidor bloqueia páginas e dados (regras prontas; bloqueio real na Sprint 5).

## Pronto quando
- [x] As regras estão escritas e iguais na tela e no arquivo do servidor.
- [x] Na demonstração, quem tenta abrir uma página proibida é levado ao login ou ao início.
- [ ] O servidor aplica as regras de verdade (Sprint 5).

## Como testar
- Abra `seguranca/index.html` para ver a tabela de regras.
- Sem entrar na conta, tente abrir `perfil-adm/index.html`: o site leva você ao login.

## LGPD — como a S.D cuida dos seus dados

✅ já funciona · 🟡 funciona em parte · ⬜ ainda vai ser feito

| Cuidado | Situação |
|---|---|
| O site não usa cookies, propaganda nem rastreadores de terceiros | ✅ |
| Nenhum dado sai do navegador na demonstração | ✅ |
| Autorização clara no cadastro (o que será mostrado e para quem) | ✅ |
| Fotos: aviso para não mostrar pessoas, placas e documentos | ✅ |
| Avaliação com o nome escondido, a menos que a pessoa escolha aparecer | ⬜ Sprint 4 |
| Localização do cliente só aproximada, calculada no servidor | ⬜ Sprints 4 e 5 |
| Contato liberado só quando o prestador autoriza | ⬜ Sprint 4 |
| Política de privacidade em linguagem simples, com o canal de contato | ⬜ Sprint 2 |
| Direitos do usuário: ver, corrigir, baixar e apagar os dados | 🟡 Editar e excluir prontos na tela |
| Senha guardada só como *hash* | ⬜ Sprint 5 |
| Fotos sem a localização escondida no arquivo | ⬜ Sprint 5 |
| Plano para avisar a ANPD e os usuários em caso de vazamento | ⬜ Sprint 5 |

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `acesso.js` | Regras usadas pela **tela** (esconde o que não pode aparecer). |
| `permissoes.json` | As mesmas regras, para o **servidor** (bloqueio de verdade). Regra padrão: negar. |
| `index.html` | Tabela de consulta das regras. |

> ⚠️ **Mudou um arquivo, mude o outro.** `acesso.js` e `permissoes.json` precisam dizer a mesma coisa.

**Como uma página usa as regras:** no `<body>`, `data-recurso="nome-da-regra"`.
Ex.: `data-recurso="perfil-adm"`. Para ter uma versão pública, use também `data-recurso-publico`.

**Lembretes:**
- Esconder na tela **não** protege o dado. Quem protege é o servidor.
- A localização do cliente tem de ser arredondada **no servidor**. Se o endereço exato chegar ao navegador, qualquer pessoa consegue ver, mesmo escondido no mapa.
- Chaves de API: veja [`chaves-api/`](../chaves-api/).
