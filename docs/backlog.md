# Lista de tarefas — S.D Serviços Digitais

Tudo o que a S.D precisa ter, em uma lista só.
Resumo no [README principal](../README.md). Decisões em [`decisoes.md`](decisoes.md).

**Legenda:** ✅ pronto · 🟡 só na demonstração / em andamento · ⬜ a fazer

---

## 1. Objetivo do MVP (em 1 frase)

> **Um cliente real e um prestador real conseguem cadastrar → encontrar → pedir orçamento → receber → aceitar → liberar contato, com dados reais e seguros, e o site publicado.**

Hoje o site é um **protótipo**: as telas funcionam, mas nada é salvo.

---

## 2. Agora · Próximo · Depois

### 🟡 Agora — Ciclo 1 · Fechar pendências e decidir (v0.6.0)
> Os textos legais (US28) saíram deste Ciclo e foram para o Ciclo 6 (decisão de 09/11).
- [x] READMEs reescritos para projeto individual (09/11).
- [x] E-mail do Suporte definido (09/11).
- [x] Regras de dinheiro decididas: sem intermediação; anúncios + destaque mensal (09/11).
- [x] Testes de navegadores, logins e segurança registrados em [`testes-e-seguranca.md`](testes-e-seguranca.md) (09/11).
- [x] Funcionamento do pedido decidido (09/11, tarde): ver [`decisoes.md`](decisoes.md).
- [x] Quadro: pedido em A orçar expira em 10 dias; só o cliente marca como finalizado; aviso de contatos desligados (09/11, tarde).
- [x] Contraproposta retirada; fotos do pedido: 3 obrigatórias, até 6 (09/11).
- [x] Servidor decidido: **Firebase** (grátis). E-mails de conta (confirmação e nova senha) pelo próprio Firebase (11/11).
- [x] CNPJ do prestador: **sim**, conferido pelos dígitos/letras e pela API pública (ativo, MEI, nome e CNAE); o que não bater vai para aprovação manual antes do selo (09/11).
- [x] Domínio .com.br antes do Ciclo 2: **não**. No 1º ano fica o endereço grátis; o .com.br (~R$ 40/ano) só se o projeto der resultado (09/11).
- ✅ **Ciclo 1 concluído em 11/11/2026 → v0.6.0.**

### ⬜ Próximo — Ciclo 2 · Contas reais (v0.7.0)
US03, US04, US05 de verdade · US30 · US31 no servidor · modo demonstração desligado no site publicado.

### ⬜ Depois (na ordem)
- **Ciclo 3 · Encontrar e pedir (v0.8.0):** US11 real, US13, US14, US15, US24 (pedidos reais em A orçar). **Decidir a Home do prestador no fim do Ciclo 3 (US46).**
- **Ciclo 4 · Orçar e decidir (v0.9.0):** US16–US20, US22, US23, US26.
- **Ciclo 5 · Segurança e LGPD (v0.10.0):** US32–US34 + correções de [`testes-e-seguranca.md`](testes-e-seguranca.md).
- **Ciclo 6 · Lançamento fechado (v1.0.0):** **US28 textos legais com advogado (LGPD)**, domínio, hospedagem de produção, marca registrada no INPI.
- **Depois do MVP:** Sobre nós (US29), anúncios (US51), página de parceiros e ofertas (US55), destaque pago (US37), painel do adm (US35, US44, US47), Seus Serviços (US45), app nas lojas (US39) e as outras ideias da seção 4.

---

## 3. O caminho do pedido (fluxo aprovado)

1. **Encontrar:** o cliente escolhe a área e vê os prestadores, do mais perto ao mais longe.
2. **Pedir:** o cliente cria **uma solicitação** (descrição + **3 fotos obrigatórias**, até 6, de ângulos diferentes) e, em Localizar prestador, **marca os prestadores** que quer, depois de ver avaliações, serviços e localização. O mesmo pedido vai para todos os marcados.
3. **Receber:** o pedido entra no quadro do prestador, na etapa **A orçar**. Ele é avisado no site e por e-mail. **Sem resposta em 10 dias, expira** e vai para Encerrados.
4. **Orçar ou não:** o prestador clica em **Fazer orçamento** (orçamento padrão: serviço, materiais, mão de obra, valores, datas e **se cobra visita e quanto**; não existe preço fixo) ou em **Não vou orçar**.
5. **Comparar:** o cliente vê até **4 orçamentos** lado a lado por pedido.
6. **Decidir:** aceita (com confirmação) ou recusa (sem explicar). **Não há contraproposta no site:** o contato do prestador é liberado quando ele envia o orçamento, com o aviso "Quer negociar preço ou material? Fale com o prestador antes de aceitar".
7. **Combinar:** WhatsApp e/ou e-mail do prestador (liberados no envio do orçamento, ou antes se "Mostrar meus contatos" estiver ligado). Cinza = ainda não liberado.
8. **Finalizar e avaliar:** o **cliente** marca como finalizado, com **2 a 6 fotos** e a avaliação (anônima por padrão). Só então vai para **Prestados**. O prestador pode responder à avaliação.
9. **Encerrados:** pedido que terminou **sem serviço** vai para Encerrados, com o motivo. É apagado **1 ano** depois; a lixeira apaga antes.

