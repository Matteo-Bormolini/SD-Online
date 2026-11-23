# Versões

## Como os números funcionam (SemVer)

`vX.Y.Z` → **X** muda no lançamento (v1.0.0) · **Y** muda a cada Ciclo concluído · **Z** muda em correções.
Versões de teste no meio de um Ciclo: `vX.Y.Z-alpha.N`.

- Nenhuma versão antiga é apagada: dá para voltar se algo quebrar.
- Cada versão = uma **tag** + uma **Release** no GitHub.

## Plano

| Versão | Quando |
|---|---|
| v0.6.0 | Fim do Ciclo 1 (decisões: servidor, domínio, CNPJ verificado) |
| v0.7.5 | Fim do Ciclo 2 (contas reais) — número escolhido pelo Marco (11/11/2026) |
| v0.8.0 | Fim do Ciclo 3 (encontrar e pedir) |
| v0.9.0 | Fim do Ciclo 4 (avaliar e finalizar) |
| v0.10.0 | Fim do Ciclo 5 (segurança e LGPD) |
| v1.0.0 | Lançamento fechado (inclui os textos legais com advogado) |

## Histórico

| Versão | Data | O que entrou |
|---|---|---|
| v0.8.4 | 23/11/2026 | **Correção: prestador sumia da busca.** Regras: listas de texto conferidas de uma vez e o **cartão da busca (vitrine) virou cópia do perfil salvo** — listas, horário e fotos só precisam ser iguais aos do perfil (antes, com perfil completo, o banco recusava o cartão por limite de cálculos). Categorias conferidas pela lista fixa. **Localização desligada:** o prestador continua na lista (no fim, sem distância), só não aparece no mapa; ao clicar nele, o mapa volta para o cliente. Perfil: endereço novo calcula o ponto antes de publicar o cartão; aviso se o cartão não for atualizado; aviso ao prestador com a Localização desligada. |
| v0.8.3 | 23/11/2026 | **Aba "Divulgações" no Perfil do adm**: cadastrar, editar, publicar/suspender, encerrar e excluir eventos, grupos e comunicados pelo site (com confirmação), imagem reduzida no navegador. Botão **Criar/Apagar exemplos ilustrativos** (9 divulgações fictícias, etiqueta "Exemplo ilustrativo" na Home). Regras: campo `exemplo`. Ajuste: data dos comunicados não corta mais. |
| v0.8.2 | 19/11/2026 | **Home do prestador** (US46 · conceito interno: Comunidade e Networking Profissional). Comunicados da S.D (discretos), Agenda de eventos (gerais e por atividade principal/secundária, pop-up de detalhes: data, horário, modalidade, local, buffet, estacionamento, organizador, link de inscrição) e Grupos e comunidades (WhatsApp, Telegram, Instagram, Facebook, YouTube, LinkedIn, Site). Cartões em faixas rolantes (toque, setas, teclado), tema claro/escuro, celular à TV. Dados reais da coleção `divulgacoes` (só o adm cadastra, pelo console). Regras do banco: área 80 + 2 índices. Pós-MVP anotado: US64–US67. |
| v0.8.1 | 19/11/2026 | Correções no celular: tocar fora fecha o sino e o menu (iPhone), lugar do sino reservado na NavBar, hover preso no toque. |
| v0.8.0 | 18/11/2026 | **Fim do Ciclo 3 — fluxo "Contato registrado".** Filtros em Localizar (nome, horário, distância, preço da visita). Aviso de preço da visita no perfil do prestador e aviso de cobrança antes do WhatsApp. Contato registrado + "Pedir contato" (anti-spam 7 dias). Janela "Você fez orçamento?" + formulário do orçamento (informativo). Quadro novo (Contatos · Orçado · A realizar · Prestados · Encerrados) com dados reais. Bloco "Em orçamento/Em andamento" no perfil do cliente (Fechei com este, Não fechei com nenhum, aviso sutil de 10 dias, lembretes). Concluir (prestador) → confirmar (cliente). Sino de avisos. Fotos salvas de graça no banco (WebP 0,80 até 1080 px). Regras do banco: áreas 50, 60 e 70. |
| v0.7.9 | 17/11/2026 | **Sem dados fictícios + perfis de verdade.** Regras do banco organizadas por área (Perfil_CPF: Editar…), editar confere só os campos do tipo e que mudaram. Prestador: atividades secundárias em lista (aviso de taxa ao cliente), ano em lista (1975 até hoje), horário de atendimento (dias + horas), cidades atendidas (lista do IBGE). Componente **datahora** (rodinha do mouse 1 passo, digitar, relógio e calendário) no lugar do hora-rolante. Horário de visitas do CNPJ opcional. Aviso "Finalize seu cadastro" (prestador e CNPJ) e "Urgente: logo" lado a lado no computador. Foto de perfil salva de verdade (reduzida, ~1–40 KB). Login com "carregando". Mapa e busca com prestadores reais (vitrine) e GPS opcional. Correção: depois de um erro ao salvar, as caixas marcadas e o contador não voltam mais. |
| v0.7.7–v0.7.8 | 17/11/2026 | Regras do banco (só texto): cadastro passava do limite de 1.000 cálculos do Firebase. |
| v0.7.6 | 13/11/2026 | **Segurança do banco** (após os 187 testes de 12/11): cadastro em 2 passos (perfil e reserva do CPF/CNPJ só depois de confirmar o e-mail); dígitos do CPF/CNPJ conferidos nas regras; tipo da conta guardado na reserva; limite de tamanho em cada campo e lista fechada de campos; CSP em todas as páginas. |
| v0.7.5 | 11/11/2026 | **Fim do Ciclo 2.** Correções da auditoria: arquivos da alpha.2 nas pastas certas e README restaurado; botão do adm "Conferir CPF e CNPJ" (modo teste); consulta do CNPJ do prestador (CNPJá/CNPJ.ws); cadastro parado no meio não prende o e-mail; aviso de e-mail confirmado em todas as páginas; regras do banco (configurações do site, selo `verificado` só pelo adm, reserva do documento só some junto com o perfil); `.gitignore`; backlog e decisões atualizados. |
| v0.7.0-alpha.2 | 11/11/2026 | Senha mínima de 6 caracteres (antes 12), no site e no Firebase. |
| v0.7.0-alpha.1 | 11/11/2026 | Firebase: pasta `firebase/` (login, cadastro com CPF/CNPJ único, sair, esqueci a senha pelo pop-up, confirmação de e-mail, perfil real com editar/excluir, botões liga/desliga salvos) e regras do banco (`firebase/firestore.rules`). Login só por e-mail no MVP. Modo demonstração desligado. |
| v0.6.1 | 11/11/2026 | Release "Fim do Ciclo 1" + nova frase da Home. |
| v0.6.0 | 11/11/2026 | Fim do Ciclo 1: decisões fechadas (servidor Firebase, CNPJ conferido com selo, sem domínio no 1º ano). |
| v0.6.0-alpha.2 | 09/11/2026 | Decisões do funcionamento do pedido (fotos 3 obrigatórias até 6; sem contraproposta); quadro: A orçar expira em 10 dias, só o cliente finaliza (Prestados); aviso quando "Mostrar meus contatos" está desligado; botão também no cadastro do Prestador; backlog com parceiros/ofertas e explicação das versões. |
| v0.6.0-alpha.1 | 09/11/2026 | READMEs para projeto individual; quadro do prestador com A orçar, sanfona no celular e Encerrados; pop-up de confirmação padrão; botões Localização e Mostrar meus contatos; lista única de botões liga/desliga; WhatsApp/Ligar no "Ver como cliente"; e-mail do Suporte; relatório de testes. |
| v0.5.1 | 06/11/2026 | Recuperação de acesso e componentes (tag aponta para f53503f). |
| v0.5.0 | 06/11/2026 | Componentes (tag aponta para d5e17f1, versão incompleta). |
| v0.4.0 | 05/11/2026 | Localizar prestador. |
| v0.3.1-Faxina_tecnica | 03/11/2026 | Ajustes das páginas. |
| v0.3.0 | 30/10/2026 | READMEs, backlog e fluxos. |
| v0.2.0-alpha.1 | 30/10/2026 | Página Suporte. |
| v0.0.0 | — | Perfis. |

Tags apagadas em 11/11/2026 por estarem fora do padrão: `0.7.0` (sem "v", trocada por `v0.7.0-alpha.1`) e `v.0.6.0` (repetia a `v0.6.0`).

Observação: também existe a tag `V0.4.0` (V maiúsculo), fora do padrão. Fica guardada, não apagar.
