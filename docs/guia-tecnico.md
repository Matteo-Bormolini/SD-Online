# Guia técnico — S.D Serviços Digitais

Tudo o que você precisa saber para mexer no código sem quebrar o padrão.

---

## 1. Regras de ouro

1. **Menu, rodapé, cores, botões e campos** existem uma vez só. Para mudar, edite só a pasta deles.
2. **Toda página nova** nasce do [`modelo-pagina/`](../modelo-pagina/).
3. **Todo link entre páginas** fica em `configuracoes/config.js`.
4. **Esconder na tela não é segurança.** O bloqueio de verdade é feito no servidor.

## 2. Onde mudar cada coisa

| Quero mudar... | Arquivo |
|---|---|
| Cores, fontes, botões, links, mensagens | `configuracoes/base.css` |
| Links das páginas, itens do menu e do rodapé, ícones | `configuracoes/config.js` |
| Quem vê cada página e cada dado | `seguranca/acesso.js` **e** `seguranca/permissoes.json` |
| Botões liga/desliga (lista, padrão ligado/desligado) | `configuracoes/interruptores.js` (consulta: Perfil do adm → aba Administração) |
| Pop-up "Tem certeza?" de excluir/editar | `componentes/confirmacao/confirmacao.js` |
| Barra do topo | `navbar/` |
| Rodapé | `rodape/` |
| Campos de formulário | `componentes/formulario/formulario.css` |
| Formatar telefone, CEP, data, R$, estrelas | `componentes/utilidades/utilidades.js` |
| O que é igual nos 4 perfis | `componentes/perfil-base/` |
| Campos de endereço e busca pelo CEP | `componentes/endereco/` (serviços do CEP em `configuracoes/config.js` → `cep`) |
| Regra de senha (mínimo, senhas proibidas) | `componentes/senha/senha.js` **e** o servidor |
| Quais identificadores entram no login (e-mail, CPF, CNPJ…) | `servicos/identificadores.js` **e** o servidor |
| Conversa com o servidor (recuperar senha) | `servicos/recuperacao.js` (endereço da API em `configuracoes/config.js` → `api`) |
| Pop-ups (visual) | `configuracoes/base.css`, seção 9 |

## 3. Como toda página é montada

Cada página fica em `<pasta>/index.html`, com o CSS e o JS dela na mesma pasta.

**Ordem dos arquivos no `<head>`:**

```html
<!-- 1. Estilos do padrão -->
<link rel="stylesheet" href="../configuracoes/base.css">
<link rel="stylesheet" href="../navbar/navbar.css">
<link rel="stylesheet" href="../rodape/rodape.css">
<!-- 2. Estilos dos componentes usados (opcional) e da página -->
<link rel="stylesheet" href="NOME-DA-PAGINA.css">

<!-- 3. Scripts, nesta ordem -->
<script src="../seguranca/acesso.js" defer></script>
<script src="../configuracoes/config.js" defer></script>
<script src="../configuracoes/interruptores.js" defer></script> <!-- só se a página tem botões liga/desliga -->
<script src="../navbar/navbar.js" defer></script>
<script src="../rodape/rodape.js" defer></script>
<!-- 4. Scripts dos componentes usados (opcional) e da página -->
<script src="NOME-DA-PAGINA.js" defer></script>
<!-- 5. Firebase SEMPRE por último (type="module") -->
<script type="module" src="../firebase/firebase.js"></script>
```

**Estrutura do `<body>`:**

```html
<body data-pagina="inicio" data-logado="nao" data-tipo="" data-raiz="../" data-recurso="">
  <header id="sd-navbar"></header>   <!-- o menu é montado sozinho -->
  <main id="conteudo"> ... </main>
  <footer id="sd-rodape"></footer>   <!-- o rodapé é montado sozinho -->
</body>
```

