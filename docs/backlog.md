# Backlog do produto — S.D Serviços Digitais

Aqui está **tudo o que a S.D precisa ter**, escrito do ponto de vista de quem vai usar.
O [README principal](../README.md) mostra o resumo; este arquivo mostra os detalhes.

**Legenda:** ✅ Pronto · 🟡 Em andamento ou só na demonstração · ⬜ A fazer

---

## 1. Macro-objetivo (Product Goal)

> **Ajudar casas, empresas e condomínios a encontrar, de forma simples e confiável, um prestador de manutenção perto deles, e ajudar esse prestador a conseguir mais clientes.**

O produto cumpre o objetivo quando:

- o cliente encontra prestadores perto dele em poucos minutos;
- o pedido recebe orçamentos claros e fáceis de comparar;
- cliente e prestador combinam o serviço direto, com segurança;
- a avaliação no fim ajuda o próximo cliente a escolher.

**Como vamos medir:** pedidos feitos, pedidos com pelo menos 1 orçamento, tempo até o primeiro orçamento, orçamentos aceitos e nota média dos prestadores.

---

## 2. Como as histórias são escritas

> **Como** [quem usa], **quero** [o que precisa] **para** [o motivo].

- **Prioridade (MoSCoW):** **M** = obrigatória no MVP · **S** = importante · **C** = desejável · **W** = não agora.
- **Sprint:** em qual Sprint ela foi (ou será) entregue.

---

## 3. O caminho do pedido (fluxo aprovado)

1. **Encontrar:** o cliente escolhe a área (ex.: encanador) e vê os prestadores, do mais perto ao mais longe, com o mapa centrado nele.
2. **Pedir:** na página do prestador, escolhe o serviço e preenche o pedido de orçamento. Pode pedir a quantos prestadores quiser.
3. **Receber:** o pedido entra no quadro do prestador, na coluna **A orçar**. O prestador é avisado no site e por e-mail e decide se atende.
4. **Orçar:** o prestador preenche um orçamento padrão: serviço, materiais, mão de obra, valores e datas de início e fim.
5. **Comparar:** o cliente vê seus pedidos em uma tabela. Em cada pedido, até **4 orçamentos** aparecem lado a lado. Se chegarem mais, ele é avisado de quantos estão guardados.
6. **Decidir:** o cliente **aceita** (com uma janela de confirmação), **recusa** (sem precisar explicar) ou faz uma **contraproposta**.
7. **Combinar:** o prestador libera o **WhatsApp** (botão verde) e/ou o **e-mail** (botão vinho). Botão cinza = contato ainda não liberado. O cliente é avisado quando um contato é liberado.
8. **Avaliar:** depois do serviço, o cliente dá estrelas e comentário.

> **A S.D não faz pagamentos.** Valor e forma de pagamento são combinados entre cliente e prestador.

---

## 4. Épicos e histórias

### E1 · Base do site

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US01 | Como visitante, quero que todas as páginas tenham a mesma aparência e o mesmo menu, para não me perder. | M | 1 | ✅ |
| US02 | Como pessoa de qualquer idade, quero usar o site no celular, no tablet, no computador ou na TV, com letras fáceis de ler e tema claro ou escuro. | M | 1 | ✅ |

### E2 · Conta

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US03 | Como visitante, quero criar minha conta como Cliente CPF, Cliente CNPJ ou Prestador (com CNPJ ou MEI). | M | 1 → 5 | 🟡 Tela pronta |
| US04 | Como usuário, quero entrar e sair da minha conta com segurança, e só ver as páginas do meu tipo de conta. | M | 1 → 5 | 🟡 Tela pronta |
| US05 | Como usuário, quero recuperar minha senha ou meu login se eu esquecer. | M | 2 → 5 | 🟡 Pop-ups prontos (demonstração); e-mail real na Sprint 5 |

### E3 · Perfis

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US06 | Como cliente de uma casa (CPF), quero ver e editar meus dados, para manter meu contato certo. | M | 1 | ✅ Demonstração |
| US07 | Como empresa ou condomínio (CNPJ), quero informar o responsável, o contato no local e fotos das áreas. | M | 1 | ✅ Demonstração |
| US08 | Como prestador, quero um perfil completo (logo, especialidades, região que atendo e fotos de trabalhos), para passar confiança. | M | 1 | ✅ Demonstração |
| US09 | Como prestador, quero ver meu perfil do jeito que o cliente vê, para conferir o que está público. | S | 1 | ✅ Demonstração |
| US10 | Como administrador, quero acessar os dados das contas para dar suporte, **sem nunca ver senhas**. | S | 1 | 🟡 Perfil pronto |

