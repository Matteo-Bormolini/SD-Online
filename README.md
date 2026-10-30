# S.D Serviços Digitais

**Quebrou, vazou ou parou? A gente conecta você a quem resolve.**

A S.D é um site (e, no futuro, um app) que liga quem precisa de **manutenção** a **prestadores de serviço perto de você**.
Você escolhe o serviço, pede orçamentos, compara e combina tudo direto com o prestador.

> **Situação atual:** versão de **demonstração**. Dá para ver e testar as telas,
> mas nada do que você digita é salvo ou enviado.

---

## Para quem é

| Quem | Exemplo | O que ganha |
|---|---|---|
| **Pessoa** (Cliente CPF) | Casas e apartamentos | Encontra quem resolve, perto de casa. |
| **Empresa ou condomínio** (Cliente CNPJ) | Empresas, condomínios e MEI | Organiza as manutenções do local. |
| **Prestador** (com CNPJ ou MEI) | Eletricista, encanador, pintor... | Mais clientes perto dele e um perfil que passa confiança. |
| **Administrador** | Equipe S.D | Dá suporte e cuida da plataforma. Nunca vê senhas. |

## Como funciona

1. **Escolha o serviço** (ex.: encanador) e veja os prestadores mais perto de você.
2. **Peça orçamento** a quantos prestadores quiser.
3. **Compare até 4 orçamentos** e decida: aceitar, recusar ou fazer uma contraproposta.
4. **Combine direto** pelo WhatsApp ou e-mail. O prestador decide quando mostrar esses contatos.
5. **Avalie** o serviço e ajude o próximo cliente a escolher.

> 💬 **A S.D não faz pagamentos.** Valor e forma de pagamento são combinados entre você e o prestador.

## O que já dá para ver

- **Página inicial** para visitantes e para quem já entrou na conta.
- **Criar conta e entrar** como Cliente CPF, Cliente CNPJ ou Prestador.
- **Perfis** com edição de dados, fotos e exclusão da conta.
- **Perfil do prestador** com a opção "Ver como cliente".
- **Meus serviços** (prestador): quadro com as etapas de cada serviço.
- **Serviços realizados** (cliente): histórico com fotos.
- **Suporte**: dúvidas, sugestões e um assistente de demonstração.
- **Tema claro e escuro**, no celular, no computador e na TV.

## Experimente

1. Abra o site: **https://matteo-bormolini.github.io/SD-Online/**
2. Clique em **Entrar**, digite qualquer e-mail e senha e escolha **Entrar como** (CPF, CNPJ, Prestador ou Administrador).
3. Navegue já logado. **Meu perfil** abre o perfil do tipo escolhido. **Sair** desconecta.

Cada tipo de conta só vê as páginas que pode usar. Se tentar abrir outra, o site leva você ao login ou ao início.

## Perguntas frequentes

**A S.D recebe meu pagamento?**
Não. Você paga direto ao prestador, do jeito que combinarem.

**Quanto custa usar a S.D?**
Ainda está sendo definido. Nada é cobrado na demonstração.

**O prestador vai saber onde eu moro?**
Antes de vocês combinarem, ele vê só a região aproximada. O endereço é você quem passa, se quiser.

**Meu CPF e meu telefone aparecem para outras pessoas?**
Não ficam públicos. Só aparecem para quem você autorizar e para a equipe S.D, quando precisar dar suporte.

**Posso pedir orçamento para vários prestadores?**
Sim. Até 4 orçamentos aparecem lado a lado. Se chegarem mais, o site avisa quantos estão guardados.

**E se eu não gostar do orçamento?**
Você pode recusar sem dar explicação ou fazer uma contraproposta.

**Quem pode ser prestador?**
Hoje, só quem tem CNPJ ou MEI. Se você trabalha sem CNPJ e quer que isso mude, avise pela página Suporte.

**Posso apagar minha conta?**
Sim. Em **Meu perfil → Excluir perfil**.

**Quem vê a minha senha?**
Ninguém, nem a equipe S.D.

---

## 🎯 Plano do produto

Este projeto é tocado como uma pequena empresa ágil (Scrum), só que com **uma pessoa só**.

<details>
<summary><b>Palavras do plano (clique para ver)</b></summary>

| Palavra | O que quer dizer |
|---|---|
| **Scrum** | Jeito de trabalhar em ciclos curtos, entregando um pedaço pronto de cada vez. |
| **Sprint** | Um ciclo de 2 semanas com um objetivo. |
| **Épico** | Um grande assunto do produto (ex.: "Encontrar"). |
| **História (US)** | Uma necessidade de quem usa, em uma frase. |
| **MVP** | A menor versão que já resolve o problema de verdade. |
| **MoSCoW** | Jeito de priorizar: **M**ust (obrigatório), **S**hould (importante), **C**ould (desejável), **W**on't (não agora). |
| **Product Owner** | Quem decide o que entra no produto e em que ordem. |
| **Scrum Master** | Quem cuida do método e tira os obstáculos do caminho. |

</details>

### A equipe

| Papel | Quem | O que faz |
|---|---|---|
| **Product Owner** | Marco | Decide o que entra no produto e em que ordem. |
| **Scrum Master** | Marco | Planeja, revisa e melhora o trabalho a cada Sprint. |
| **Time de desenvolvimento** | Marco, com apoio de IA | Cria, testa e entrega. |

### Macro-objetivo

> **Ajudar casas, empresas e condomínios a encontrar, de forma simples e confiável, um prestador de manutenção perto deles, e ajudar esse prestador a conseguir mais clientes.**

### Épicos

