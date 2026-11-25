# Lista de tarefas — S.D Serviços Digitais

Tudo o que a S.D precisa ter, em uma lista só.
Resumo no [README principal](../README.md). Decisões em [`decisoes.md`](decisoes.md).

**Legenda:** ✅ pronto · 🟠 tela pronta (falta ligar ao banco ou terminar) · 🟡 **PAGO** (sugestão) = só termina pagando · ⬜ a fazer · ➖ não é mais necessária

---

## 1. Objetivo do MVP (em 1 frase)

> **Um cliente real e um prestador real conseguem cadastrar → encontrar → pedir orçamento → receber → aceitar → liberar contato, com dados reais e seguros, e o site publicado.**

Hoje (19/11/2026): **Ciclos 1 e 2 concluídos; Ciclo 3 entregue na v0.8.0 (falta o teste do Matteo com contas reais). Home do prestador na v0.8.2.** Contas reais pelo Firebase grátis. Fluxo **"Contato registrado"**: filtros, aviso de cobrança, WhatsApp/Pedir contato, orçamento informativo, quadro do prestador, bloco "Em orçamento" do cliente, sino de avisos e fotos salvas de graça.

> **Regra do MVP: nada pago.** O que só funciona pagando fica **pausado** na lista "Pós-MVP · precisa pagar" (seção 2).

---

## 2. Agora · Próximo · Depois

### ✅ Ciclo 1 · Fechar pendências e decidir (v0.6.0)
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

### ✅ Ciclo 2 · Contas reais (v0.7.5)
> Versão de fechamento: **v0.7.5** (decisão do Matteo, 11/11). O Ciclo 3 continua sendo a v0.8.0.
- [x] US03 Cadastro real (Cliente CPF, Cliente CNPJ, Prestador) — CPF/CNPJ único (11/11).
- [x] US04 Login real (senha conferida pelo Firebase) + bloqueio temporário do próprio Firebase após muitas tentativas (11/11).
- [x] US05 Nova senha pelo e-mail, abrindo o pop-up do site (11/11).
- [x] US30 Senha só com hash no Firebase (ninguém vê, nem o adm); regras do banco publicadas (11/11).
- [x] US31 Dados bloqueados por tipo de conta nas regras do banco. Páginas: bloqueio na tela (site estático; o que precisa de proteção são os dados) (11/11).
- [x] Modo demonstração desligado no site publicado (11/11).
- [x] Senha mínima de **6** caracteres no site e no Firebase (decisão do Matteo, 11/11).
- [x] US56 Botão do adm **Conferir CPF e CNPJ** (desligado = modo teste) (11/11).
- [x] US57 Consulta do CNPJ do prestador na Receita (CNPJá; reserva CNPJ.ws). Bloqueia só CNPJ inativo (11/11).
- [x] US58 Cadastro que parou no meio é apagado/reaproveitado sozinho (11/11).
- [x] US59 Padrão de e-mail confirmado + aviso em todas as páginas (11/11).
- [x] Arquivos da v0.7.0-alpha.2 levados para as pastas certas; README principal restaurado (11/11).
- [x] Política de senha do Firebase em "Exigir" (6 a 128) e regras novas publicadas (12/11 e 13/11).
- [x] Segurança do banco: cadastro em 2 passos, dígitos do CPF/CNPJ, limites por campo, CSP (v0.7.6, 13/11).
- [x] Regras do banco com menos cálculos (limite de 1.000 do Firebase) e organizadas por área (v0.7.7–v0.7.9, 17/11).
- [x] Sem dados fictícios; perfis completos de verdade (foto salva, avisos, listas, horário); mapa com localização real (v0.7.9, 17/11).

