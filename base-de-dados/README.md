# Banco de dados

É onde as informações vão ficar guardadas de verdade: contas, pedidos, orçamentos e avaliações.
Ainda **não existe**. Hoje o site usa dados de demonstração.

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

## Login (planejado, não criado)
| Tabela | Guarda | Regra |
|---|---|---|
| `usuarios` | Dados da pessoa/empresa | Sem senha aqui. |
| `identificadores_acesso` | E-mail, CPF, CNPJ (futuro: telefone) | Sem repetidos. Só vale depois de confirmado. |
| `credenciais` | Senha em *hash* (Argon2id) | Ninguém lê a senha, nem o adm. |

## Situação
✅ pronto · 🟡 só na demonstração · ⬜ a fazer

- ⬜ Escolher o servidor (Cloudflare ou Firebase) — **Ciclo 1**.
- ⬜ Criar as tabelas — **Ciclo 2**.