> **A S.D não mexe com o dinheiro do serviço.** O prestador só informa como cobra; cliente e prestador negociam e pagam entre eles.

---

## 4. Histórias

Formato: **Como** [quem], **quero** [o quê] **para** [motivo].
Prioridade: **M** obrigatória no MVP · **S** importante · **C** desejável.

### Base e contas
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US01 | Todas as páginas com a mesma aparência e o mesmo menu. | M | — | ✅ |
| US02 | Usar no celular, tablet, computador e TV, tema claro ou escuro. | M | — | ✅ |
| US03 | Criar conta como Cliente CPF, Cliente CNPJ ou Prestador. | M | 2 | 🟡 Tela pronta |
| US04 | Entrar e sair com segurança, vendo só as páginas do meu tipo. | M | 2 | 🟡 Tela pronta |
| US05 | Recuperar senha ou login. | M | 2 | 🟡 Pop-ups prontos |

### Perfis
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US06 | Cliente CPF vê e edita os dados. | M | — | 🟡 |
| US07 | Cliente CNPJ informa responsável, contato no local e fotos. | M | — | 🟡 |
| US08 | Prestador com perfil completo. | M | — | 🟡 |
| US09 | Prestador vê o perfil como o cliente vê. | S | — | 🟡 |
| US10 | Adm dá suporte sem nunca ver senhas. | S | — | 🟡 |
| US42 | Ligar/desligar a **localização** no perfil (botão na linha das abas). | M | 3 | 🟡 Tela pronta (09/11) |
| US43 | Prestador escolhe **Mostrar meus contatos** (padrão ligado, também no cadastro). Desligado: WhatsApp e Ligar cinza + aviso de que fica mais difícil ser contratado. | S | 3 | 🟡 Tela pronta (09/11) |
| US52 | Todo botão de excluir ou editar pede confirmação. | M | — | ✅ Padrão (09/11) |
| US53 | Uma lista única de todos os botões liga/desliga (padrão, o que faz, onde fica). | S | — | ✅ (09/11) |

### Encontrar e pedir
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US11 | Escolher a área e ver prestadores do mais perto ao mais longe, com mapa. | M | 3 | 🟡 Tela pronta |
| US12 | Filtrar por nome e avaliação. | C | Depois | ⬜ |
| US13 | Criar uma solicitação (3 fotos obrigatórias, até 6) e marcar vários prestadores na página Localizar. | M | 3 | ⬜ |
| US14 | Prestador recebe o pedido em **A orçar** e é avisado no site e por e-mail; expira em 10 dias. | M | 3 | 🟡 Etapa e prazo prontos na tela (09/11) |
| US15 | Prestador preenche o orçamento padrão, informando se cobra visita e quanto. | M | 3 | ⬜ |
| US24 | Quadro do prestador: A orçar, Orçando, Aceito, A realizar, Prestados; sanfona no celular. | S | 3 | 🟡 Tela pronta (09/11) |
| US36 | ~~Informativo fixo de cobrança~~ → substituído: sem preço padrão; a visita vai dentro de cada orçamento (US15). | — | — | — |

### Orçar e decidir
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US16 | Cliente vê os pedidos e até 4 orçamentos lado a lado. | M | 4 | ⬜ |
| US17 | Aceitar (com confirmação) ou recusar. Sem contraproposta: aviso para negociar com o prestador pelo WhatsApp. | M | 4 | ⬜ |
| US18 | Prestador vê pedidos encerrados sem serviço em **Encerrados** (motivo; recusado em vermelho), apagados em 1 ano, com lixeira. | S | 4 | 🟡 Tela pronta (09/11; antes "Arquivados em 30 dias") |
| US19 | Novo orçamento ao mesmo prestador, com aviso se já houver negociação. | S | 4 | ⬜ |
| US20 | Voltar à lista sem perder a escolha. | S | 4 | 🟡 |
| US21 | Comparação automática dos orçamentos. | C | Depois | ⬜ |
| US22 | Contato do prestador liberado quando ele envia o orçamento; cliente é avisado. | M | 4 | ⬜ |
| US23 | Prestador vê a região aproximada do cliente. | S | 4 | ⬜ |
| US25 | Cliente vê os serviços já feitos, com fotos. | S | — | 🟡 |
| US26 | Avaliar com estrelas e comentário (anônimo por padrão) só depois de finalizado; prestador pode responder. | S | 4 | 🟡 Parcial |
| US54 | Cliente marca o serviço como finalizado com 2 a 6 fotos + avaliação; só então vai para Prestados. | M | 4 | 🟡 Quadro já impede o prestador de mover (09/11) |