### 🟠 Ciclo 3 · Encontrar e pedir (v0.8.0) — entregue, falta o teste real
> Fluxo trocado em 18/11/2026 (decisão do Matteo): **"Contato registrado"** no lugar do orçamento feito dentro do site. Ver seção 3.
- [x] Prestadores reais na busca e no mapa (vitrine) e na Home do cliente (v0.7.9).
- [x] Ponto do cliente: endereço do perfil ou GPS (não salvo) (v0.7.9).
- [x] **Filtros** em Localizar: nome, horário (1º horário + emergência), distância e preço da visita (US12, v0.8.0).
- [x] **Aviso de preço** no perfil do prestador (visita técnica) e **aviso de cobrança** antes do WhatsApp (US61, v0.8.0).
- [x] **Contato registrado** (WhatsApp) e **Pedir contato** (contatos escondidos), com anti-spam de 7 dias (US13, v0.8.0).
- [x] Prestador: janela **"Você fez orçamento?"** ao entrar + **formulário do orçamento** (informativo) (US14, US15, v0.8.0).
- [x] **Quadro** novo: Contatos · Orçado · A realizar · Prestados + Encerrados (US24, v0.8.0).
- [x] Cliente: bloco **"Em orçamento / Em andamento"** em Serviços, "Fechei com este", "Não fechei com nenhum", aviso sutil de 10 dias e lembretes (3º, 7º, 15º dia) (US16, US17, v0.8.0).
- [x] Prestador marca **concluído** → cliente **confirma** → Serviços realizados / Prestados (parte da US54, v0.8.0).
- [x] **Sino de avisos** (coleção "avisos", apagados em 30 dias) (US62, v0.8.0).
- [x] **Fotos salvas de graça** no banco, compactadas (WebP 0,80, até 1080 px; iPhone: JPEG): trabalhos do prestador, local do CNPJ e Pedir contato (US63, v0.8.0).
- [x] Matteo: publicar as regras v0.8.0, enviar os arquivos e testar com contas reais (cliente + prestador).
- [x] Release **v0.7.9** (pendente) e **v0.8.0**.
- [x] **Home do prestador** (US46, v0.8.2, 19/11): comunicados, agenda de eventos (gerais e por atividade) e grupos/comunidades. Conteúdo cadastrado pelo adm no console (coleção `divulgacoes`).
- [x] Aba **Divulgações** no Perfil do adm + exemplos ilustrativos (v0.8.3, 23/11).
- [x] Matteo: publicar as regras **v0.8.3**, criar os 2 índices e testar com conta real (no teste de 23/11 o banco negou a leitura: regras da área 80 ainda não estavam valendo).
- [ ] **Antes do lançamento:** apagar os exemplos ilustrativos (aba Divulgações) e as imagens `fotos/divulgacoes/exemplo-*.webp`.
- [x] Revisão dos Ciclos 1, 2 e 3.

### ⬜ Depois (na ordem)
- **Ciclo 4 · Avaliar e finalizar (v0.9.0):** US26 (avaliação só de quem realizou o serviço), US54 (fotos do serviço finalizado + avaliação), US20. *(US16, US17, US18, US22, US23 foram entregues na v0.8.0; US19 e US21 não são mais necessárias.)*
- **Ciclo 5 · Segurança e LGPD (v0.10.0):** US32–US34 + correções de [`testes-e-seguranca.md`](testes-e-seguranca.md).
- **Ciclo 6 · Lançamento fechado (v1.0.0):** **US28 textos legais com advogado (LGPD)**, domínio, hospedagem de produção, marca registrada no INPI.
- **Depois do MVP:** Home do prestador paga/presença/capacitação (US64–US67), segunda verificação no login (US60), Sobre nós (US29), anúncios (US51), página de parceiros e ofertas (US55), destaque pago (US37), painel do adm (US35, US44, US47), Seus Serviços (US45), app nas lojas (US39) e as outras ideias da seção 4.

### ⏸️ Pós-MVP · precisa pagar (pausado)
> Regra do Matteo (11/11/2026): no MVP **nada pago** (nem plano com cartão "grátis até um limite", como o Blaze do Firebase). Cada item volta quando o projeto der resultado.