### E4 · Encontrar

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US11 | Como cliente, quero escolher a área do serviço e ver os prestadores do mais perto ao mais longe, com um mapa centrado em mim. | M | 3 | 🟡 Tela pronta (demonstração) |
| US12 | Como cliente, quero filtrar também por nome e por avaliação. | C | Futuro | ⬜ |

### E5 · Pedir e negociar orçamentos

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US13 | Como cliente, quero escolher o serviço na página do prestador e preencher o pedido de orçamento. | M | 3 | ⬜ |
| US14 | Como prestador, quero receber o pedido na coluna "A orçar" do meu quadro e ser avisado no site e por e-mail, para decidir se atendo. | M | 3 → 5 | ⬜ |
| US15 | Como prestador, quero preencher um orçamento padrão (serviço, materiais, mão de obra, valores e datas), para o cliente entender tudo. | M | 3 | ⬜ |
| US16 | Como cliente, quero ver meus pedidos em uma tabela e, em cada um, até 4 orçamentos lado a lado, sendo avisado se chegarem mais. | M | 4 | ⬜ |
| US17 | Como cliente, quero aceitar (com confirmação), recusar (sem explicar o motivo) ou fazer uma contraproposta. | M | 4 | ⬜ |
| US18 | Como prestador, quero ver os orçamentos recusados em vermelho e que eles vão para "Arquivados" depois de 30 dias, podendo apagá-los. | S | 4 | ⬜ |
| US19 | Como cliente, quero pedir um novo orçamento ao mesmo prestador, vendo um aviso vermelho se já existir uma negociação em andamento. | S | 4 | ⬜ |
| US20 | Como cliente, quero voltar à lista de prestadores sem perder os filtros, para pedir outros orçamentos. | S | 4 | 🟡 Tela pronta (demonstração) |
| US21 | Como cliente, quero uma comparação automática dos orçamentos (o que é igual, o que é diferente e o que não combina com meu pedido). Só eu vejo. | C | Futuro | ⬜ |

### E6 · Contato e localização

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US22 | Como prestador, quero escolher quando liberar meu WhatsApp e/ou e-mail; como cliente, quero ser avisado quando um contato for liberado. | M | 4 | ⬜ |
| US23 | Como prestador, quero ver no mapa a região do cliente que me pediu orçamento, **sem** que o endereço exato seja revelado. | S | 4 | ⬜ |

### E7 · Acompanhar e avaliar

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US24 | Como prestador, quero organizar meus serviços por etapa (A orçar, Orçando, Aceito, A realizar, Prestados), para não perder nenhum. | S | 1 → 3 | 🟡 Quadro ainda não está no formato de Kanban que o Marco quer: **refazer na Sprint 3** (falta também a coluna "A orçar") |
| US25 | Como cliente, quero ver os serviços que já contratei, com fotos, para lembrar como ficou. | S | 1 | ✅ Demonstração |
| US26 | Como cliente, quero avaliar o prestador com estrelas e comentário, com meu nome escondido, a menos que eu escolha aparecer. | S | 4 | 🟡 Perfil do prestador já mostra só "Avaliação anônima" ou o nome autorizado |

### E8 · Ajuda e confiança

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US27 | Como usuário, quero tirar dúvidas da plataforma e enviar sugestões, para ser ajudado rápido. | M | 2 | ✅ Demonstração |
| US28 | Como usuário, quero ler os termos de uso, a privacidade e as responsabilidades em linguagem simples. | M | 2 | ⬜ |
| US29 | Como visitante, quero conhecer a história da empresa (Sobre nós), para saber com quem estou falando. | S | 2 | ⬜ |

