# Banco de dados

**Sprint 5 · Épico E9 Servidor, segurança e LGPD · ⬜ Planejada**

É onde as informações vão ficar guardadas de verdade: contas, pedidos, orçamentos e avaliações.
Sem ele, o site é só demonstração.

## Para quem
Para todos os usuários (de forma invisível) e para a equipe S.D.

## O que vai guardar
Contas (4 tipos) · telefones · endereços · pedidos · orçamentos · contrapropostas · avaliações · fotos · avisos.

## Histórias atendidas
- **US30** — dados guardados com segurança.
- **US32** — ver, corrigir, baixar e apagar os dados.
- **US03 a US05** — contas reais.

## Pronto quando
- [ ] Tabelas criadas e documentadas aqui.
- [ ] Senhas guardadas só como *hash* (ninguém consegue ler).
- [ ] CPF/CNPJ único e sem alteração.
- [ ] Localização guardada de forma que o prestador só receba uma área aproximada.
- [ ] Prazo definido para apagar dados antigos (ex.: orçamentos arquivados).
- [ ] Testes de segurança feitos.

## Campos já definidos (05/11/2026)
Prestador:
- `tags` — lista de etiquetas. **`destaque`** = destaque pago (liga/desliga pelo administrador).
- `localizacao_ativa` (sim/não) — desligado: não aparece em mapas e listas; o perfil informa que não disponibilizou a localização.
- `whatsapp_publico` (sim/não) — desligado: o número **não** é enviado ao navegador na busca.
- `latitude`, `longitude` — calculados pelo servidor a partir do endereço da empresa.

Clientes (CPF e CNPJ):
- `localizacao_ativa` (sim/não) e o ponto do endereço do perfil (só para calcular distâncias; nunca enviado ao prestador).

## Campos novos (06/11/2026)
Todos os usuários — endereço separado (o CEP preenche o resto):
- `cep` (8 dígitos), `endereco` (rua), `numero` (aceita "S/N"), `complemento` (opcional), `bairro`, `cidade`, `uf` (sigla de 2 letras).

Cliente CPF:
- `compartilhar_dados` (sim/não) + data da última mudança — o botão "Mostrar meus dados aos prestadores" (primeiro nome e bairro).

Cliente CNPJ:
- `responsavel_cargo` (lista ou texto de "Outro").
- `horario_visitas`: lista de faixas `{ dias: [0-6], inicio: "HH:MM", fim: "HH:MM" }` (até 3) + `horario_obs` (texto livre, até 80). O servidor confere de novo: dia de 0 a 6, hora de 00:00 a 23:59, fim depois do início.

Avaliações:
- `mostrar_nome` (sim/não, padrão **não**). Se for "não", o nome de quem avaliou **nunca** é enviado ao prestador.

## Modelo lógico do acesso (preparado — NÃO criado)
Planejado para aceitar vários jeitos de entrar sem refazer o banco.
**Nada disto foi criado ainda**: é só a organização para a Sprint 5.

| Tabela (futura) | Guarda | Regras |
|---|---|---|
| `usuarios` | Dados da pessoa/empresa (nome, tipo de conta, endereço…) | Sem senha e sem identificadores de login aqui. |
| `identificadores_acesso` | `usuario_id`, `tipo` (email, cpf, cnpj; futuro: login, telefone), `valor_normalizado`, `confirmado_em`, `liberado_para_login` | `tipo + valor_normalizado` **único** (sem duplicados). Vários por conta. Só entra no login se confirmado **e** liberado. |
| `credenciais` | `usuario_id`, `hash_senha` (Argon2id), `alterada_em` | Uma por conta. Nunca a senha em texto. |
| `tokens_recuperacao` | `usuario_id`, `hash_token` (SHA-256), `expira_em` (30 min), `usado_em` | Uso único; novo pedido apaga os anteriores. |
| `sessoes` | `usuario_id`, `hash_sessao`, `criada_em`, `expira_em`, `encerrada_em` | Trocar a senha encerra todas. |
| `tentativas_acesso` | e-mail/identificador (em hash), IP, data, tipo (login, recuperação) | Usada para os limites de tentativas. Apagar após 30 dias. |

**Normalização** (a mesma da tela, em `servicos/identificadores.js`): e-mail em minúsculas e sem espaços; CPF só números; CNPJ em maiúsculas, só letras e números (aceita o alfanumérico).

## Parte técnica
- Hoje: só este README. A estrutura será criada na Sprint 5, seguindo o modelo acima.
- Cópias do banco (backup) **nunca** vão para o GitHub. O `.gitignore` bloqueia os formatos mais comuns.