| O quê | Por que precisa pagar | Enquanto isso (grátis) |
|---|---|---|
| Sessão em cookie protegido (HttpOnly, Secure, SameSite) | Precisa de código no servidor (Cloud Functions = plano Blaze) | Sessão do próprio Firebase no navegador |
| Selo de CNPJ **automático** e fila de aprovação no servidor | Cloud Functions (Blaze) | Consulta no navegador + selo dado pelo adm no console |
| Apagar sozinho contas que nunca confirmaram o e-mail | Cloud Functions (Blaze) | Adm apaga no console; cadastro parado é limpo quando a pessoa tenta de novo |
| Fotos no Cloud Storage (+ AVIF convertido no servidor) | Storage exige Blaze (desde 03/02/2026) | **Fotos compactadas no próprio banco** (v0.8.0). O campo `url` já está reservado para a mudança |
| Fotos do pedido **obrigatórias** (3) — US13 | Fica viável com o Storage | Opcionais (até 6). Interruptor pronto: `fotosPedidoObrigatorias` (firebase/pedidos.js) e `FOTOS_PEDIDO_OBRIGATORIAS()` (regras) |
| E-mail de aviso (novo contato, orçamento, concluído) | Cloud Functions ou extensão de e-mail (Blaze) | Sino de avisos dentro do site |
| Notificação no celular (push) | Precisa de servidor para enviar | Sino de avisos dentro do site |
| Prazos automáticos sem ninguém abrir o site (10 dias, 1 ano, 30 dias) | Cloud Functions (Blaze) | O site confere os prazos quando cliente ou prestador abre |
| Segunda verificação no login (SMS) — US60 | SMS é cobrado | Senha + bloqueio de tentativas do Firebase |
| Domínio .com.br | ~R$ 40/ano | Endereço grátis do site |

---

## 3. O caminho do pedido — "Contato registrado" (aprovado em 18/11/2026)

1. **Encontrar:** o cliente escolhe o tipo de serviço, usa os **filtros** (nome, horário, distância, preço da visita) e vê os prestadores do mais perto ao mais longe.
2. **Aviso de cobrança:** antes de abrir o WhatsApp aparece se o prestador **cobra visita** (e quanto), o aviso de **taxa extra** das atividades secundárias e que **a S.D não participa da negociação nem do pagamento**. O cliente clica em "Entendi". *(Aparece de novo só depois de 7 dias.)*
3. **Registro mínimo:** o site grava 1 registro (cliente, prestador, serviço, datas) e avisa o prestador no **sino**. Prestador com os contatos escondidos: o cliente usa **"Pedir contato"** (descrição + fotos opcionais).
4. **"Você fez orçamento?"** (ao prestador entrar no site): **Não** → Encerrados. **Sim** → **formulário** (valor total, visita, nº de visitas, materiais, mão de obra, funcionários, início, duração, validade, observações). Sem resposta em **10 dias** → "Sem resposta" (Encerrados) e o cliente vê um aviso sutil para chamar de novo ou procurar outro.
5. **Comparar:** no perfil do cliente, em **Serviços**, cada pedido vira um bloco **"Em orçamento — ainda não realizado"** com um cartão por prestador (resumo; "Ver detalhes" abre tudo). Lembretes no 3º, 7º e 15º dia.
6. **Decidir:** **"Fechei com este"** (com confirmação). Os outros vão para Encerrados do prestador ("Cliente escolheu outro"). Ou **"Não fechei com nenhum"**.
7. **Finalizar:** o prestador marca **"Concluído"** → o cliente **confirma** → vai para **Serviços realizados** (cliente) e **Prestados** (prestador). *(Fotos do serviço finalizado e avaliação: Ciclo 4.)*
8. **Encerrados:** ficam guardados até **1 ano** e são apagados; a lixeira do prestador tira do quadro antes.