### E9 · Servidor, segurança e LGPD

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US30 | Como usuário, quero que meus dados fiquem guardados com segurança, e que a senha nunca possa ser vista. | M | 5 | ⬜ |
| US31 | Como dono da plataforma, quero que o servidor bloqueie páginas e dados conforme o tipo de conta. | M | 5 | 🟡 Regras escritas e testadas na tela |
| US32 | Como usuário, quero ver, corrigir, baixar e apagar meus dados, e ter um canal para pedir isso (direitos da LGPD). | M | 5 | 🟡 Editar e excluir prontos na tela |
| US33 | Como usuário, quero que as fotos que envio não revelem onde moro (o servidor apaga a localização escondida na foto). | M | 5 | ⬜ |
| US34 | Como dono da plataforma, quero um plano pronto para avisar a ANPD e os usuários se houver vazamento de dados. | M | 5 | ⬜ |

### E10 · Futuro (depois do MVP)

| Nº | História | Prioridade |
|---|---|---|
| US35 | Como administrador, quero um painel com números, liga/desliga de recursos e edição de contas. | C |
| US36 | Como prestador, quero **informar** como cobro (Pix, dinheiro, cartão...), só como informação para o cliente. | C |
| US37 | Como prestador, quero pagar por um destaque, que aparece identificado como "Destaque pago" (contorno vermelho, tag `destaque`). | C |
| US42 | Como usuário, quero ligar ou desligar o uso da minha localização no perfil; desligado, não apareço em mapas e listas. | M |
| US43 | Como prestador, quero escolher se meu WhatsApp aparece na busca (desligado: botão cinza até o orçamento). | S |
| US44 | Como administrador, quero uma página com filtros para ligar e desligar o destaque dos prestadores. | C |
| US38 | Como cliente, quero comparar preços de equipamentos (ex.: TV de monitoramento). | C |
| US39 | Como usuário, quero o app nas lojas, entrar com a digital e receber avisos também pelo telefone. | C |
| US40 | Como usuário, quero que o Assistente do Suporte responda com inteligência artificial. | C |
| US41 | Como prestador, quero juntar em um só cadastro as opções CNPJ e MEI. | C |
| US45 | Como prestador, quero a página **Seus Serviços** com o mapa dos clientes que estão orçando comigo e dos que vão realizar o serviço comigo (região aproximada). | S |
| US46 | Como prestador, quero uma **Home própria**, sem dados de outros prestadores (concorrência), com o que me ajuda no dia a dia. | S |
| US47 | Como dono (perfil **Master**), quero cadastrar administradores e ligar/desligar o que cada um pode fazer no site. | C |
| US48 | Como empresa, condomínio ou cliente CPF, quero registrar (de forma opcional) **quem acompanhou o prestador** e **quantas visitas** foram precisas até concluir; o síndico/gerente/titular decide se esse registro é obrigatório ou opcional. | C |
| US49 | Como usuário, quero entrar também com o **telefone principal** (depois de confirmado). Nome completo **não** será jeito de entrar (pessoas com o mesmo nome). | C |
| US50 | Como usuário com duas contas (ex.: prestador que também é Cliente CPF), quero **trocar de conta** pelo perfil sem sair e entrar de novo. | C |

---

## 5. Priorização MoSCoW (o que entra no MVP)

O **MVP** é a menor versão que já resolve o problema de verdade: encontrar, pedir, comparar, combinar e avaliar.

| Grupo | O que entra |
|---|---|
| **Must** (obrigatório no MVP) | Base do site · criar conta, entrar, sair e recuperar senha · perfis de cliente e de prestador · encontrar por área e proximidade · pedir orçamento · orçamento padrão · comparar até 4 · aceitar, recusar ou contrapropor · liberar WhatsApp e e-mail · Suporte · termos e privacidade · servidor seguro e direitos da LGPD |
| **Should** (importante, mas o MVP funciona sem) | Ver perfil como cliente · perfil do administrador · recusados e arquivados · novo orçamento ao mesmo prestador · voltar à lista com filtros · mapa aproximado do cliente · quadro "Meus serviços" · serviços realizados · avaliações · Sobre nós |
| **Could** (desejável) | Filtros por nome e avaliação · comparação automática de orçamentos · painel do administrador · formas de pagamento informadas · destaque pago · comparar preços · app nas lojas, digital e avisos por telefone · assistente com IA · cadastro único CNPJ/MEI |
| **Won't** (não agora) | Pagamento dentro do app · chat dentro do app · prestador sem CNPJ ou MEI (só se vier como sugestão de melhoria) · outras categorias, guardadas para o futuro (Serviços domésticos, Aulas, Eventos, Beleza e bem-estar, Automóveis, Pets) |

