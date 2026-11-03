# Site/App S.D — decisões de marca, visual e perfis

## Estrutura
- Projeto reunido na pasta **SDOnline**, uma pasta por parte (ver README.md da raiz).
- O antigo `global.css` foi dividido em `configuracoes/base.css`, `navbar/navbar.css` e `rodape/rodape.css`.
- O antigo `global.js` foi dividido em `configuracoes/config.js` (configuração única e links), `navbar/navbar.js` e `rodape/rodape.js`.
- Cada página fica em `<pasta>/index.html` e usa `data-raiz="../"`.
- "Para clientes" → `localizar-prestador/`; "Seja um prestador" → `localizar-condominios/`.

## Marca
- Nome completo: "Serviços" (em cima) / "Digitais" (embaixo). Abreviação: S.D.
- Logo: engrenagem com capacete de proteção em cima. SVG provisório (configuracoes/config.js e fotos/marca/). Trocar pelo arquivo oficial quando existir.

## Público / perfis
- 4 tipos de usuário: Administrador (adm), Cliente CPF (casas), Cliente CNPJ (empresas/condomínios), Prestador de Serviços.

## Perfil do Administrador
- Acesso total à plataforma (manutenção, reparos, ajustes, ajuda). Vê dados sigilosos (e-mail, telefone, localização...). NUNCA vê senha (guardada com hash no servidor).
- Cartão branco com contorno fino preto e cantos arredondados; vão entre NavBar e cartão.
- Abas "Perfil" e "Administração"; trocam por clique, arrastar com o mouse, deslizar no celular/trackpad e setas do teclado. Sem botões de seta.
- Ordem dos dados: Login, Nome completo, Cargo ("Administrador - <cargo do líder>"), CPF/CNPJ (inalterável e único), E-mail, WhatsApp/Telefone (+ secundários, máx. 4), Localização em células (Endereço, Número, Complemento, Bairro, CEP), Avaliações (estrelas = link para avaliações), Senha.
- Linha Senha: só "••••••••" + botão de olho (mostra/esconde aviso de segurança). Nova senha só dentro de Editar perfil.
- Editar perfil (sanfona): texto digitado é mantido ao fechar; campos vazios mantêm o valor anterior; botão único "Confirmar alteração" centralizado.
- Excluir perfil: pop-up "Certeza que deseja excluir seu perfil?" + aviso de irreversível.
- Foto à direita (no celular vai para cima): "Editar foto de perfil" e "+" (galeria, máx. 12, JPG/PNG/WEBP até 5 MB).
- Aba Administração: só "Work in progress" / "em desenvolvimento".

## Foco atual
- Manutenções + itens que o cliente precisa (ex.: teto com infiltração → prestador; TV de monitoramento quebrou → comparar melhores preços do mercado).
- Categorias ocultas (guardadas para o futuro, NÃO excluir): Serviços domésticos, Aulas, Eventos, Beleza e bem-estar, Automóveis, Pets.

## Diferencial
- Busca de prestadores por: proximidade/localização, avaliação, contato, recomendações/avaliações (recomendações pagas = destaque) e busca normal.
- Destaques pagos devem aparecer identificados.

## Fluxo do pedido
- Versão aprovada e completa: `docs/backlog.md`, seção 3 (até 4 orçamentos por pedido; contato por WhatsApp ou e-mail liberado pelo prestador).

## Visual
- Fundo principal #F2ECE6. Sempre abre no tema claro; escuro só se o usuário escolher.
- Navbar e rodapé em vinho #800000, textos brancos.
- Botões da barra: hover #5C0000 com contorno branco.
- Menu compacto (3 riscos) abaixo de 1260px.
- Rodapé: "Baixe o app" só no SITE (?plataforma=app ou standalone esconde).
- Números (demo): somente números, sem gráficos e sem emojis.

## Menu e acesso
- 7 itens: Início, Serviços, Para clientes 🔒, Seja um prestador 🔒, Sobre nós, Políticas, Suporte.
- 🔒 = bloqueado até o login (visitante vai para o login com destino).
- Visitante: Entrar + Criar conta. Logado: Meu perfil + Sair.

## Rodapé
- Navegação: Serviços · Para clientes (🔒) · Seja um prestador (🔒) · Sobre nós · Suporte.
- Políticas: Política da empresa · Termos de uso · Termo de responsabilidade.
- Aviso: Suporte só para erros e melhorias; não é canal de reclamação.
- Base: © ano S.D Serviços Digitais · Termos · Privacidade.

## Pendências
- Ver `docs/backlog.md` (Sprints e decisões em aberto).