> **A S.D não mexe com o dinheiro do serviço.** O orçamento no site é **informativo**; cliente e prestador negociam e pagam entre eles.
> **LGPD:** o registro guarda só IDs, nome de exibição (primeiro nome ou nome da empresa), região, serviço, datas e o orçamento. Nunca telefone do cliente, CPF/CNPJ ou a conversa.

## 4. Histórias

Formato: **Como** [quem], **quero** [o quê] **para** [motivo].
Prioridade: **M** obrigatória no MVP · **S** importante · **C** desejável.

### Base e contas
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US01 | Todas as páginas com a mesma aparência e o mesmo menu. | M | — | ✅ |
| US02 | Usar no celular, tablet, computador e TV, tema claro ou escuro. | M | — | ✅ |
| US03 | Criar conta como Cliente CPF, Cliente CNPJ ou Prestador. | M | 2 | ✅ Real (11/11) |
| US04 | Entrar e sair com segurança, vendo só as páginas do meu tipo. | M | 2 | ✅ Real, só e-mail no MVP (11/11) |
| US05 | Recuperar senha ou login. | M | 2 | ✅ Senha real (11/11). "Esqueci o login" volta com login por CPF/CNPJ |
| US56 | Adm liga/desliga a conferência de CPF/CNPJ (desligado = modo teste). | M | 2 | ✅ (11/11) |
| US57 | CNPJ do prestador consultado na Receita (API pública grátis); selo dado pelo adm. | M | 2 | ✅ Consulta (11/11) · selo pelo console |
| US58 | Cadastro que parou no meio não prende o e-mail. | M | 2 | ✅ (11/11) |
| US59 | Aviso "confirme seu e-mail" em todas as páginas; ações com outras pessoas exigem e-mail confirmado. | M | 2 | ✅ Aviso (11/11) · regra usada nos Ciclos 3–4 |

### Perfis
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US06 | Cliente CPF vê e edita os dados. | M | — | ✅ (v0.7.9) |
| US07 | Cliente CNPJ informa responsável, contato no local e fotos. | M | — | ✅ Fotos do local salvas de graça no banco (v0.8.0) |
| US08 | Prestador com perfil completo. | M | — | ✅ Fotos de trabalhos salvas + aviso de preço da visita (v0.8.0) |
| US09 | Prestador vê o perfil como o cliente vê. | S | — | ✅ |
| US10 | Adm dá suporte sem nunca ver senhas. | S | — | ✅ No MVP pelo console do Firebase (painel do adm: US35/US47, depois) |
| US42 | Ligar/desligar a **localização** no perfil (botão na linha das abas). | M | 3 | ✅ Salvo no banco; desligado = some da busca (v0.7.9) |
| US43 | Prestador escolhe **Mostrar meus contatos** (padrão ligado, também no cadastro). Desligado: o cliente usa "Pedir contato". | S | 3 | ✅ (v0.7.9 + Pedir contato na v0.8.0) |
| US52 | Todo botão de excluir ou editar pede confirmação. | M | — | ✅ Padrão (09/11) |
| US53 | Uma lista única de todos os botões liga/desliga (padrão, o que faz, onde fica). | S | — | ✅ (09/11) |

