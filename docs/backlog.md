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
| US05 | Como usuário, quero recuperar minha senha ou meu login se eu esquecer. | M | 5 | ⬜ |

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
| US11 | Como cliente, quero escolher a área do serviço e ver os prestadores do mais perto ao mais longe, com um mapa centrado em mim. | M | 3 | ⬜ |
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
| US20 | Como cliente, quero voltar à lista de prestadores sem perder os filtros, para pedir outros orçamentos. | S | 4 | ⬜ |
| US21 | Como cliente, quero uma comparação automática dos orçamentos (o que é igual, o que é diferente e o que não combina com meu pedido). Só eu vejo. | C | Futuro | ⬜ |

### E6 · Contato e localização

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US22 | Como prestador, quero escolher quando liberar meu WhatsApp e/ou e-mail; como cliente, quero ser avisado quando um contato for liberado. | M | 4 | ⬜ |
| US23 | Como prestador, quero ver no mapa a região do cliente que me pediu orçamento, **sem** que o endereço exato seja revelado. | S | 4 | ⬜ |

### E7 · Acompanhar e avaliar

| Nº | História | Prioridade | Sprint | Status |
|---|---|---|---|---|
| US24 | Como prestador, quero organizar meus serviços por etapa (A orçar, Orçando, Aceito, A realizar, Prestados), para não perder nenhum. | S | 1 → 3 | 🟡 Falta a coluna "A orçar" |
| US25 | Como cliente, quero ver os serviços que já contratei, com fotos, para lembrar como ficou. | S | 1 | ✅ Demonstração |
| US26 | Como cliente, quero avaliar o prestador com estrelas e comentário, com meu nome escondido, a menos que eu escolha aparecer. | S | 4 | ⬜ |

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
| US37 | Como prestador, quero pagar por um destaque, que aparece identificado como "Destaque". | C |
| US38 | Como cliente, quero comparar preços de equipamentos (ex.: TV de monitoramento). | C |
| US39 | Como usuário, quero o app nas lojas, entrar com a digital e receber avisos também pelo telefone. | C |
| US40 | Como usuário, quero que o Assistente do Suporte responda com inteligência artificial. | C |
| US41 | Como prestador, quero juntar em um só cadastro as opções CNPJ e MEI. | C |

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
| O que a página "Seja um prestador" (`localizar-condominios/`) mostra, já que o mapa do cliente agora aparece dentro do pedido | Apresentar a S.D para novos prestadores **ou** mapa com os pedidos que o prestador já recebeu **ou** remover a página | 3 |
| Onde ficam "Sobre nós" e as páginas legais | Uma pasta por página (`sobre/`, `termos/`...) **ou** manter `home/sobre.html` e a pasta `politica-privacidade/` e ajustar os links | 2 |
| Quanto custa usar a S.D (cliente e prestador) | Grátis, plano pago ou só destaque pago | 5 |
| A S.D confere o CNPJ e as certificações do prestador antes de mostrá-lo? | Conferir no cadastro (selo "Verificado") **ou** não conferir e deixar claro nos Termos | 5 |

---

## 8. Definição de Pronto (vale para toda entrega)

Uma entrega só é **Pronta** quando:

- faz o que a história pede;
- segue o padrão visual (cores, menu, rodapé e botões do site);
- funciona do celular pequeno à TV, sem a tela "escorregar" para os lados;
- funciona no tema claro e no escuro;
- não mostra erros técnicos no navegador;
- não mostra nenhum dado pessoal a quem não deve ver;
- tem o README da pasta atualizado.
