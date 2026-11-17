# Perfil do Prestador

A "vitrine" do prestador e a sua ferramenta de trabalho (quadro de serviços).

## Quem vê
- **O prestador:** edita tudo e usa o quadro.
- **Clientes:** só a versão pública (sem endereço completo e sem o quadro).

## Aba Perfil
- Logo **obrigatória** (salva de verdade, reduzida), sobre a empresa, certificações.
- **Atividades secundárias:** escolhidas da lista (sem repetir, até 8). O cliente vê o aviso de possível taxa adicional.
- **Início das atividades:** lista de 1975 até o ano atual. **Horário de atendimento:** dias + horas (componente `datahora`).
- **Região:** distância + cidades da lista oficial do IBGE (até 20).
- **Avisos no topo:** "Finalize seu cadastro" (esquerda) e "Urgente: logo" (direita). Somem quando não há pendência.
- O cartão público (**vitrine**) é atualizado sozinho ao abrir/salvar o perfil.
- Fotos de trabalhos (opcional, até 12) e avaliações (sempre anônimas, salvo autorização).
- **Linha das abas (à direita):** botões **Mostrar meus contatos** e **Localização**.
  - *Mostrar meus contatos* (começa ligado): o cliente vê telefone e e-mail, e os botões **WhatsApp** e **Ligar** funcionam. Desligado: botões cinza "liberado após o orçamento" e um aviso de que fica mais difícil ser contratado.
  - *Localização* (começa ligado): desligado, a empresa não aparece em mapas nem listas.
- **Ver como cliente:** mostra o perfil como o cliente vê.

## Aba Meus serviços (quadro)
- Etapas: **A orçar → Orçando → Aceito → A realizar → Prestados**.
- **A orçar:** pedidos novos de clientes, com a data "Responder até". Botões *Fazer orçamento* ou *Não vou orçar*. Sem resposta em **10 dias**, o pedido expira e vai para Encerrados.
- **Prestados:** só o **cliente** marca como finalizado (com fotos e avaliação). O prestador não move cartões para lá.
- **Encerrados:** pedidos que terminaram **sem serviço** (recusados, cancelados ou não atendidos).
  Cada um mostra o motivo e a data em que **será apagado (1 ano depois)**. A lixeira apaga antes.
- **No celular**, cada etapa abre e fecha (sanfona) para ocupar menos espaço.
- Muda de etapa pelos botões ou arrastando o cartão (mouse). O prazo de 10 dias fica em `kanban-servicos.js` → `diasParaExpirarAOrcar`.
- **Botões de excluir e editar pedem confirmação** ("Tem certeza?") antes de agir.
- A senha nunca aparece, só "••••••••".

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `perfil-prestador.css` / `perfil-prestador.js` | Página, visual e regras (dados reais da conta). |
| Quadro | `componentes/kanban-servicos/` |

## Situação
✅ pronto · 🟡 só na demonstração · ⬜ a fazer

- 🟡 Perfil, visão do cliente e quadro prontos (US08, US09, US24, US43).
- ⬜ Formulário do orçamento padrão ao clicar em *Fazer orçamento* — **Ciclo 3** (US15).
- ⬜ Pedidos reais chegando em A orçar + aviso por e-mail — **Ciclo 3** (US14).