### Encontrar e pedir
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US11 | Escolher a área e ver prestadores do mais perto ao mais longe, com mapa. | M | 3 | ✅ Dados reais (v0.7.9) |
| US12 | Filtrar por nome, horário (1º horário / emergência), distância e preço da visita. *(Avaliação retirada: decisão de 18/11.)* | S | 3 | ✅ (v0.8.0) |
| US13 | Registrar o contato (WhatsApp) ou **Pedir contato** (descrição + fotos); vários prestadores no mesmo pedido. | M | 3 | ✅ (v0.8.0) · fotos opcionais 🟡 **PAGO** (Storage): voltam a ser obrigatórias (3) |
| US14 | Prestador recebe o contato em **Contatos**, é avisado no site (sino + janela "Fez orçamento?") e responde em 10 dias. | M | 3 | ✅ No site (v0.8.0) · por e-mail 🟡 **PAGO** (Cloud Functions/extensão de e-mail) |
| US15 | Prestador preenche o orçamento (informativo): valor, visita, visitas, materiais, mão de obra, funcionários, início, duração, validade. | M | 3 | ✅ (v0.8.0) |
| US24 | Quadro do prestador: Contatos, Orçado, A realizar, Prestados + Encerrados; sanfona no celular. | S | 3 | ✅ Dados reais (v0.8.0) |
| US36 | ~~Informativo fixo de cobrança~~ → substituído pela US61 (aviso de preço da visita no perfil). | — | — | ➖ |
| US61 | **Aviso de cobrança** antes do WhatsApp: visita técnica (sim + valor / não / não informado), taxa extra das secundárias e "a S.D não participa da negociação". | M | 3 | ✅ (v0.8.0) |
| US62 | **Central de avisos** (sino) para cliente e prestador; apagados em 30 dias. | M | 3 | ✅ No site (v0.8.0) · e-mail/celular 🟡 **PAGO** (Cloud Functions / push) |
| US63 | **Fotos salvas de graça**: compactadas no banco (WebP 0,80, até 1080 px; iPhone: JPEG), 1 documento por foto, campo `url` reservado. | M | 3 | ✅ (v0.8.0) · Storage + AVIF 🟡 **PAGO** (Storage) |

### Orçar e decidir
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US16 | Cliente vê os pedidos e os orçamentos lado a lado (bloco "Em orçamento" em Serviços). | M | 3 | ✅ (v0.8.0) |
| US17 | "Fechei com este" (com confirmação) ou "Não fechei com nenhum". Negociação direto pelo WhatsApp. | M | 3 | ✅ (v0.8.0) |
| US18 | Prestador vê contatos encerrados sem serviço em **Encerrados** (motivo), apagados em 1 ano, com lixeira. | S | 3 | ✅ Dados reais (v0.8.0) |
| US19 | ~~Novo orçamento ao mesmo prestador~~ → o cliente chama de novo pelo WhatsApp (anti-spam de 7 dias). | — | — | ➖ |
| US20 | Voltar à lista sem perder a escolha. | S | 4 | 🟠 Tipo e prestador ficam no endereço; filtros ainda não |
| US21 | ~~Comparação automática dos orçamentos~~ → o bloco já mostra lado a lado. | — | — | ➖ |
| US22 | Contato do prestador: à mostra (WhatsApp) ou enviado junto com o orçamento (Pedir contato); cliente é avisado. | M | 3 | ✅ (v0.8.0) |
| US23 | Prestador vê a região aproximada do cliente (cidade; bairro só se o cliente autorizou). | S | 3 | ✅ (v0.8.0) |
| US25 | Cliente vê os serviços já feitos, com fotos. | S | 4 | 🟠 Lista real (v0.8.0); fotos do serviço finalizado no Ciclo 4 |
| US26 | Avaliar com estrelas e comentário (anônimo por padrão) **só quem realizou o serviço** (contato registrado + confirmado); prestador pode responder. | S | 4 | ⬜ |
| US54 | Prestador marca concluído → cliente confirma → Prestados; depois: 2 a 6 fotos + avaliação. | M | 4 | 🟠 Concluir/confirmar pronto (v0.8.0); fotos + avaliação no Ciclo 4 |

### Ajuda e confiança
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US27 | Tirar dúvidas e enviar sugestões. | M | — | ✅ (e-mail definido em 09/11) |
| US28 | Ler termos, privacidade e responsabilidades em linguagem simples (com advogado). | M | 6 | ⬜ |
| US29 | Sobre nós (história da empresa). | S | Depois | ⬜ |

