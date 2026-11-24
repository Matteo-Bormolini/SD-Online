# Início (Home) e Sobre nós

A primeira página do site e a página "Sobre nós".

## Quem vê
- **Visitante:** apresentação da S.D e a lista de serviços (só os nomes).
- **Cliente (CPF ou CNPJ):** Olá → **Comunicados da S.D** → **Anúncios** (etiqueta "Anúncio" sempre, v0.8.5) → Serviços → Prestadores perto de você.
- **Adm (v0.8.5):** vê **tudo**: "O que os clientes veem" (comunicados e anúncios) e "O que os prestadores veem" (comunicados, eventos e grupos), depois Serviços e Prestadores. Barra **Ver como** no topo (Visitante · Cliente CPF · Cliente CNPJ · Prestador). Lembra a escolha nesta aba.
- **Mais leve (v0.8.5):** a Home mostra na hora a última leitura guardada neste navegador (até 24 h, só divulgações, sem dados pessoais) e atualiza em seguida com o banco.
- **Prestador:** Home própria (v0.8.2) — eventos, grupos e comunicados. **Nunca** vê dados de outros prestadores.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `home.css` / `home.js` | Página inicial: decide a visão (visitante, cliente ou prestador). |
| `home-prestador.js` / `home-prestador.css` | **v0.8.2** Home do prestador: seções, cartões, faixas rolantes e pop-up de detalhes. CSS só dentro de `.home-prestador` (classes `hp-`). |
| `sobre.html` | Sobre nós (provisória: "em desenvolvimento"). |

## Home do prestador (v0.8.2 · US46)
Página **só informativa e de divulgação** (conceito interno: Comunidade e Networking Profissional).
Contatos, orçamentos e serviços **continuam no Perfil** (não são repetidos aqui).

| Seção | O que mostra | Quando aparece |
|---|---|---|
| Comunicados da S.D | Avisos da plataforma (discretos; "Importante" com borda amarela) | Se houver comunicado publicado |
| Agenda de eventos | Eventos **gerais** e da **área do prestador** (atividade principal ou secundária), do mais próximo ao mais distante. "Ver detalhes" abre um pop-up | Se houver evento publicado que ainda não passou |
| Grupos e comunidades | Grupos externos com botões das redes (WhatsApp, Telegram, Instagram, Facebook, YouTube, LinkedIn, Site) | Se houver grupo publicado |

- Sem nada publicado: uma mensagem discreta. Sem conexão: mensagem + "Tentar de novo".
- **Cartões rolam para o lado** (toque, setas no computador, teclado ← → Home End). A página nunca rola para o lado.
- Cartões por tela: celular 1 (com o próximo aparecendo) · tablet 2 · computador 3 · TV 4. Sem rolagem automática.
- Links externos: nova aba, `noopener noreferrer`, com o domínio escrito no pop-up.
- **Dados:** `firebase/divulgacoes.js` (coleção `divulgacoes`). Quem cadastra é o **adm pelo console** — modelo dos campos em `firebase/README.md`. Sem dados fictícios no site.
- Etiqueta de público: "Todos os prestadores" ou "Para a sua área · Marcenaria". Exemplos criados pelo adm mostram "Exemplo ilustrativo" (v0.8.3).
- **Quem cadastra:** Perfil do adm → aba **Divulgações** (v0.8.3).

## Situação
✅ pronto · 🟠 pronto, falta teste real · ⬜ a fazer

- ✅ Home de visitante e de cliente (cliente vê prestadores reais perto dele; sem números fictícios — v0.7.9).
- 🟠 Home do prestador (v0.8.2) — falta o teste com conta real e o 1º conteúdo cadastrado pelo adm.
- 🟠 Avisos e anúncios da Home dos clientes + "Ver como" do adm (v0.8.5) — falta teste com as regras reais.
- ⬜ Pós-MVP da Home do prestador (US64–US67): divulgação paga, capacitação, "Confirmar que vou". Ver `docs/backlog.md`.
- ⬜ Sobre nós — **depois do MVP** (a história da empresa ainda será escrita).