---

## 6. Plano de Sprints (2 semanas cada)

| Sprint | Período | Objetivo da Sprint | Histórias | Status |
|---|---|---|---|---|
| **1 · Base e contas** | 12/10 a 25/10/2026 | Site com cara de produto: padrão visual, menu, login de demonstração e perfis. | US01–US04 (tela), US06–US10, US24, US25 | ✅ Concluída |
| **2 · Ajuda e confiança** | 26/10 a 08/11/2026 | Onde pedir ajuda, o que ler antes de confiar, e projeto organizado. | US27, US28, US29 + faxina técnica + README e backlog | 🟡 Em andamento |
| **3 · Encontrar e pedir** | 09/11 a 22/11/2026 | O cliente encontra o prestador e pede orçamento; o prestador recebe e responde. | US11, US13, US14 (tela), US15, US24 | ⬜ Planejada |
| **4 · Comparar e combinar** | 23/11 a 06/12/2026 | O cliente compara e decide; os dois combinam com segurança; o cliente avalia. | US16–US20, US22, US23, US26 | ⬜ Planejada |

**Depois do plano inicial:** **Sprint 5 · Servidor de verdade** (07/12 a 20/12/2026): banco de dados, login real, avisos por e-mail, permissões no servidor e LGPD (US03–US05, US14, US30–US34).
Ela é a mais pesada e pode virar duas Sprints. É melhor ajustar o plano do que entregar sem testar.

**O MVP fica completo quando todas as histórias Must estiverem prontas, com o servidor funcionando.**

### O que a Sprint 2 já entregou

- ✅ Suporte com dúvidas, sugestões e assistente.
- ✅ README de todas as pastas e este backlog.
- ✅ Fim dos links quebrados: "Sobre nós" em `home/sobre.html`; os 4 documentos legais juntos em `politica-privacidade/`; páginas sem conteúdo mostram "Esta página ainda está em desenvolvimento.".
- ✅ Ajustes de 05/11: tema escuro salvo entre páginas; rodapé do computador mais baixo e espalhado; destaque pago em vermelho brilhante com a tag `destaque`.
- ✅ Adiantado da Sprint 3: tela de **Localizar prestador** (demonstração).
- ✅ Ajustes de 06/11/2026:
  - menu: "Para clientes" virou **Serviços**; "Seja um prestador" virou **Seus Serviços**; saiu o antigo "Serviços";
  - rodapé: documentos legais só na linha de baixo; sem a frase da marca; lugar pronto para os selos oficiais das lojas;
  - endereço com **CEP automático** em todos os cadastros e perfis (CEP | Endereço · UF | Cidade | Bairro · Número | Complemento);
  - cadastro: e-mail obrigatório, sem "Nome de login", CPF/CNPJ conferidos (CNPJ com letras aceito), senha de **12+ caracteres**;
  - Cliente CPF: botão de privacidade e link para o perfil do prestador nos serviços realizados;
  - Cliente CNPJ: cargo em lista e horário de visitas com dias e horas válidos;
  - Prestador: avaliações anônimas; Home sem dados de concorrentes;
  - **US05:** pop-ups de recuperação de senha e de login (adiantado da Sprint 5, só a tela).
- ✅ Faxina técnica:
  - um só modelo de página (`modelo-pagina/`);
  - arquivos de versões antigas removidos;
  - `.gitignore` e `chaves-api/.env.example` criados;
  - páginas protegidas no modo demonstração: quem não pode ver é levado ao login ou ao início;
  - Home com o fluxo aprovado (até 4 orçamentos, WhatsApp ou e-mail).

---

## 7. Decisões em aberto

