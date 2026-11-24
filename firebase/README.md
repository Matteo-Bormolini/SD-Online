# Firebase (login e banco de dados)

A única pasta que conversa com o **Firebase** (plano grátis Spark): login (Authentication) e banco (Firestore).
As telas usam só `window.SDFirebase`. Site continua no **GitHub Pages**.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `firebase.js` | Conexão: entrar, sair, criar conta, nova senha, confirmar e-mail, ler/salvar/excluir perfil. **Bloco 1 = configuração do projeto.** |
| `fotos.js` | **v0.8.0** Fotos compactadas no banco (coleção `fotos`), grátis. `window.SDFotos`. |
| `pedidos.js` | **v0.8.0** Contatos/orçamentos (coleção `orcamentos`) e avisos (coleção `avisos`). Carrega as telas `componentes/pedidos` e `componentes/avisos`. `window.SDPedidosDados`. |
| `divulgacoes.js` | **v0.8.2** Eventos, grupos e comunicados da **Home do prestador** e, desde a **v0.8.5**, avisos e anúncios da **Home dos clientes** (coleção `divulgacoes`). Carregado só no Início e no Perfil do adm. `window.SDDivulgacoes`. |
| `firestore.indexes.json` | **v0.8.2** Índices da coleção `divulgacoes` (criar 1 vez no console: veja abaixo). |
| `firestore.rules` | Regras de segurança do banco. Copiar e colar no console (não funciona sozinho aqui no GitHub). **Bloco 1 = limites de tamanho.** |

## Como entra nas páginas
Último script do `<head>` de **toda** página (já colocado em todas):
```html
<script type="module" src="../firebase/firebase.js"></script>
```
`type="module"` não funciona abrindo o arquivo direto do PC (`file://`). Teste pelo GitHub Pages ou pelo Live Server do VS Code.

## Configurar no console (uma vez)
1. **Ligar o projeto:** Configurações do projeto → Seus apps → SDOnline Web → copie o `firebaseConfig` e cole no **bloco 1** de `firebase.js`.
   A `apiKey` pode ficar pública (é assim no Firebase). Quem protege são as regras.
2. **Regras do banco:** Firestore Database → **Regras** → apague tudo → cole `firestore.rules` → **Publicar**.
   Para voltar atrás: aba **Regras** → histórico (relógio, à esquerda) → versão anterior.
3. **Política de senha** (igual ao site): Authentication → Configurações → Política de senha →
   modo **Exigir** · **nenhuma** exigência de caracteres marcada · mínimo **6** · máximo **128**.
4. **Links dos e-mails abrem o site:** Authentication → Modelos → lápis de qualquer modelo →
   **Personalizar URL de ação** → `https://matteo-bormolini.github.io/SD-Online/login-cadastro/index.html` → Salvar.
5. **Domínio autorizado:** Authentication → Configurações → Domínios autorizados → `matteo-bormolini.github.io` (e `127.0.0.1` para testar no PC).

## Criar o administrador
1. No site, crie uma conta normal (Cliente CPF) com o e-mail do adm.
2. Console → Firestore Database → `usuarios` → documento dessa conta → campo `tipo` → troque para `adm` → Atualizar.
3. Saia e entre de novo no site. Ninguém consegue virar adm pelo site (as regras bloqueiam).

## Cadastro em 2 passos (desde v0.7.6)
1. A pessoa preenche o cadastro → o site cria o **login** e guarda os dados em `cadastrosPendentes/{uid}` (só ela vê). **Nenhum CPF/CNPJ é reservado.**
2. Ela clica no link do e-mail → o site cria o **perfil** + a **reserva** do CPF/CNPJ (com o tipo da conta) e apaga o pendente.
   Abriu o link em outro aparelho? Ao entrar com e-mail e senha (ou em "Já cliquei no link"), o cadastro é concluído.
- O CPF/CNPJ já tinha dono quando ela confirmou? O login é apagado e aparece "Este CPF/CNPJ já tem uma conta".
- Pendentes antigos (quem nunca confirmou): o adm pode apagar pelo console (`cadastrosPendentes`). Limpeza automática = pós-MVP (pago).

