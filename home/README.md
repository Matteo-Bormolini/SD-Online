# Início (Home)

A primeira página do site.

## Quem vê
- **Visitante:** apresentação da S.D e a lista de serviços (só os nomes).
- **Cliente (CPF ou CNPJ):** Olá → **Comunicados da S.D** → **Anúncios** (etiqueta "Anúncio" sempre, v0.8.5) → Serviços → Prestadores perto de você. Comunicados e anúncios usam o **mesmo visual da Home do prestador** (`home-prestador.js`, visão "cliente").
- **Adm (v0.8.5):** vê **tudo**: "O que os clientes veem" (comunicados e anúncios) e "O que os prestadores veem" (comunicados, divulgações, eventos e grupos), depois Serviços e Prestadores. Barra **Ver como** no topo (Visitante · Cliente CPF · Cliente CNPJ · Prestador). Lembra a escolha nesta aba.
  - **Espelho:** a prévia do adm **sempre lê o banco na hora** (não usa leitura guardada) e usa as mesmas regras de separar e a mesma ordem do cliente e do prestador. Se a leitura falhar, aparece o **motivo** na tela (ex.: o Firebase deste navegador está com outra conta) + "Tentar de novo".
- **Mais leve (v0.8.5):** para clientes e prestadores, a Home mostra na hora a última leitura guardada neste navegador (até 24 h, só divulgações, sem dados pessoais) e atualiza em seguida com o banco. Se a atualização falhar: aviso "Não foi possível atualizar agora. Mostrando a última leitura." + "Tentar de novo".
- **Prestador:** Home própria (v0.8.2) — comunicados, divulgações, eventos e grupos. **Nunca** vê dados de outros prestadores.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `home.css` / `home.js` | Página inicial: decide a visão (visitante, cliente ou prestador). |
| `home-prestador.js` / `home-prestador.css` | **v0.8.2** Home do prestador: seções, cartões, faixas rolantes e pop-up de detalhes. CSS só dentro de `.home-prestador` (classes `hp-`). |

## Home do prestador (v0.8.2 · US46)
Página **só informativa e de divulgação** (conceito interno: Comunidade e Networking Profissional).
Contatos, orçamentos e serviços ficam em **Seus Serviços** (v0.8.7; botão no topo da Home).

| Seção | O que mostra | Quando aparece |
|---|---|---|
| Comunicados da S.D | Avisos da plataforma para **todos os usuários** (público `todos`; discretos; "Importante" com borda amarela) | Se houver comunicado publicado para todos |
| Divulgações (v0.8.5) | Comunicados **só para prestadores** (todos os prestadores ou da área), com a etiqueta do público | Se houver comunicado publicado para prestadores |
| Agenda de eventos | Eventos **gerais** e da **área do prestador** (atividade principal ou secundária), do mais próximo ao mais distante. "Ver detalhes" abre um pop-up | Se houver evento publicado que ainda não passou |
| Grupos e comunidades | Grupos externos com botões das redes (WhatsApp, Telegram, Instagram, Facebook, YouTube, LinkedIn, Site) | Se houver grupo publicado |

- Sem nada publicado: uma mensagem discreta. Sem conexão: mensagem + "Tentar de novo".
- **Cartões rolam para o lado** (toque, setas no computador, teclado ← → Home End). A página nunca rola para o lado.
- Cartões por tela: celular 1 (com o próximo aparecendo) · tablet 2 · computador 3 · TV 4. Sem rolagem automática.
- Links externos: nova aba, `noopener noreferrer`, com o domínio escrito no pop-up.
- **Dados:** `firebase/divulgacoes.js` (coleção `divulgacoes`). Quem cadastra é o **adm**, pela aba Divulgações (modelo dos campos para o console: `docs/guia-tecnico.md`, seção 13). Sem dados fictícios no site.
- Etiqueta de público: "Todos os prestadores" ou "Para a sua área · Marcenaria". Exemplos criados pelo adm mostram "Exemplo ilustrativo" (v0.8.3).
- **Quem cadastra:** Perfil do adm → aba **Divulgações** (v0.8.3).

## Situação
✅ pronto · 🟠 pronto, falta teste real · ⬜ a fazer

- ✅ Home de visitante e de cliente (cliente vê prestadores reais perto dele; sem números fictícios — v0.7.9).
- ✅ Comunicados e anúncios da Home dos clientes: conferidos com contas reais de cliente (25/11/2026).
- ✅ Home do prestador: testada no site publicado (26/11) — o adm cadastrou eventos pela aba Divulgações; o prestador de Elétrica viu o evento de Elétrica e não o de Marcenaria.
- 🟠 Barra **Ver como** do adm: falta 1 conferência depois da correção de 25/11 (ver `componentes/ver-como/README.md`).
- ⬜ Antes do lançamento: apagar pela aba Divulgações os **exemplos ilustrativos** e os eventos de teste ("TESTE Claude… (apagar)").
- ⬜ Depois do MVP (US64–US67): divulgação paga, capacitação, "Confirmar que vou". Ver `docs/backlog.md`.

**Para finalizar a página:** fazer a conferência do "Ver como" e, antes do lançamento, apagar os exemplos e os testes.