| Atributo | Para que serve | Valores |
|---|---|---|
| `data-pagina` | Destaca o item atual do menu | inicio, servicos, clientes, prestador, sobre, politicas, suporte, perfil |
| `data-logado` | Diz se a pessoa entrou (o servidor preenche) | `sim` / `nao` |
| `data-tipo` | Tipo de usuário logado | cliente-cpf, cliente-cnpj, prestador, adm |
| `data-raiz` | Caminho até a pasta principal | `../` |
| `data-recurso` | Regra de acesso da página (vazio = página pública) | um nome de `seguranca/acesso.js`, ex.: `perfil-adm` |
| `data-recurso-publico` | (opcional) Versão pública da página | ex.: `perfil-prestador-publico` |

## 4. Criar uma página nova

1. Copie a pasta `modelo-pagina/` e renomeie (ex.: `sobre/`).
2. Troque o `<title>`, o `data-pagina` e o conteúdo.
3. Se precisar de estilo próprio, crie `sobre.css` usando só as cores `var(--cor-...)` do `base.css`.
4. Se a página não for pública, crie a regra em `seguranca/acesso.js` **e** em `seguranca/permissoes.json`, e coloque `data-recurso` no `<body>`.
5. Coloque o caminho da página em `configuracoes/config.js`.
6. Escreva o README da pasta (use o modelo do item 9).

## 5. Tipos de usuário

O mesmo nome é usado em todo o site.

| Tipo | "Meu perfil" abre | No menu, depois de entrar |
|---|---|---|
| `cliente-cpf` | `perfil-cliente-cpf/` | vê "Serviços" |
| `cliente-cnpj` | `perfil-cliente-cnpj/` | vê "Serviços" |
| `prestador` | `perfil-prestador/` | vê "Seus Serviços" (nunca "Serviços": não vê concorrentes) |
| `adm` | `perfil-adm/` | vê os dois |

O visitante vê os itens com cadeado e é levado ao login ao clicar.

## 6. Modo demonstração (sem servidor)

- Em `configuracoes/config.js`: `modoDemonstracao: true`.
- Ao "entrar", o site guarda só `{ tipo, nome }` na aba do navegador (`sessionStorage`). **Nunca guarda senha.**
- Fechar a aba ou abrir `?sair=1` desconecta.
- **Proteção das páginas:** se a pessoa não pode ver a página (`data-recurso`), o visitante vai para o login e quem já entrou vai para o início. Se existir `data-recurso-publico` e a pessoa puder vê-lo, abre só a versão pública (`?visao=cliente`).
- Quando o servidor existir: troque para `modoDemonstracao: false`.

## 7. Cores oficiais

| Uso | Cor |
|---|---|
| Fundo (tema claro) | `#F2ECE6` |
| Botões | fundo `#FFFFFF`, borda `#000000` |
| Hover de botões, links e setas | `#800000` |
| Menu e rodapé | `#800000` (hover do menu `#5C0000`) |
| Fundo (tema escuro) | `#161312` |
| Destaque pago (contorno e etiqueta) | `#E00000` (escuro: `#FF4545`) |

O site abre no tema claro. Se a pessoa escolher o escuro, ele fica salvo no navegador e continua em todas as páginas até ela clicar de novo.
Regras visuais completas: [`padrao-global.md`](padrao-global.md) e [`prompt-mestre-padrao-visual.md`](prompt-mestre-padrao-visual.md).

## 8. Segurança

- `data-logado`, `data-tipo` e a sessão de demonstração **só mudam a tela**. Qualquer pessoa pode alterar isso no navegador.
- Login, permissões e dados têm de ser conferidos **no servidor** (Ciclo 2 · Contas reais).
- Senha: só o *hash* fica no servidor. Ninguém vê, nem o administrador.
- Textos vindos de fora passam por escape (`textContent` ou `SD.esc`) antes de entrar na página.
- Chaves de API, fotos de usuários e cópias do banco **nunca** vão para o GitHub. O `.gitignore` da raiz bloqueia esses arquivos.
- Localização: o servidor envia ao navegador só uma área aproximada, nunca o endereço exato.
- Recuperação de acesso (senha e login): regras completas em [`seguranca/recuperacao-acesso.md`](../seguranca/recuperacao-acesso.md).
- Senhas: mínimo de 6 caracteres (desde 11/11/2026), guardadas pelo **Firebase Authentication** (regra da tela em `componentes/senha/`).