## Regras do banco: mapa das áreas (v0.8.0)
`firestore.rules` é dividido em áreas com título padrão. Os números (limites) ficam **dentro de cada área**, marcados com `← MUDE AQUI`.

| Área | O que faz |
|---|---|
| 00 Geral: Interruptores | `EXIGIR_EMAIL_CONFIRMADO`, `ANO_MINIMO` (1975), `DIAS_PARA_RESPONDER` (10), `FOTOS_PEDIDO_OBRIGATORIAS` (false até pagar o Storage) |
| 01 Geral: Funções de apoio | texto, lista, booleano… |
| 02 Geral: Campos comuns | e-mail, telefones, botões, foto (até 60.000 caracteres), ponto no mapa, endereço |
| 03 Geral: CPF e CNPJ | dígitos verificadores |
| 04 Geral: Horário da semana | até 3 faixas (dias + horas) + observação |
| 05 Geral: Visita e lista de fotos | `cobraVisita` + `valorVisita` (até R$ 100.000) · lista de até 12 fotos `{ id, legenda/area }` |
| 10–13 Cadastro | passo 1 de cada tipo (CPF, CNPJ, Prestador) |
| 20 Perfil_Todos | ler, criar (passo 2), excluir |
| 21–24 Perfil_CPF / CNPJ / Prestador / Adm: Editar | cada tipo edita só os SEUS campos; confere só o que mudou |
| 25 Vitrine_Prestador | cartão público: clientes e adm leem; só o dono publica |
| 30 Reserva_Documento · 40 Config_Site | |
| 50 Contatos_Orçamentos | cliente cria o contato; cada lado só muda o que é seu (situações: contato → orcado/nao-orcou/expirado → escolhido/nao-escolhido/cancelado/encerrado → concluido → prestado) |
| 60 Avisos | só quem participa do contato avisa o outro lado; só o dono lê, marca como lido e apaga |
| 70 Fotos | 1 foto = 1 documento (até 900.000 caracteres, WebP/JPEG, até 1080 px); trabalho: clientes leem; pedido: só o prestador daquele contato |
| 80 Divulgacoes_Home | **v0.8.2** só o adm grava; prestador lê só `publicado` e do público dele (geral ou uma das atividades dele). **v0.8.5:** cliente CPF/CNPJ lê só `publicado` com `publico` = `clientes` (avisos e anúncios); anúncio sempre `clientes` e com imagem ou descrição; evento e grupo nunca `clientes`. Visitantes não leem. Interruptor `SEGMENTAR_PUBLICO()` (plano B) |

Ao mudar um limite, mude também na tela para a pessoa não digitar mais do que o banco aceita:

| Campo | Limite | Onde mudar na tela |
|---|---|---|
| nome (CPF/adm) | 120 | `maxlength` em `perfil-cliente-cpf/index.html`, `perfil-adm/index.html` · `max` em `login-cadastro/login-cadastro.js` |
| razaoSocial | 150 | `perfil-cliente-cnpj/index.html`, `perfil-prestador/index.html` · `login-cadastro.js` |
| nomeFantasia / responsavelNome / contatoNome | 120 | páginas de perfil CNPJ e prestador · `login-cadastro.js` (responsável) |
| responsavelCargo / contatoFuncao / tipoEstabelecimento | 60 | páginas de perfil CNPJ e prestador |
| sobre (prestador) | 600 | `perfil-prestador/index.html` |
| areaAtuacao / especialidades (atividades secundárias) | 8 itens · 60 cada | lista única em `configuracoes/config.js` (servicos) |
| cidadesAtendidas | 20 itens · 60 cada | `perfil-prestador/perfil-prestador.js` (MAX_CIDADES) |
| horarioVisitas / horarioAtendimento | 3 faixas · obs 80 | `componentes/datahora/datahora.js` (CONFIG) |
| anoInicio | 1975 até o ano atual | `configuracoes/config.js` (anoInicioMinimo) + área 00 das regras |
| certificacoes | 10 itens · 40 cada | `perfil-prestador/perfil-prestador.js` (CONFIG) |
| foto | 60.000 caracteres (~45 KB) | `componentes/perfil-base/perfil-base.js` (FOTO) |
| fotos (coleção) | 900.000 caracteres · 1080 px | `firebase/fotos.js` (FOTOS) |
| orçamento | descrição 300 · observação 500 · valores até R$ 10 milhões · validade 1–365 dias | `firebase/pedidos.js` (limparOrcamento) |
| Pedir contato | mensagem 10–500 · até 6 fotos | `firebase/pedidos.js` (REGRAS) |
| telefones | 5 (1 + 4) | `componentes/perfil-base/perfil-base.js` (CONFIG) |
| endereço: rua 150 · número 10 · complemento 60 · bairro 80 · cidade 80 | | `componentes/endereco/endereco.js` |
| e-mail | 254 | todas as telas (norma do e-mail) |

