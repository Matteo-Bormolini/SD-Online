# Banco de dados

É onde as informações ficam guardadas de verdade: contas, pedidos, orçamentos e avaliações.
**Desde 11/11/2026:** banco **Firestore** (Firebase, plano grátis). Contas já são reais; pedidos, orçamentos e avaliações ainda são demonstração.
Código: `firebase/firebase.js` · Regras de segurança: `firebase/firestore.rules`.

## Coleções que já existem (Ciclo 2)
| Coleção | Documento | Guarda | Quem lê / edita |
|---|---|---|---|
| `usuarios` | id = uid do login | Dados da conta (campos abaixo). **Sem senha.** | A própria pessoa e o adm. Tipo, documento e selo de destaque a pessoa não muda. |
| `documentos` | `cpf-<11 números>` ou `cnpj-<14 caracteres>` | `{ uid, criadoEm }` — garante **1 conta por CPF/CNPJ** | Ninguém lê (só o adm). Criado junto com a conta; apagado ao excluir. |

**Campos de `usuarios`** (mesmos nomes dos objetos `perfil` das páginas de perfil):
`tipo` (cliente-cpf · cliente-cnpj · prestador · adm) · `email` · `documento` (só números/letras) · `documentoChave` ·
`telefones` [{ numero, principal }] · `cep`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `uf` ·
`interruptores` { localizacao, mostrar-contatos, … } · `criadoEm`, `atualizadoEm`.
- CPF: `nome`, `compartilharDados` + `compartilharDadosEm`.
- CNPJ e prestador: `razaoSocial`, `responsavelNome`, `autorizacaoExibir` + os campos do "Editar perfil".
- Senha: fica só no **Firebase Authentication** (com hash). Ninguém vê, nem o adm.
- Fotos: ainda não são salvas (precisa do plano pago do Firebase).

## O que vai guardar
Contas (4 tipos) · telefones · endereços · pedidos · orçamentos · avaliações · fotos · avisos · escolhas dos botões liga/desliga.

## Campos já decididos
**Todos os usuários**
- Endereço separado: `cep`, `endereco`, `numero`, `complemento` (opcional), `bairro`, `cidade`, `uf`.
- Um campo para cada botão liga/desliga de `configuracoes/interruptores.js` (ex.: `localizacao`).

**Prestador**
- `tags` — `destaque` = assinatura de destaque ativa (o adm liga/desliga).
- `localizacao` (sim/não) — desligado: não aparece em mapas nem listas.
- `mostrar_contatos` (sim/não, padrão sim) — desligado: telefone, WhatsApp e e-mail não são enviados ao navegador do cliente.
- `latitude`, `longitude` — calculados pelo servidor a partir do endereço.
- `informativo_cobranca` — texto de como cobra (só informação; o site não mexe com dinheiro).

**Cliente CPF**
- `compartilhar_dados` (sim/não, padrão não) + data da última mudança.

**Cliente CNPJ**
- `responsavel_cargo`; `horario_visitas` (até 3 faixas: dias 0–6, hora de início e fim) + `horario_obs`.

**Pedidos e quadro do prestador**
- `etapa`: a_orcar · orcando · aceito · a_realizar · prestado · encerrado.
- `motivo_encerramento` + `encerrado_em`. O servidor **apaga sozinho 1 ano depois** de `encerrado_em`.
- Uma **solicitação** do cliente (descrição + 3 a 6 fotos; mínimo 3) ligada a vários prestadores (um pedido por prestador marcado).
- `responder_ate` = data do pedido + 10 dias. Passou sem resposta → `encerrado` com motivo "Expirou".
- Orçamento: valores, datas, `cobra_visita` (sim/não) e `valor_visita`. Sem tabela de preço fixa. Ao enviar, libera o contato do prestador para aquele cliente. Sem contraproposta.
- Finalização **pelo cliente**: `finalizado_em` + 2 a 6 fotos. Só então a etapa vira `prestado`.

**Avaliações**
- `mostrar_nome` (sim/não, padrão não). `resposta_prestador` (opcional) e a data da resposta.

## Login (como ficou no Firebase)
| Antes (planejado) | Agora |
|---|---|
| `identificadores_acesso` | E-mail = Firebase Authentication · CPF/CNPJ = coleção `documentos` |
| `credenciais` (Argon2id) | Senha guardada pelo Firebase Authentication (hash próprio do Google) |

## Situação
✅ pronto · 🟡 só na demonstração · ⬜ a fazer

- ✅ Servidor escolhido: Firebase (11/11/2026).
- ✅ Contas (`usuarios`, `documentos`) — Ciclo 2.
- ⬜ Pedidos, orçamentos, avaliações — Ciclos 3 e 4.