## 9. Modelo de README de pasta

Todo README é curto, em tópicos e fácil de ler:

```markdown
# Nome da pasta

Uma ou duas frases: para que serve.

## Quem vê
## Arquivos
| Arquivo | Para que serve |
## Como mudar
## Situação
✅ pronto · 🟠 pronto, falta teste real · ⬜ a fazer (com o Ciclo) · ⏸️ pago (depois do MVP)
```

## 10. Destaque pago (tag `destaque`)

- No banco/API o prestador recebe a tag: `tags: ["destaque"]`.
- No HTML: `data-tag="destaque"` → o `base.css` pinta o contorno de vermelho em qualquer elemento.
- Etiqueta visível: `<span class="tag-destaque">Destaque pago</span>` (nunca esconder: é anúncio pago).
- Em JS: `SD.ehDestaque(item)`. Nome da tag e texto ficam em `config.js` → `destaque`.
- Quem liga e desliga: o administrador (página futura com filtros).

## 11. Serviços gratuitos (regra: grátis e sem prazo de validade)

| Para quê | Serviço | Situação (conferido em 05/11/2026) |
|---|---|---|
| Mapa | MapLibre GL (biblioteca, BSD) + OpenFreeMap (mapas) | Sem chave, sem cadastro, sem limite de visualizações, uso comercial liberado. Sem garantia de funcionamento (SLA). |
| CEP → endereço (06/11/2026) | ViaCEP; reserva: BrasilAPI | Sem chave e sem cadastro. ViaCEP avisa que uso em massa pode bloquear o acesso: o site só consulta quando a pessoa digita um CEP completo. |
| E-mail de recuperação (a decidir no Ciclo 1) | Ex.: Brevo (plano grátis com 300 e-mails/dia) | Conferir de novo antes de usar: planos grátis mudam. Ver `seguranca/recuperacao-acesso.md`. |
| Rota até um endereço | Links do Google Maps e do Waze | Sem chave. **Não usado** em Localizar prestador (decisão de 05/11). |
| Distância | Cálculo próprio (Haversine) | Sem serviço externo. |
| Hospedagem de teste | GitHub Pages | Grátis, mas os termos **não permitem** usar como site de negócio. Serve só para testes. |
| Lançamento (a decidir no Ciclo 1) | Cloudflare (Pages/Workers + banco D1) | Plano grátis sem prazo: D1 com 5 GB, 5 milhões de leituras e 100 mil gravações por dia. |
| Alternativas de banco | Firebase Spark / Supabase Free | Firebase: grátis sem prazo, com cotas diárias. Supabase: o projeto **pausa após 1 semana sem uso**. |

## 12. Publicar no GitHub Pages

1. Envie o conteúdo do projeto para a raiz do repositório.
2. No GitHub: **Settings → Pages → Source: Deploy from a branch** → branch `main`, pasta `/ (root)`.
3. O `index.html` da raiz abre a página inicial.

## 13. Firebase — detalhes técnicos

Uso do dia a dia (publicar regras, criar adm, selo verificado, limites do plano grátis): [`firebase/README.md`](../firebase/README.md).
Aqui ficam os detalhes para quem mexe no código ou nas regras (antes no README do Firebase, mudados para cá em 27/11/2026).

### Como entra nas páginas
Último script do `<head>` de **toda** página (já colocado em todas):
```html
<script type="module" src="../firebase/firebase.js"></script>
```
`type="module"` não funciona abrindo o arquivo direto do PC (`file://`). Teste pelo GitHub Pages ou pelo Live Server do VS Code.

### Configurar no console (uma vez)
1. **Ligar o projeto:** Configurações do projeto → Seus apps → SDOnline Web → copie o `firebaseConfig` e cole no **bloco 1** de `firebase.js`.
   A `apiKey` pode ficar pública (é assim no Firebase). Quem protege são as regras.