| Épico | O que resolve | Status |
|---|---|---|
| E1 · Base do site | Mesma aparência, menu e rodapé em todas as páginas | ✅ |
| E2 · Conta | Criar conta, entrar e sair | 🟡 Tela pronta |
| E3 · Perfis | Dados, fotos e confiança de cada usuário | 🟡 Quase pronto |
| E4 · Encontrar | Prestadores por área, do mais perto ao mais longe | ⬜ |
| E5 · Pedir e negociar | Pedido, orçamento, comparar até 4 e decidir | ⬜ |
| E6 · Contato e localização | WhatsApp e e-mail liberados pelo prestador; mapa aproximado | ⬜ |
| E7 · Acompanhar e avaliar | Etapas do serviço, histórico e estrelas | 🟡 |
| E8 · Ajuda e confiança | Suporte, Sobre nós, termos e privacidade | 🟡 |
| E9 · Servidor, segurança e LGPD | Dados guardados com segurança e direitos do usuário | 🟡 |

O caminho completo do pedido e todas as histórias estão no **[Backlog do produto](docs/backlog.md)**.

### MVP (priorização MoSCoW)

- **Must (obrigatório):** criar conta, entrar e recuperar senha · perfis · encontrar por área e proximidade · pedir, receber e comparar orçamentos · aceitar, recusar ou contrapropor · liberar WhatsApp e e-mail · Suporte · termos e privacidade · servidor seguro e LGPD.
- **Should (importante):** ver perfil como cliente · perfil do administrador · recusados e arquivados · mapa aproximado do cliente · quadro "Meus serviços" · serviços realizados · avaliações · Sobre nós.
- **Could (desejável):** filtros extras · comparação automática de orçamentos · painel do administrador · destaque pago · app nas lojas · assistente com IA.
- **Won't (não agora):** pagamento dentro do app · chat dentro do app · categorias além de manutenção.

### Sprints (2 semanas cada)

| Sprint | Período | Objetivo | Status |
|---|---|---|---|
| 1 · Base e contas | 12/10 a 25/10/2026 | Padrão visual, login de demonstração e perfis | ✅ Concluída |
| 2 · Ajuda e confiança | 26/10 a 08/11/2026 | Suporte, Sobre nós, termos e organização do projeto | 🟡 Em andamento |
| 3 · Encontrar e pedir | 09/11 a 22/11/2026 | Busca de prestadores, pedido e orçamento | ⬜ Planejada |
| 4 · Comparar e combinar | 23/11 a 06/12/2026 | Comparar, decidir, liberar contato e avaliar | ⬜ Planejada |

Depois vem a **Sprint 5 · Servidor de verdade**: banco de dados, login real e LGPD.
Cada pasta do projeto tem seu próprio README, escrito como **a entrega de uma Sprint**.

---

## Mapa do projeto

| Pasta | O que é |
|---|---|
| [`configuracoes/`](configuracoes/) | Cores, botões e links de todo o site |
| [`navbar/`](navbar/) · [`rodape/`](rodape/) | Menu do topo e rodapé |
| [`componentes/`](componentes/) | Peças usadas em várias páginas |
| [`seguranca/`](seguranca/) | Quem pode ver o quê, e a LGPD |
| [`fotos/`](fotos/) | Logo e fotos padrão |
| [`modelo-pagina/`](modelo-pagina/) | Ponto de partida de toda página nova |
| [`home/`](home/) | Página inicial |
| [`login-cadastro/`](login-cadastro/) | Entrar e criar conta |
| [`perfil-cliente-cpf/`](perfil-cliente-cpf/) · [`perfil-cliente-cnpj/`](perfil-cliente-cnpj/) · [`perfil-prestador/`](perfil-prestador/) · [`perfil-adm/`](perfil-adm/) | Perfis |
| [`suporte/`](suporte/) | Dúvidas, sugestões e assistente |
| [`politica-privacidade/`](politica-privacidade/) | Termos, privacidade e responsabilidade |
| [`localizar-prestador/`](localizar-prestador/) | Cliente encontra prestadores |
| [`solicitacao/`](solicitacao/) | Pedido de orçamento |
| [`localizar-condominios/`](localizar-condominios/) | Área "Seja um prestador" |
| [`avaliacoes/`](avaliacoes/) | Avaliações |
| [`base-de-dados/`](base-de-dados/) · [`chaves-api/`](chaves-api/) | Banco de dados e chaves do servidor |
| [`docs/`](docs/) | Backlog, guia técnico e padrão visual |

## Parte técnica (resumo)

- Feito em **HTML, CSS e JavaScript puro**. Não precisa instalar nem compilar nada.
- Menu, rodapé, cores e botões são escritos **uma vez só** e usados em todas as páginas.
- Toda página nova nasce do [`modelo-pagina/`](modelo-pagina/).

Detalhes em **[docs/guia-tecnico.md](docs/guia-tecnico.md)**.

## Segurança e privacidade (LGPD)

As regras da S.D para proteger você:

- A senha **nunca** aparece para ninguém, nem para o administrador.
- CPF, telefone e endereço completo **nunca** ficam públicos.
- O prestador decide quando mostrar o contato dele. A localização do cliente aparece só de forma aproximada.
- O site não usa cookies, propaganda nem rastreadores de terceiros.

Na demonstração, parte dessas regras funciona só na tela. A proteção completa chega com o servidor (Sprint 5).

> **Nunca** coloque senhas, chaves ou dados reais de pessoas neste repositório. Ele é público.

Regras completas e situação da LGPD: [`seguranca/`](seguranca/).

---

Projeto de **Marco** · GitHub [Matteo-Bormolini](https://github.com/Matteo-Bormolini/SD-Online)