## Coleção `vitrine` (cartão público do prestador)
- Atualizada sozinha quando o prestador abre ou salva o perfil, troca a logo ou liga/desliga Localização / Mostrar contatos.
- Tem: nome, área, atividades secundárias, tipos de serviço (`categorias`), sobre, horário, cidades, bairro/cidade/UF, logo, WhatsApp (só se liberado) e ponto aproximado (~110 m, só com Localização ligada).
- **Nunca** tem CPF/CNPJ, e-mail, telefone fixo ou endereço completo.
- **Índice:** a busca usa `where("categorias", "array-contains", …)` — o Firestore cria esse índice sozinho (campo único).

## Configurações do site (`configuracoes/site`)
- Criado sozinho na 1ª vez que o adm mexe no botão **Conferir CPF e CNPJ** (Perfil do adm → aba Administração).
- `conferirDocumentos`: `true` = confere CPF/CNPJ (na tela **e nas regras do banco**: dígitos verificadores) e consulta o CNPJ do prestador · `false` = **modo teste**.
- `mostrarDestaques` (**v0.8.5**): `true` = mostra os destaques pagos · `false` = ninguém aparece como destaque (a marca é tirada na leitura da vitrine).
- Cada campo é um **botão de comando** da aba Administração. Comando novo = campo novo aqui + área 40 das regras.
- Todos leem; só o adm muda (regras).

## Selo de prestador verificado (pelo console, até existir a fila no site)
1. Firestore → `usuarios` → perfil do prestador → veja `cnpjConsulta` (`resultado`: ok, divergente, nao-encontrado, sem-resposta ou modo-teste).
2. Conferiu (se precisar, peça o CCMEI ou cartão CNPJ)? Adicione o campo `verificado` (booleano) = `true`.
3. A própria pessoa não consegue criar nem mudar `verificado` nem `cnpjConsulta` (regras).

## Padrão de e-mail confirmado
- Sem confirmar: **não** cria perfil nem reserva CPF/CNPJ (cadastro em 2 passos). Contas antigas sem confirmação continuam vendo o aviso.
- Ações com outras pessoas (busca, pedidos, orçamentos, avaliações — Ciclos 3 e 4): usar `emailConfirmado()` nas regras.

## Coleções do Ciclo 3 (v0.8.0)
- `orcamentos/{pedidoId_prestadorUid}`: 1 por prestador em cada pedido (sem repetição). Campos: ids, situação, origem (whatsapp/pedido), categoria, serviço, nome de exibição e região do cliente, nome do prestador, datas (`contatoEm`, `ultimoContatoEm`, `respondidoEm`, `decididoEm`, `concluidoEm`, `prestadoEm`, `atualizadoEm`, `apagarEm` = +1 ano), `orcamento` (mapa), `mensagem`/`fotos` (só Pedir contato), `whatsapp` (só Pedir contato, enviado com o orçamento), `arquivadoPrestador`.
- `avisos/{id}`: para, de, tipo, orcamentoId, nome, serviço, lido, criadoEm, apagarEm (+30 dias).
- `fotos/{id}`: dono, tipo (trabalho/local/pedido), ref, legenda, formato, largura, altura, dados, url (reservado), criadoEm.
- **Índices:** as buscas usam só `where(campo, "==", …)` (clienteUid, prestadorUid, para) — o Firestore cria esses índices sozinho. Nada a configurar.
- **Sem servidor:** prazos (10 dias, 1 ano, 30 dias) são conferidos quando cliente ou prestador abre o site; as regras conferem as datas.