### Servidor, segurança e LGPD
| Nº | História | Prior. | Ciclo | Situação |
|---|---|---|---|---|
| US30 | Dados guardados com segurança; senha nunca visível. | M | 2 | ✅ (11/11) |
| US31 | Servidor bloqueia os **dados** por tipo de conta (páginas: bloqueio na tela). | M | 2 | ✅ Regras publicadas (11/11) |
| US32 | Ver, corrigir, baixar e apagar meus dados (LGPD). | M | 5 | 🟠 Ver, corrigir e apagar a conta (com fotos, contatos e avisos) prontos; falta "baixar meus dados" |
| US33 | Fotos sem localização escondida (EXIF). | M | 5 | ✅ As fotos são redesenhadas antes de enviar (o EXIF não vai junto) — conferir no Ciclo 5 |
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
| US46 | Home própria do prestador (comunidade e networking): comunicados, agenda de eventos e grupos. **✅ v0.8.2 (19/11), falta teste real.** | S |
| US64 | **Eventos seletivos e divulgação comercial:** organizador contrata espaço e escolhe o público (todos, 1 atividade, várias atividades ou um segmento). Adm aprova e controla o período. Etiqueta "Patrocinado". Relatório só com números agregados (visualizações, se for medido). Nunca dados pessoais dos prestadores. | C |
| US65 | **Divulgação paga de grupos:** o responsável cadastra o grupo e paga **por anúncio** (valor + período), com aprovação do adm, redes sociais, segmentação por atividade e etiqueta "Patrocinado". | C |
| US66 | **Capacitação:** divulgar cursos (idiomas, profissionalizantes), palestras, treinamentos e parcerias educacionais de fora. Sem plataforma de ensino própria. | C |
| US67 | **"Confirmar que vou"** em eventos (ver regras abaixo). | S |
| US47 | Perfil Master: cadastrar admins e o que cada um pode fazer. | C |
| US48 | Registrar acompanhante e número de visitas. | C |
| US49 | Entrar com o telefone principal. | C |
| US50 | Trocar de conta pelo perfil. | C |
| US60 | Segunda verificação no login (ex.: código por e-mail ou SMS). **Pausado: SMS é pago.** | S |

**Não agora:** pagamento dentro do app · chat dentro do app · prestador só com CPF · categorias guardadas (Serviços domésticos, Aulas, Eventos, Beleza, Automóveis, Pets).

### Home do prestador — Pós-MVP (anotado em 19/11/2026)
**Nada disto está implementado.** Base pronta na v0.8.2: coleção `divulgacoes` com `publico` (geral/atividades) e `atividades`.

**US64 e US65 · Divulgação paga (eventos e grupos)**
- Cobrança **por anúncio** (período contratado), não assinatura geral. Pagamento = pós-MVP (regra "nada pago no MVP").
- Adm aprova, publica, suspende e define o período. Todo conteúdo pago com etiqueta **"Patrocinado"** e página de transparência sobre patrocinadores.
- Organizador recebe só **números agregados** (ex.: quantos prestadores da área viram), nunca nomes, telefones, e-mails, CPF ou CNPJ, nem listas de usuários. Sem rastreamento individual, cookies publicitários ou GPS.
- Medir visualizações exige registro novo: definir antes finalidade, base legal (LGPD) e prazo de guarda.

**US67 · "Confirmar que vou"**
- Prestador confirma, cancela e vê os eventos em que confirmou. 1 confirmação por conta e evento (id = evento + uid, sem repetição).
- Adm vê: total por evento, por categoria e a evolução. Organizador: **só estatística agregada**.
- Confirmação **não é** presença real. Se precisar: check-in por QR Code ou código de validação.
- Antes de implementar: finalidade, base legal, prazo de guarda, como a pessoa consulta e apaga (direitos do titular), texto claro e opcional na tela.
- O cadastro na S.D **não** autoriza uso comercial dos dados do prestador. Política de Privacidade e contratos comerciais passam por **advogado** antes de ativar (Ciclo 6).

**US66 · Capacitação:** nova seção na mesma coleção (`tipo: "capacitacao"`), só links externos.

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
