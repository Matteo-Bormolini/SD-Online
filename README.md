# S.D Serviços Digitais

**Quebrou, vazou ou parou? Conectamos você a quem resolve.**

A S.D liga quem precisa de **manutenção** a **prestadores de serviço perto de você**.
Você encontra, pede orçamento, compara e combina tudo **direto com o prestador**.

> **Situação:** protótipo de **demonstração**. Dá para ver e testar as telas, mas nada do que você digita é salvo.

---

## Para quem é

| Quem | Exemplo | O que ganha |
|---|---|---|
| **Cliente CPF** | Casas e apartamentos | Acha quem resolve, perto de casa. **Não paga nada.** |
| **Cliente CNPJ** | Empresas e condomínios | Organiza as manutenções do local. **Não paga nada.** |
| **Prestador** (CNPJ ou MEI) | Eletricista, encanador, pintor | Mais clientes perto dele e um quadro para organizar o trabalho. |
| **Administrador** | Equipe S.D | Dá suporte. Nunca vê senhas. |

## Como funciona

1. **Encontre:** escolha o serviço e veja os prestadores do mais perto ao mais longe.
2. **Peça orçamento:** crie uma solicitação (com 3 a 6 fotos) e marque os prestadores que quiser. O pedido chega na etapa **A orçar** de cada um.
3. **Compare** até 4 orçamentos (cada um diz se cobra visita). Quer negociar? Fale com o prestador pelo WhatsApp antes de aceitar.
4. **Combine direto** pelo WhatsApp ou e-mail: preço, material e pagamento são entre vocês.
5. **Finalize e avalie:** você marca o serviço como feito (com fotos) e avalia. O prestador pode responder.

## Dinheiro: regras claras

- A S.D **não** recebe, não cobra e não garante pagamento entre cliente e prestador.
- Não existe tabela de preços: cada orçamento traz o valor e diz se o prestador **cobra visita** e quanto. Negociação e pagamento são entre cliente e prestador.
- Como a S.D vai se manter: **anúncios** no site e o **destaque** opcional para prestadores
  (assinatura mensal, cancela quando quiser). Isso só começa depois do MVP.

## Experimente

1. Abra: **https://matteo-bormolini.github.io/SD-Online/**
2. Clique em **Entrar**, digite qualquer e-mail e senha e escolha **Entrar como** (CPF, CNPJ, Prestador ou Administrador).
3. Navegue. **Meu perfil** abre o perfil do tipo escolhido. **Sair** desconecta.

---

## Sobre o projeto

- Projeto **individual** de **Marco** (GitHub [Matteo-Bormolini](https://github.com/Matteo-Bormolini/SD-Online)).
- Sem equipe e sem reuniões: **uma lista**, **uma coisa por vez**.
- **Objetivo do MVP (primeira versão de verdade):**
  um cliente real e um prestador real conseguem **cadastrar → encontrar → pedir orçamento → receber → aceitar → liberar contato**,
  com dados reais e seguros, e o site publicado.

### Como o trabalho é organizado

| Lista | O que é | Onde ver |
|---|---|---|
| **Agora** | O que está sendo feito | [`docs/backlog.md`](docs/backlog.md) |
| **Próximo** | O que vem depois | idem |
| **Depois** | Ideias para depois do MVP | idem |

O trabalho é dividido em **Ciclos**. Cada Ciclo tem **um objetivo**. Terminou o Ciclo → sai uma **versão** nova.

| Ciclo | Objetivo | Versão | Situação |
|---|---|---|---|
| 1 | Fechar pendências e decidir (servidor, domínio, regras do pedido) | v0.6.0 | 🟡 Agora |
| 2 | Contas reais (servidor, banco, login de verdade) | v0.7.0 | ⬜ |
| 3 | Encontrar e pedir (busca real, pedido, A orçar) | v0.8.0 | ⬜ |
| 4 | Orçar e decidir (comparar, aceitar, liberar contato, avaliar) | v0.9.0 | ⬜ |
| 5 | Segurança e LGPD | v0.10.0 | ⬜ |
| 6 | Lançamento fechado (textos legais com advogado, poucos usuários reais) | v1.0.0 | ⬜ |

Duas semanas por Ciclo é a meta, não uma obrigação.

### Pronto é pronto quando

- faz o que foi pedido;
- segue o padrão visual;
- funciona do celular pequeno à TV, sem "escorregar" para os lados;
- funciona no tema claro e no escuro;
- não mostra erros no navegador;
- não mostra dados pessoais a quem não deve;
- excluir e editar pedem confirmação;
- o README da pasta está atualizado.

## Mapa das pastas

| Pasta | O que é |
|---|---|
| [`configuracoes/`](configuracoes/) | Cores, botões, links e a **lista dos botões liga/desliga** |
| [`navbar/`](navbar/) · [`rodape/`](rodape/) | Menu do topo e rodapé |
| [`componentes/`](componentes/) | Peças usadas em várias páginas (inclui o pop-up de confirmação) |
| [`seguranca/`](seguranca/) | Quem pode ver o quê e LGPD |
| [`servicos/`](servicos/) | Conversa com o servidor |
| [`fotos/`](fotos/) | Logo e fotos padrão |
| [`modelo-pagina/`](modelo-pagina/) | Ponto de partida de toda página nova |
| [`home/`](home/) | Início e Sobre nós |
| [`login-cadastro/`](login-cadastro/) | Entrar e criar conta |
| [`perfil-cliente-cpf/`](perfil-cliente-cpf/) · [`perfil-cliente-cnpj/`](perfil-cliente-cnpj/) · [`perfil-prestador/`](perfil-prestador/) · [`perfil-adm/`](perfil-adm/) | Perfis |
| [`interruptores/`](interruptores/) | Consulta de todos os botões liga/desliga (adm) |
| [`localizar-prestador/`](localizar-prestador/) | Cliente encontra prestadores |
| [`solicitacao/`](solicitacao/) | Pedido de orçamento |
| [`localizar-condominios/`](localizar-condominios/) | "Seus Serviços" do prestador |
| [`avaliacoes/`](avaliacoes/) | Avaliações |
| [`suporte/`](suporte/) | Dúvidas, sugestões e assistente |
| [`politica-privacidade/`](politica-privacidade/) | Termos, privacidade e responsabilidade |
| [`base-de-dados/`](base-de-dados/) · [`chaves-api/`](chaves-api/) | Banco de dados e chaves do servidor |
| [`docs/`](docs/) | Lista de tarefas, decisões, versões, testes e guia técnico |

## Parte técnica (resumo)

- **HTML, CSS e JavaScript puro.** Não precisa instalar nada.
- Menu, rodapé, cores e botões existem **uma vez só**.
- Tudo que vem de fora tem de ser **grátis e sem prazo** ([guia técnico](docs/guia-tecnico.md)).

## Segurança e privacidade

- A senha **nunca** aparece para ninguém, nem para o adm.
- Avaliações são anônimas, a menos que quem avaliou queira mostrar o nome.
- CPF, telefone e endereço completo de clientes **nunca** ficam públicos.
- O prestador escolhe se mostra os contatos. A localização do cliente aparece só aproximada.
- Na demonstração as regras funcionam **só na tela**. A proteção real chega com o servidor (Ciclo 2).
  Testes feitos: [`docs/testes-e-seguranca.md`](docs/testes-e-seguranca.md).

> **Nunca** coloque senhas, chaves ou dados reais de pessoas neste repositório. Ele é público.
