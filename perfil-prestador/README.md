# Perfil do Prestador

**Sprint 1 · Épicos E3 e E7 · ✅ Entrega pronta (demonstração) · melhorias nas Sprints 3 e 4**

É a "vitrine" do prestador e, ao mesmo tempo, sua ferramenta de trabalho.
Um perfil completo passa confiança; o quadro de serviços ajuda a não perder nenhum cliente.

## Para quem
- **O prestador** (com CNPJ ou MEI): edita o perfil e organiza os serviços.
- **Os clientes:** veem só a versão pública, sem dados privados e sem o quadro.

## O que entrega

**Aba Perfil**
- Logo **obrigatória**. Sem ela, um aviso pede para adicionar.
- Sobre a empresa, especialidades, registros e certificações, responsável técnico.
- Horário de atendimento e se atende emergências fora do horário.
- **Região de atendimento:** distância máxima a partir do endereço. O cliente vê só o bairro.
- Fotos de trabalhos (opcional, até 12), com aviso para pedir autorização ao cliente.
- Avaliações recentes.
- **Ver como cliente:** mostra o perfil do jeito que o cliente vê.

**Aba Meus serviços**
- Quadro com as etapas do serviço: **Orçando → Aceito → A realizar → Prestados**.
- Muda de etapa pelos botões ou arrastando o cartão.

## Histórias atendidas
- **US08** — perfil completo.
- **US09** — ver como o cliente vê.
- **US24** — organizar os serviços por etapa.
- **US14 e US18** — receber pedidos na coluna "A orçar" e ver recusados e arquivados (Sprints 3 e 4).

## Pronto quando
- [x] Perfil, edição, fotos, visão do cliente e quadro de serviços funcionam na tela.
- [x] O cliente só consegue abrir a versão pública.
- [ ] Coluna **A orçar** no quadro, orçamentos recusados em vermelho e **Arquivados** (Sprints 3 e 4).
- [ ] Botões **WhatsApp** (verde) e **E-mail** (vinho), liberados pelo prestador; cinza quando ainda não liberados. Substituem os botões atuais de WhatsApp e Ligar (**US22**, Sprint 4).
- [ ] As alterações e os serviços são salvos no servidor (Sprint 5).

## Como testar
1. Entre pelo modo demonstração como **Prestador** e clique em **Meu perfil**.
2. Clique em **Ver como cliente** para ver a versão pública.
3. Abra a aba **Meus serviços** e mova um cartão de etapa.
4. Entre como **Cliente CPF** e abra a mesma página: só a versão pública aparece.

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. |
| `perfil-prestador.css` | Visual do que é só deste perfil. |
| `perfil-prestador.js` | Dados de demonstração, visão do cliente e regras do perfil. |

- Abrir direto na visão do cliente: `perfil-prestador/index.html?visao=cliente`.
- Nomes das etapas do quadro: `componentes/kanban-servicos/kanban-servicos.js`, lista `ETAPAS`.
