# Decisões do projeto

Registro com data. **A decisão mais nova vale.** As em aberto ficam no fim da seção 1.

## 1. Registro datado

### 13/11/2026 — segurança do banco (v0.7.6)
- **Cadastro em 2 passos:** preenche tudo → recebe o link → ao clicar, o perfil e a reserva do CPF/CNPJ são criados. Antes de confirmar, os dados ficam em `cadastrosPendentes` (só o dono vê) e **nenhum CPF/CNPJ fica reservado**. Substitui "E-mail não confirmado" de 11/11.
- **CPF/CNPJ conferido no servidor:** com o botão "Conferir CPF e CNPJ" ligado, as regras do banco conferem os dígitos verificadores (também o CNPJ com letras). Desligado = modo teste.
- **CPF real (existe e é da pessoa):** não há API grátis (Serpro é paga). Se alguém usar o CPF/CNPJ de outra pessoa, o dono fala com o Suporte e o adm libera a reserva.
- **CNPJ ativo conferido sem dar para pular:** precisa de código no servidor (Cloud Functions = plano pago; ou Cloudflare Worker grátis). Fica para depois do MVP. Até lá: consulta na tela + selo `verificado` só pelo adm.
- **Tipo da conta travado (opção B):** a reserva do CPF/CNPJ guarda o tipo da conta; o perfil precisa ser igual. Excluir conta apaga perfil + reserva juntos. Trocar de tipo = excluir a conta e cadastrar de novo.
- **Limite de tamanho em cada campo** (regras do banco, bloco 1 "LIMITES") e lista fechada de campos do perfil.
- **CSP** (Content-Security-Policy) em todas as páginas. Explicação: `seguranca/csp.md`.
- **E-mail já cadastrado:** o cadastro avisa que o e-mail já tem conta e indica "Esqueceu a senha?" (limite do Firebase; aceito).

### 11/11/2026 (noite) — fechamento do Ciclo 2 (v0.7.5)
- **Nada pago no MVP.** Nem plano com cartão "grátis até um limite" (Blaze). O que só funciona pagando fica **pausado** em "Pós-MVP · precisa pagar" (backlog, seção 2): cookie HttpOnly, selo automático de CNPJ, limpeza automática de contas, fotos no Storage, SMS, domínio.
- **Senha:** mínimo **6** fica (decisão do Marco: facilidade de uso). Segunda verificação no login → pós-MVP (US60).
- **Política de senha do Firebase:** modo **Exigir**, mínimo 6, máximo 128, sem exigências de caracteres (estava desligada).
- **E-mail confirmado (padrão, substituído em 13/11 pelo cadastro em 2 passos):** sem confirmar, a pessoa entra, vê/edita o próprio perfil e pode excluir a conta. Tudo que envolve **outra pessoa** (aparecer na busca, pedir orçamento, orçar, avaliar) exige e-mail confirmado (regra do banco `emailConfirmado()`). Aviso com "Reenviar" em todas as páginas.
- **CPF:** só dígitos verificadores (não existe API pública grátis de CPF).
- **CNPJ do prestador:** consulta grátis no navegador — **CNPJá** (principal) e **CNPJ.ws** (reserva), sem chave. Só **bloqueia** CNPJ baixado/inapto/suspenso/nulo. Não achou, nome diferente ou API fora do ar → entra e fica para o adm. Guardado no perfil (`cnpjConsulta`): fonte, situação, MEI, nome da Receita, CNAEs e data. O **selo** (`verificado`) só o adm dá, pelo console (fila no site = pós-MVP).
- **Botão do adm "Conferir CPF e CNPJ"** (aba Administração): desligado = **modo teste** (aceita qualquer CPF/CNPJ com o tamanho certo). Salvo em `configuracoes/site` no banco; todos leem, só o adm muda.
- **Cadastro que parou no meio** (login sem perfil): ao tentar entrar, o login é apagado e a pessoa cria de novo; ao cadastrar de novo com o mesmo e-mail e senha, o login é reaproveitado.
- **Versão do fechamento do Ciclo 2: v0.7.5** (pedido do Marco). Ciclo 3 continua v0.8.0.