### Ajuda e confiança
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US27 | Tirar dúvidas e enviar sugestões. | M | — | ✅ (e-mail definido em 09/11) |
| US28 | Ler termos, privacidade e responsabilidades em linguagem simples (com advogado). | M | 6 | ⬜ |
| US29 | Sobre nós (história da empresa). | S | Depois | ⬜ |

### Servidor, segurança e LGPD
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US30 | Dados guardados com segurança; senha nunca visível. | M | 2 | ⬜ |
| US31 | Servidor bloqueia páginas e dados por tipo de conta. | M | 2 | 🟡 Regras escritas |
| US32 | Ver, corrigir, baixar e apagar meus dados (LGPD). | M | 5 | 🟡 |
| US33 | Fotos sem localização escondida (EXIF). | M | 5 | ⬜ |
| US34 | Plano de aviso de vazamento (ANPD). | M | 5 | ⬜ |

### Depois do MVP
| Nº | História | Prior. |
|---|---|---|
| US35 | Painel do adm com números e liga/desliga de recursos. | C |
| US37 | **Destaque** do prestador: assinatura mensal (começa em R$ 20), cancela quando quiser, sem multa. Etiqueta "Destaque". | C |
| US51 | **Anúncios** no site, só em páginas permitidas pelas regras do serviço de anúncios, com aviso de cookies (LGPD). | C |
| US55 | **Página de parceiros e ofertas**: a S.D vende o espaço direto para empresas (ex.: lojas de material, câmeras), por mensalidade. | C |
| US38 | Comparar preços de equipamentos. | C |
| US39 | App nas lojas, entrar com a digital, avisos no celular. | C |
| US40 | Assistente do Suporte com IA. | C |
| US41 | Cadastro único CNPJ/MEI. | C |
| US44 | Página do adm para ligar/desligar o destaque. | C |
| US45 | Seus Serviços: mapa dos clientes do prestador (região aproximada). | S |
| US46 | Home própria do prestador — **decidir no fim do Ciclo 3**. | S |
| US47 | Perfil Master: cadastrar admins e o que cada um pode fazer. | C |
| US48 | Registrar acompanhante e número de visitas. | C |
| US49 | Entrar com o telefone principal. | C |
| US50 | Trocar de conta pelo perfil. | C |

**Não agora:** pagamento dentro do app · chat dentro do app · prestador só com CPF · categorias guardadas (Serviços domésticos, Aulas, Eventos, Beleza, Automóveis, Pets).

### Anotações para depois do MVP (09/11/2026)

**Página de parceiros e ofertas (US55)**
- A S.D **vende o espaço direto** (não é Google AdSense): empresas pagam uma mensalidade para aparecer.
- Combina com comparar preços de equipamentos (US38).
- Todo anúncio marcado como **"Anúncio"** ou **"Patrocinado"**, para não parecer recomendação da S.D.

**Regras do Google AdSense (se usar)**
- **Não pode** página só de anúncios, nem com mais anúncios do que conteúdo, nem página "em construção". Risco: bloqueio ou **encerramento da conta**.
- Não pode pedir clique ("clique para ajudar") nem dar prêmio por clique.
- Não pode em chat (assistente do Suporte), pop-ups e páginas que exigem login.
- O dinheiro vem de **visitas**: página sem visitas não rende.
- Bons lugares: Home do visitante, Sobre nós e páginas de conteúdo aberto (ex.: dicas de manutenção).
- Anúncios usam cookies: aviso e consentimento (LGPD) antes de ligar.

---

## 5. Como ler o número da versão (vX.Y.Z) — informativo

| Posição | Nome | Quando muda | Exemplo |
|---|---|---|---|
| **X** (1.-.-) | Principal | Lançamento para o público (**1.0.0**) e, depois, mudanças muito grandes | 0 = ainda não lançado |
| **Y** (-.1.-) | Recurso novo | Entrou coisa nova (página, botão, função) | Quadro com A orçar |
| **Z** (-.-.1) | Correção | Só arrumou erro ou fez limpeza, sem nada novo | Link quebrado corrigido |

- Y sobe → Z volta a 0 (0.5.1 → 0.6.0). X sobe → os dois voltam a 0 (0.10.0 → 1.0.0).
- **-alpha.1, -alpha.2** = prévia de teste antes da versão oficial.
- Depois de 0.9.0 vem **0.10.0** (dez). O 1.0.0 é só o lançamento.
- Histórico completo: [`versoes.md`](versoes.md).

---

## 6. Definição de Pronto

Uma entrega só está **pronta** quando:
- faz o que a história pede;
- segue o padrão visual;
- funciona do celular pequeno à TV, sem rolagem para os lados;
- funciona no tema claro e no escuro;
- não mostra erros no navegador;
- não mostra dados pessoais a quem não deve;
- excluir e editar pedem confirmação;
- o README da pasta está atualizado.