## Coleção `divulgacoes` — Home do prestador (v0.8.2)
Eventos, grupos/comunidades e comunicados que aparecem na **Home do prestador**. **Só o adm cadastra** (por enquanto pelo console; não existe painel).

### 1. Criar os índices (uma vez, grátis)
Firestore Database → **Índices** → **Compostos** → **Criar índice**:
| Coleção | Campo 1 | Campo 2 |
|---|---|---|
| `divulgacoes` | `situacao` · Crescente | `atividades` · **Matrizes (array-contains)** |
| `divulgacoes` | `situacao` · Crescente | `publico` · Crescente |
Escopo: **Coleção**. Leva alguns minutos para ficar "Ativado". (O mesmo está em `firestore.indexes.json`.)
Se faltar um índice, o console do navegador (F12) mostra o erro com um **link que cria o índice** sozinho.

### 2. Cadastrar pelo site (v0.8.3) — Perfil do adm → aba **Divulgações**
Formulário (novo/editar), lista com **Editar · Publicar/Suspender · Encerrar · Excluir** (todos pedem confirmação) e
**Criar exemplos ilustrativos / Apagar exemplos** (9 divulgações fictícias com `exemplo: true`, etiqueta "Exemplo ilustrativo" na Home).
**Apague os exemplos antes do lançamento** (e as imagens `fotos/divulgacoes/exemplo-*.webp`).

### 2b. Cadastrar pelo console (alternativa)
Firestore → `divulgacoes` → **Adicionar documento** → **ID automático** → crie os campos abaixo (tipo entre parênteses).
> O console **não passa pelas regras** (é acesso de dono). Siga o modelo: campo com nome ou formato errado é **ignorado** pela tela, e a divulgação pode não aparecer.

**Campos de todos**
| Campo | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `tipo` | string | sim | `evento` · `grupo` · `comunicado` · `anuncio` (**v0.8.5**, só `publico` = `clientes`) |
| `titulo` | string | sim | até 120 |
| `situacao` | string | sim | `publicado` (aparece) · `suspenso` · `encerrado` (não aparecem) |
| `publico` | string | sim | `geral` (todos os prestadores) · `atividades` (só as áreas da lista abaixo) · `clientes` (**v0.8.5**: Home dos clientes; só `comunicado` e `anuncio`) |
| `atividades` | array de string | se `publico` = `atividades` | até 10 nomes **iguais** aos de `configuracoes/config.js` → `servicos` (ex.: `Marcenaria`, `Elétrica`). Vale para a área de atuação **e** para as atividades secundárias |
| `descricao` | string | não | até 1.500 (linha em branco = novo parágrafo) |
| `imagem` | string | não | nome do arquivo em `fotos/divulgacoes/` (ex.: `feira-2026.webp`) **ou** imagem em texto `data:image/webp;base64,...` (até 300.000). Links de outros sites são **bloqueados** |
| `link` | string | não | só `https://...` (inscrição ou mais informações) · `linkTexto` (string, até 40) muda o texto do botão |
| `ordem` | number (inteiro) | não | menor aparece primeiro (sem ordem = fim) |
| `exemplo` | boolean | não | `true` = exemplo ilustrativo (só para visualizar; "Apagar exemplos" remove) |
| `data` | string | evento: sim · comunicado: não | `AAAA-MM-DD` (ex.: `2026-12-05`) |