2. **Regras do banco:** Firestore Database → **Regras** → apague tudo → cole `firestore.rules` → **Publicar**.
   Para voltar atrás: aba **Regras** → histórico (relógio, à esquerda) → versão anterior.
3. **Política de senha** (igual ao site): Authentication → Configurações → Política de senha →
   modo **Exigir** · **nenhuma** exigência de caracteres marcada · mínimo **6** · máximo **128**.
4. **Links dos e-mails abrem o site:** Authentication → Modelos → lápis de qualquer modelo →
   **Personalizar URL de ação** → `https://matteo-bormolini.github.io/SD-Online/login-cadastro/index.html` → Salvar.
5. **Domínio autorizado:** Authentication → Configurações → Domínios autorizados → `matteo-bormolini.github.io` (e `127.0.0.1` para testar no PC).

### Cadastro em 2 passos (desde v0.7.6)
1. A pessoa preenche o cadastro → o site cria o **login** e guarda os dados em `cadastrosPendentes/{uid}` (só ela vê). **Nenhum CPF/CNPJ é reservado.**
2. Ela clica no link do e-mail → o site cria o **perfil** + a **reserva** do CPF/CNPJ (com o tipo da conta) e apaga o pendente.
   Abriu o link em outro aparelho? Ao entrar com e-mail e senha (ou em "Já cliquei no link"), o cadastro é concluído.
- O CPF/CNPJ já tinha dono quando ela confirmou? O login é apagado e aparece "Este CPF/CNPJ já tem uma conta".
- Pendentes antigos (quem nunca confirmou): o adm pode apagar pelo console (`cadastrosPendentes`). Limpeza automática = pós-MVP (pago).

### Regras do banco: mapa das áreas (v0.8.0)
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

### Coleção `vitrine` (cartão público do prestador)
- Atualizada sozinha quando o prestador abre ou salva o perfil, troca a logo ou liga/desliga Localização / Mostrar contatos.
- Tem: nome, área, atividades secundárias, tipos de serviço (`categorias`), sobre, horário, cidades, bairro/cidade/UF, logo, WhatsApp (só se liberado) e ponto aproximado (~110 m, só com Localização ligada).
- **Nunca** tem CPF/CNPJ, e-mail, telefone fixo ou endereço completo.
- **Índice:** a busca usa `where("categorias", "array-contains", …)` — o Firestore cria esse índice sozinho (campo único).

### Configurações do site (`configuracoes/site`)
- Criado sozinho na 1ª vez que o adm mexe no botão **Conferir CPF e CNPJ** (Perfil do adm → aba Administração).
- `conferirDocumentos`: `true` = confere CPF/CNPJ (na tela **e nas regras do banco**: dígitos verificadores) e consulta o CNPJ do prestador · `false` = **modo teste**.
- `mostrarDestaques` (**v0.8.5**): `true` = mostra os destaques pagos · `false` = ninguém aparece como destaque (a marca é tirada na leitura da vitrine).
- Cada campo é um **botão de comando** da aba Administração. Comando novo = campo novo aqui + área 40 das regras.
- Todos leem; só o adm muda (regras).

### Padrão de e-mail confirmado
- Sem confirmar: **não** cria perfil nem reserva CPF/CNPJ (cadastro em 2 passos). Contas antigas sem confirmação continuam vendo o aviso.
- Ações com outras pessoas (busca, pedidos, orçamentos, avaliações — Ciclos 3 e 4): usar `emailConfirmado()` nas regras.