### 11/11/2026 — servidor: Firebase (Ciclo 2 · Contas reais)
- **Servidor:** **Firebase**, plano grátis (Spark): Authentication + Firestore. Site continua no **GitHub Pages**.
- **Login do MVP: só e-mail + senha.** CPF/CNPJ continua obrigatório e **único** no cadastro, mas não serve para entrar. Volta depois (obrigatório no futuro).
- **Nova senha:** o link do e-mail abre o **pop-up do site** ("Criar nova senha"). O link vale **1 hora** (padrão do Firebase; antes: 30 min).
- **Senha:** mínimo **6** caracteres (antes 12; pedido do Marco), máximo 128, sem obrigar misturar. Continua bloqueando senhas comuns, sequências, só números e dados pessoais. No Firebase: política "Exigir", mínimo 6, máximo 128, sem exigências de caracteres. O hash da senha é feito pelo Firebase (não é mais Argon2id próprio).
- **"Não pode ser igual à anterior":** o Firebase não confere. Fica pendente.
- **Administrador:** cria a conta pelo site (como cliente) e troca `tipo` para `adm` **pelo console** do Firebase. Ninguém vira adm pelo site.
- **E-mail não confirmado:** a pessoa entra e usa o site normalmente; aparece aviso com botão de reenviar. Pedidos (Ciclo 3) vão exigir e-mail confirmado.
- **Fotos:** continuam só na tela. Guardar fotos precisa do Cloud Storage, que exige o plano pago (Blaze). Decidir antes do Ciclo 3.
- **E-mails próprios** (avisos de pedido): ficam para o Ciclo 3 (Firebase grátis só manda e-mails de conta).
- **E-mail de recuperação:** pelo Firebase (remetente padrão do Firebase), sem precisar de domínio.
- **CNPJ do prestador (decidido em 09/11):** a S.D confere — dígitos/letras + API pública (ativo, MEI, nome e CNAE do serviço principal). O que não bater vai para aprovação manual antes do selo "Verificado".
- **Domínio (decidido em 09/11):** não compra antes do Ciclo 2. No 1º ano fica o endereço grátis; .com.br (~R$ 40/ano) só se o projeto der resultado.
- **Ciclo 1 concluído → v0.6.0.**

### 09/11/2026 (tarde) — funcionamento do pedido
- **Pedido:** o cliente cria **uma solicitação** e, na página Localizar prestador, marca os prestadores que quer (depois de ver avaliações, serviços e localização). O mesmo pedido vai para todos os marcados.
- **Fotos do pedido:** **3 obrigatórias** (ângulos diferentes), **limite de 6**.
- **Contraproposta: retirada.** O contato do prestador é liberado quando ele **envia o orçamento**, com o aviso "Quer negociar preço ou material? Fale com o prestador antes de aceitar". A negociação acontece pelo WhatsApp; no site o cliente só aceita ou recusa.
- **Prazo de A orçar:** sem resposta em **10 dias**, o pedido expira e vai para **Encerrados** ("Expirou"). O prazo pode mudar após pesquisa de mercado.
- **Orçamento:** **sem preço padrão** (cada serviço tem seu preço). Todo orçamento informa se **cobra visita** e, se sim, **quanto**. Isso substitui o "informativo de cobrança" fixo.
- **Fim do serviço:** quem marca como finalizado é o **cliente**, com **2 a 6 fotos** obrigatórias e a avaliação padrão. O prestador não move para Prestados.
- **Avaliação:** só depois de finalizado. O prestador **pode responder** (não é obrigatório).
- **Mostrar meus contatos:** só no prestador, **ligado** no perfil e no cadastro. Desligado mostra aviso de que fica mais difícil o cliente falar com ele.
- **Textos legais (US28):** ficam para o fim, antes do lançamento (precisam de advogado). Saíram do Ciclo 1 e foram para o Ciclo 6.
- **Página de parceiros e ofertas:** anotada para depois do MVP (detalhes no backlog, US55).

