# S.D Serviços Digitais

**Quebrou, vazou ou parou? Conectamos você a quem resolve.**

Site: **https://matteo-bormolini.github.io/SD-Online/**

## Para que serve

A S.D liga quem precisa de **manutenção** (casa, empresa ou condomínio) a **prestadores de serviço perto dele**.
O cliente encontra, chama, compara orçamentos e combina tudo **direto com o prestador**.

| Quem | Exemplo | O que ganha |
|---|---|---|
| **Cliente CPF** | Casas e apartamentos | Acha quem resolve perto de casa. **Não paga nada.** |
| **Cliente CNPJ** | Empresas e condomínios | Organiza as manutenções do local. **Não paga nada.** |
| **Prestador** (CNPJ ou MEI) | Eletricista, encanador, pintor | Mais clientes perto dele e um quadro para organizar o trabalho. |
| **Administrador** | Equipe S.D | Publica comunicados e cuida do site. Nunca vê senhas. |

## O que faz

1. **Encontrar:** o cliente escolhe o tipo de serviço, filtra (nome, horário, distância, preço da visita) e vê os prestadores do mais perto ao mais longe, na lista e no mapa.
2. **Chamar:** antes de abrir o WhatsApp, o site mostra se o prestador cobra visita e que a S.D não participa do pagamento. Prestador com contatos escondidos recebe um **"Pedir contato"**.
3. **Orçar:** o prestador responde **"Fez orçamento?"** e preenche um resumo informativo (valor, validade, visita, materiais, prazo).
4. **Comparar e decidir:** o cliente vê os orçamentos lado a lado e marca **"Fechei com este"** ou **"Não fechei com nenhum"**.
5. **Finalizar:** o prestador marca **Concluído** e o cliente confirma → **Serviços realizados**.

Também: **sino de avisos**, página **Seus Serviços** (quadro do prestador), **Suporte** com perguntas frequentes, perfil completo de cada tipo de conta, **Home do prestador** (comunicados, divulgações, eventos e grupos da área dele), **Home do cliente** (comunicados e anúncios) e, para o adm, **comandos do site**, **divulgações** e a barra **"Ver como"** (mostra o site como cada conta vê).

### Dinheiro: regras claras
- A S.D **não** recebe, não cobra e não garante pagamento entre cliente e prestador.
- O orçamento no site é **informativo**; preço, material e pagamento são combinados entre as partes.
- A S.D vai se manter com **anúncios** e **destaque** opcional para prestadores — só depois do MVP.

### Segurança e privacidade
- A senha **nunca** aparece para ninguém, nem para o adm.
- CPF, telefone e endereço completo de clientes **nunca** ficam públicos; o prestador vê só o primeiro nome (ou nome da empresa) e a região.
- 1 CPF/CNPJ = 1 conta. O prestador escolhe se mostra os contatos.
- Os dados são protegidos pelas regras do banco (Firebase) e testados: [`docs/testes-e-seguranca.md`](docs/testes-e-seguranca.md).

## O que já foi feito

| Ciclo | Objetivo | Versões | Entregas |
|---|---|---|---|
| 1 | Fechar pendências e decidir | v0.6.x | Servidor (Firebase grátis), regras do pedido, padrão visual |
| 2 | Contas reais | v0.7.x | Cadastro em 2 passos, login e nova senha reais, CPF/CNPJ único, perfis reais, fim dos dados fictícios |
| 3 | Encontrar e pedir | v0.8.x | Busca com filtros e mapa, contato registrado, orçamento informativo, quadro do prestador (Seus Serviços), sino, fotos, Home do prestador e do cliente, comandos do adm, testes reais de orçamento |

Detalhes de cada versão: [`docs/versoes.md`](docs/versoes.md).

## O que falta até o MVP

**Objetivo do MVP:** um cliente real e um prestador real conseguem **cadastrar → encontrar → pedir orçamento → receber → aceitar → finalizar**, com dados reais e seguros, e o site publicado.

| Ciclo | Objetivo | Versão |
|---|---|---|
| 4 | Avaliar e finalizar (avaliação só de quem realizou, fotos do serviço finalizado); textos legais no Ciclo 4 ou 5 | v0.9.0 |
| 5 | Segurança e LGPD (revisão completa) | v0.10.0 |
| 6 | Lançamento fechado (revisão dos textos legais, domínio, poucos usuários reais) | v1.0.0 |

Lista completa: [`docs/backlog.md`](docs/backlog.md). **Regra do MVP: nada pago.**

## Mapa das pastas

| Pasta | O que é |
|---|---|
| [`configuracoes/`](configuracoes/) | Cores, links, tipos de serviço e botões liga/desliga |
| [`navbar/`](navbar/) · [`rodape/`](rodape/) | Menu do topo e rodapé |
| [`componentes/`](componentes/) | Peças usadas em várias páginas (pedidos, sino, mapa, confirmação…) |
| [`firebase/`](firebase/) | Login, banco e regras de segurança |
| [`base-de-dados/`](base-de-dados/) | Mapa do banco (coleções e relações) |
| [`seguranca/`](seguranca/) | Quem pode ver o quê |
| [`servicos/`](servicos/) | Consultas externas (CEP, CNPJ) |
| [`home/`](home/) | Início (visitante, cliente e prestador) |
| [`login-cadastro/`](login-cadastro/) | Entrar e criar conta |
| [`perfil-cliente-cpf/`](perfil-cliente-cpf/) · [`perfil-cliente-cnpj/`](perfil-cliente-cnpj/) · [`perfil-prestador/`](perfil-prestador/) · [`perfil-adm/`](perfil-adm/) | Perfis |
| [`localizar-prestador/`](localizar-prestador/) | Cliente encontra prestadores |
| [`localizar-condominios/`](localizar-condominios/) | "Seus Serviços": quadro de contatos e orçamentos do prestador |
| [`avaliacoes/`](avaliacoes/) | Avaliações (Ciclo 4) |
| [`suporte/`](suporte/) | Dúvidas, sugestões, perguntas frequentes e dicas |
| [`politica-privacidade/`](politica-privacidade/) | Termos de uso e Privacidade (textos no Ciclo 4 ou 5) |
| [`fotos/`](fotos/) · [`modelo-pagina/`](modelo-pagina/) · [`chaves-api/`](chaves-api/) | Imagens, modelo de página nova e modelo de chaves |
| [`docs/`](docs/) | Backlog, decisões, versões, testes e guia técnico |

## Parte técnica

- **HTML, CSS e JavaScript puro** + **Firebase** (login e banco, plano grátis). Não precisa instalar nada.
- Site no **GitHub Pages**. Menu, rodapé, cores e botões existem **uma vez só**.
- Tudo que vem de fora tem de ser **grátis e sem prazo** ([guia técnico](docs/guia-tecnico.md)).

## Sobre o projeto

Projeto **individual** de **Matteo Bormolini** ([Matteo-Bormolini](https://github.com/Matteo-Bormolini/SD-Online)). Trabalho em **Ciclos**: cada Ciclo tem um objetivo e termina com uma versão.

> **Nunca** coloque senhas, chaves ou dados reais de pessoas neste repositório. Ele é público.