| Decisão | Opções | Até a Sprint |
|---|---|---|
| Onde publicar o site no lançamento (grátis e sem prazo) | Cloudflare (recomendado) · Firebase · outra | 5 |
| ~~O que a página "Seja um prestador" mostra~~ | **Decidido em 06/11:** vira **Seus Serviços** (US45). Ideia ainda em formação. | — |
| Como será a Home do prestador (US46) | Ver ideias em "Decisões de 06/11" abaixo | 3 |
| ~~A linha "Login" continua nos perfis?~~ | **Decidido em 06/11:** tirada dos 4 perfis. | — |
| Onde registrar acompanhante e número de visitas (US48) | Na avaliação do serviço **ou** no histórico "Serviços realizados" **ou** no fechamento do pedido | 4 |
| Onde ficam "Sobre nós" e as páginas legais | Uma pasta por página (`sobre/`, `termos/`...) **ou** manter `home/sobre.html` e a pasta `politica-privacidade/` e ajustar os links | 2 |
| Quanto custa usar a S.D (cliente e prestador) | Grátis, plano pago ou só destaque pago | 5 |
| A S.D confere o CNPJ e as certificações do prestador antes de mostrá-lo? | Conferir no cadastro (selo "Verificado") **ou** não conferir e deixar claro nos Termos | 5 |

---

### Decisões tomadas em 05/11/2026 (Localizar prestador)

- Caixas por tipo de serviço (mesma lista da Home) → lista + mapa ao lado → cartão abaixo do mapa.
- Cartão: logo, nome, serviços (3 + "+N"), WhatsApp e **Fazer orçamento** (abre o perfil do prestador).
- Ordem por distância; o destaque **não** muda a posição, só ganha contorno vermelho e etiqueta.
- Localização vem do endereço do perfil, com botão ligar/desligar. Prestador desligado não aparece. Cliente desligado vê a lista em ordem alfabética, com aviso.
- WhatsApp só se o prestador ligar a opção; se não, botão cinza "liberado após o orçamento".
- Sem botões de rota (Maps/Waze).
- Mapa: MapLibre + OpenFreeMap (grátis, sem chave).

### Decisões tomadas em 06/11/2026 (ajustes + recuperação de acesso)

- **Prestador nunca vê a área "Serviços"** (busca de prestadores): seriam dados da concorrência. Se quiser orçar para si mesmo, entra com uma conta de Cliente CPF (no futuro, troca de conta pelo perfil — US50).
- Avaliações **anônimas por padrão**: o prestador que também é cliente não descobre quem o avaliou ou recusou.
- "Nome de login" saiu do cadastro CPF: e-mail, CPF ou CNPJ já identificam a conta; o nome pode ser separado em nome e sobrenome depois.
- Jeitos de entrar hoje: **e-mail, CPF ou CNPJ**. Futuro: telefone principal (confirmado). **Nome completo não** (não é único).
- Recuperação de acesso só em **pop-ups**, guardando o progresso ao fechar. Senha: 12+ caracteres, Argon2id no servidor. Regras: `seguranca/recuperacao-acesso.md`.
- Selos das lojas: só os arquivos oficiais. A Apple tem selo branco; o Google **não permite** selo sem cor.
- **Ideias para a Home do prestador (US46) — para o Marco escolher:**
  - resumo do quadro: quantos pedidos "A orçar", "Orçando", "A realizar" (com atalho para cada coluna);
  - próximas visitas/serviços agendados (data, bairro aproximado, contato no local quando liberado);
  - avisos: pedido novo, orçamento aceito/recusado, contraproposta, contato liberado;
  - a própria reputação: nota média, últimas avaliações (anônimas) e o que os clientes mais elogiam;
  - "como aparecer melhor": perfil completo, fotos de trabalhos, região de atendimento, certificações;
  - mapa resumido de "Seus Serviços" (US45);
  - **nunca**: lista, preços ou avaliações de outros prestadores.
- **Login:** a linha "Login" saiu dos 4 perfis (e do "Editar perfil").
- **Horário de visitas (CNPJ):** botões dos dias + rodinhas de hora de início e fim + observação embaixo.
- **Kanban do prestador:** ainda não está no formato desejado → refazer na Sprint 3 (US24).
- **Perfil Master (US47) — anotado, não criar ainda.**
- **Acompanhante e número de visitas (US48) — anotado, não criar ainda.**

## 8. Definição de Pronto (vale para toda entrega)

Uma entrega só é **Pronta** quando:

- faz o que a história pede;
- segue o padrão visual (cores, menu, rodapé e botões do site);
- funciona do celular pequeno à TV, sem a tela "escorregar" para os lados;
- funciona no tema claro e no escuro;
- não mostra erros técnicos no navegador;
- não mostra nenhum dado pessoal a quem não deve ver;
- tem o README da pasta atualizado.