### 09/11/2026 (manhã)
- **Projeto individual com Ciclos** (não Sprints). Lista Agora · Próximo · Depois em `backlog.md`.
- **Dinheiro:** a S.D não terceiriza nem intermedeia o serviço e não mexe com o pagamento entre cliente e prestador. Cliente não paga nada. O prestador coloca um **informativo** de como cobra (fica no quadro dele e aparece ao cliente).
- **Como a S.D ganha dinheiro (depois do MVP):** anúncios no site + **destaque** do prestador por assinatura mensal, cancelável a qualquer momento, sem juros ou multa, começando em **R$ 20/mês** e subindo com o tempo. Banco para receber: decidir depois do MVP (Itaú citado).
- **Sobre nós:** fica para depois do MVP (história ainda não escrita).
- **E-mail do Suporte:** matteo.bormolini228@al.unieduk.com.br (um só para tudo, por enquanto).
- **Quadro do prestador:** nova etapa **A orçar**; no celular as etapas abrem/fecham (sanfona); nova área **Encerrados** (sem serviço), apagada 1 ano depois, com lixeira. Substitui "Arquivados após 30 dias".
- **Padrão:** todo botão de **excluir ou editar** pede confirmação ("Tem certeza?").
- **Padrão:** botões liga/desliga **cinza escuro = desligado**, **vinho = ligado**; todos cadastrados em `configuracoes/interruptores.js` e visíveis na página `interruptores/` (adm).
- **Botão Localização** na linha das abas do perfil, à direita (CPF, CNPJ e prestador).
- **Botão Mostrar meus contatos** (padrão **ligado**) no perfil do prestador: controla WhatsApp, Ligar, telefone e e-mail na visão do cliente e na busca. Clientes CPF/CNPJ **não** têm este botão (o contato deles nunca é mostrado; quem libera contato é o prestador).
- **Home do prestador:** decidir no fim do Ciclo 3.

### 06/11/2026
- Menu: "Para clientes" → **Serviços**; "Seja um prestador" → **Seus Serviços**. Prestador nunca vê "Serviços".
- Linha "Login" saiu dos 4 perfis. Entrar com e-mail, CPF ou CNPJ (futuro: telefone). Nome completo não.
- Recuperação de acesso só em pop-ups. Senha 12+ caracteres, Argon2id no servidor. *(Substituído em 11/11/2026: mínimo 6, hash pelo Firebase.)*
- Avaliações anônimas por padrão. Horário de visitas CNPJ com dias + rodinhas.
- Selos das lojas: só arquivos oficiais.

### 05/11/2026 (Localizar prestador)
- Caixas por tipo → lista + mapa → cartão. Ordem por distância; destaque não sobe.
- Sem botões de rota. Mapa: MapLibre + OpenFreeMap.

### 03/11/2026
- Sobre nós em `home/sobre.html`; os 4 documentos legais juntos em `politica-privacidade/`.
- Página sem conteúdo: cartão "Esta página ainda está em desenvolvimento.".

### Em aberto
| Decisão | Opções | Até |
|---|---|---|
| Onde registrar acompanhante e nº de visitas (US48) | Avaliação · Serviços realizados · fechamento do pedido | Depois |
| E-mail definitivo do Suporte | Manter o atual · e-mail do domínio da S.D | Ciclo 6 |

## Decisões antigas (até 20/10/2026)

> Algumas foram trocadas depois (ex.: menu em 06/11). Vale sempre a decisão mais nova acima.

### Estrutura
- Projeto reunido na pasta **SDOnline**, uma pasta por parte (ver README.md da raiz).
- O antigo `global.css` foi dividido em `configuracoes/base.css`, `navbar/navbar.css` e `rodape/rodape.css`.
- O antigo `global.js` foi dividido em `configuracoes/config.js` (configuração única e links), `navbar/navbar.js` e `rodape/rodape.js`.
- Cada página fica em `<pasta>/index.html` e usa `data-raiz="../"`.
- "Para clientes" → `localizar-prestador/`; "Seja um prestador" → `localizar-condominios/`.