**Só evento:** `subtitulo` (160) · `dataFim` (`AAAA-MM-DD`, vários dias) · `horaInicio` / `horaFim` (`HH:MM`) · `modalidade` (`presencial`, `online`, `hibrido`) · `localNome` (120) · `cidade` (80) · `uf` (`SP`) · `endereco` (200) · `buffet` (boolean) + `buffetEmpresa` (120) · `estacionamento` (`gratuito`, `pago`, `nao`) + `estacionamentoObs` (120) · `organizador` (120).
Evento cuja data (ou `dataFim`) já passou **some sozinho**. Para tirar antes: `situacao` = `suspenso` ou `encerrado`.

**Só grupo:** `redes` (**map**) com os links que existirem: `whatsapp`, `telegram`, `instagram`, `facebook`, `youtube`, `linkedin`, `site` (todos `https://`) · `regiao` (80) ou `cidade` + `uf`. Grupo sem nenhum link válido não aparece.

**Só comunicado:** `nivel` (`info` = normal · `atencao` = importante, borda amarela). Com `publico` = `clientes` vira **Aviso da S.D** na Home dos clientes (v0.8.5).

**Só anúncio (v0.8.5):** `publico` = `clientes` sempre · precisa de `imagem` **ou** `descricao` · `organizador` (120) = anunciante. Sempre aparece com a etiqueta "Anúncio".

Campo não informado **não aparece** na tela (nada é inventado).

### 3. Privacidade (LGPD)
- A tela lê só a **área de atuação** e as **atividades secundárias** do próprio prestador, para escolher os eventos. Nada é gravado; não há registro de quem viu ou clicou.
- Links externos abrem em nova aba com `noopener noreferrer` (o outro site não controla a S.D nem recebe o endereço da página).
- Sem cookies, rastreadores, GPS ou dados de redes sociais.

## Limites do plano grátis (conferido em 10/11/2026 e 18/11/2026)
- Login: cerca de 3.000 usuários ativos por dia · e-mails de confirmação 1.000/dia · nova senha 150/dia.
- Banco: 1 GiB · 50 mil leituras e 20 mil gravações por dia.
- Cloud Storage exige o plano pago Blaze (desde 03/02/2026) → **fotos ficam no próprio banco**, compactadas (v0.8.0). Estimativa medida nos testes: 57–370 KB de texto por foto (foto comum ~60–130 KB) → 1 GiB ≈ 8 a 15 mil fotos. Cada abertura de foto conta no limite de 10 GiB/mês de download.

## Situação
- ✅ Login por e-mail, cadastro (CPF/CNPJ único), sair, nova senha pelo pop-up, confirmação de e-mail.
- ✅ Perfis com dados reais: editar, telefones, botões liga/desliga, excluir conta.
- ✅ Botão do adm "Conferir CPF e CNPJ", consulta do CNPJ do prestador, limpeza de cadastro parado no meio, aviso de e-mail em todas as páginas (v0.7.5).
- ✅ v0.7.6: cadastro em 2 passos, CPF/CNPJ conferido nas regras, tipo da conta travado na reserva, limite de tamanho por campo, lista fechada de campos, CSP.
- ✅ v0.7.9: regras por área, vitrine do prestador, ponto no mapa (Nominatim), foto de perfil salva, sem dados fictícios.
- ✅ v0.8.0: contatos/orçamentos, avisos (sino), fotos compactadas, aviso de preço da visita.
- ✅ v0.8.2: coleção `divulgacoes` (Home do prestador) + área 80 das regras + 2 índices.
- ✅ v0.8.3: aba Divulgações do adm (cadastrar/editar/apagar pelo site) + exemplos ilustrativos (campo `exemplo`).
- 🟠 v0.8.5: avisos e anúncios da Home dos clientes (tipo `anuncio`, público `clientes`; anunciante no campo `organizador`). Usa o índice `situacao` + `publico` que já existe. Falta teste com as regras reais.
- ⬜ Avaliações reais (Ciclo 4) · login por CPF/CNPJ.
- ⏸️ Pago (pós-MVP): fotos no Storage (+ AVIF), e-mail/celular de aviso, prazos automáticos sem abrir o site, cookie HttpOnly, selo automático, limpeza automática de contas e de cadastros pendentes, consulta do CNPJ no servidor.