### Coleções do Ciclo 3 (v0.8.0)
- `orcamentos/{pedidoId_prestadorUid}`: 1 por prestador em cada pedido (sem repetição). Campos: ids, situação, origem (whatsapp/pedido), categoria, serviço, nome de exibição e região do cliente, nome do prestador, datas (`contatoEm`, `ultimoContatoEm`, `respondidoEm`, `decididoEm`, `concluidoEm`, `prestadoEm`, `atualizadoEm`, `apagarEm` = +1 ano), `orcamento` (mapa), `mensagem`/`fotos` (só Pedir contato), `whatsapp` (só Pedir contato, enviado com o orçamento), `arquivadoPrestador`.
- `avisos/{orcamentoId_tipo}`: para, de, tipo, orcamentoId, nome, serviço, lido, criadoEm, apagarEm (+30 dias). 1 por tipo em cada orçamento; o banco confere o tipo com a situação (v0.8.5).
- `fotos/{id}`: dono, tipo (trabalho/local/pedido), ref, legenda, formato, largura, altura, dados, url (reservado), criadoEm.
- **Índices:** as buscas usam só `where(campo, "==", …)` (clienteUid, prestadorUid, para) — o Firestore cria esses índices sozinho. Nada a configurar.
- **Sem servidor:** prazos (10 dias, 1 ano, 30 dias) são conferidos quando cliente ou prestador abre o site; as regras conferem as datas.

### Coleção `divulgacoes` — Home do prestador (v0.8.2)
Eventos, grupos/comunidades e comunicados que aparecem na **Home do prestador**. **Só o adm cadastra** (por enquanto pelo console; não existe painel).

#### 1. Criar o índice (uma vez, grátis)
Firestore Database → **Índices** → **Compostos** → **Criar índice**:
| Coleção | Campo 1 | Campo 2 |
|---|---|---|
| `divulgacoes` | `situacao` · Crescente | `publico` · Crescente |
Escopo: **Coleção**. Leva alguns minutos para ficar "Ativado". (O mesmo está em `firestore.indexes.json`.)
Se faltar um índice, o console do navegador (F12) mostra o erro com um **link que cria o índice** sozinho.

#### 2. Cadastrar pelo site (v0.8.3) — Perfil do adm → aba **Divulgações**
Formulário (novo/editar), lista com **Editar · Publicar/Suspender · Encerrar · Excluir** (todos pedem confirmação) e
**Criar exemplos ilustrativos / Apagar exemplos** (9 divulgações fictícias com `exemplo: true`, etiqueta "Exemplo ilustrativo" na Home).
**Apague os exemplos antes do lançamento** (e as imagens `fotos/divulgacoes/exemplo-*.webp`).

#### 2b. Cadastrar pelo console (alternativa)
Firestore → `divulgacoes` → **Adicionar documento** → **ID automático** → crie os campos abaixo (tipo entre parênteses).
> O console **não passa pelas regras** (é acesso de dono). Siga o modelo: campo com nome ou formato errado é **ignorado** pela tela, e a divulgação pode não aparecer.

**Campos de todos**
| Campo | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `tipo` | string | sim | `evento` · `grupo` · `comunicado` · `anuncio` (**v0.8.5**, só `publico` = `clientes`) |
| `titulo` | string | sim | até 120 |
| `situacao` | string | sim | `publicado` (aparece) · `suspenso` · `encerrado` (não aparecem) |
| `publico` | string | sim | `geral` (todos os prestadores) · `atividades` (só as áreas da lista abaixo) · `clientes` (**v0.8.5**: Home dos clientes; só `comunicado` e `anuncio`) · `todos` (**v0.8.5**: clientes **e** prestadores; só `comunicado`, ex.: site fora do ar) |
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

**Só comunicado:** `nivel` (`info` = normal · `atencao` = importante, borda amarela). Onde aparece (v0.8.5): `todos` → **Comunicados da S.D** dos clientes e dos prestadores · `clientes` → **Comunicados da S.D** só dos clientes · `geral` ou `atividades` → **Divulgações** da Home do prestador.

**Só anúncio (v0.8.5):** `publico` = `clientes` sempre · precisa de `imagem` **ou** `descricao` · `organizador` (120) = anunciante. Sempre aparece com a etiqueta "Anúncio".

Campo não informado **não aparece** na tela (nada é inventado).

#### 3. Privacidade (LGPD)
- A tela lê só a **área de atuação** e as **atividades secundárias** do próprio prestador, para escolher os eventos. Nada é gravado; não há registro de quem viu ou clicou.
- Links externos abrem em nova aba com `noopener noreferrer` (o outro site não controla a S.D nem recebe o endereço da página).
- Sem cookies, rastreadores, GPS ou dados de redes sociais.