### Marca
- Nome completo: "Serviços" (em cima) / "Digitais" (embaixo). Abreviação: S.D.
- Logo: engrenagem com capacete de proteção em cima. SVG provisório (configuracoes/config.js e fotos/marca/). Trocar pelo arquivo oficial quando existir.

### Público / perfis
- 4 tipos de usuário: Administrador (adm), Cliente CPF (casas), Cliente CNPJ (empresas/condomínios), Prestador de Serviços.

### Perfil do Administrador
- Acesso total à plataforma (manutenção, reparos, ajustes, ajuda). Vê dados sigilosos (e-mail, telefone, localização...). NUNCA vê senha (guardada com hash no servidor).
- Cartão branco com contorno fino preto e cantos arredondados; vão entre NavBar e cartão.
- Abas "Perfil" e "Administração"; trocam por clique, arrastar com o mouse, deslizar no celular/trackpad e setas do teclado. Sem botões de seta.
- Ordem dos dados: Login, Nome completo, Cargo ("Administrador - <cargo do líder>"), CPF/CNPJ (inalterável e único), E-mail, WhatsApp/Telefone (+ secundários, máx. 4), Localização em células (Endereço, Número, Complemento, Bairro, CEP), Avaliações (estrelas = link para avaliações), Senha.
- Linha Senha: só "••••••••" + botão de olho (mostra/esconde aviso de segurança). Nova senha só dentro de Editar perfil.
- Editar perfil (sanfona): texto digitado é mantido ao fechar; campos vazios mantêm o valor anterior; botão único "Confirmar alteração" centralizado.
- Excluir perfil: pop-up "Certeza que deseja excluir seu perfil?" + aviso de irreversível.
- Foto à direita (no celular vai para cima): "Editar foto de perfil" e "+" (galeria, máx. 12, JPG/PNG/WEBP até 5 MB).
- Aba Administração: só "Work in progress" / "em desenvolvimento".

### Foco atual
- Manutenções + itens que o cliente precisa (ex.: teto com infiltração → prestador; TV de monitoramento quebrou → comparar melhores preços do mercado).
- Categorias ocultas (guardadas para o futuro, NÃO excluir): Serviços domésticos, Aulas, Eventos, Beleza e bem-estar, Automóveis, Pets.

### Diferencial
- Busca de prestadores por: proximidade/localização, avaliação, contato, recomendações/avaliações (recomendações pagas = destaque) e busca normal.
- Destaques pagos devem aparecer identificados.

### Fluxo do pedido
- Versão aprovada e completa: `docs/backlog.md`, seção 3 (até 4 orçamentos por pedido; contato por WhatsApp ou e-mail liberado pelo prestador).

### Visual
- Fundo principal #F2ECE6. Sempre abre no tema claro; escuro só se o usuário escolher.
- Navbar e rodapé em vinho #800000, textos brancos.
- Botões da barra: hover #5C0000 com contorno branco.
- Menu compacto (3 riscos) abaixo de 1260px.
- Rodapé: "Baixe o app" só no SITE (?plataforma=app ou standalone esconde).
- Números (demo): somente números, sem gráficos e sem emojis.

### Menu e acesso
- 7 itens: Início, Serviços, Para clientes 🔒, Seja um prestador 🔒, Sobre nós, Políticas, Suporte.
- 🔒 = bloqueado até o login (visitante vai para o login com destino).
- Visitante: Entrar + Criar conta. Logado: Meu perfil + Sair.

### Rodapé
- Navegação: Serviços · Para clientes (🔒) · Seja um prestador (🔒) · Sobre nós · Suporte.
- Políticas: Política da empresa · Termos de uso · Termo de responsabilidade.
- Aviso: Suporte só para erros e melhorias; não é canal de reclamação.
- Base: © ano S.D Serviços Digitais · Termos · Privacidade.
