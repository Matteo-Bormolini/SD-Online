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
- Fotos de trabalhos (opcional, até 12) **salvas de graça** no banco (v0.8.0) e avaliações (sempre anônimas, salvo autorização).
- **Visita técnica (aviso de preço)** em Editar perfil: não informar / não cobro / cobro + valor. O cliente vê antes de chamar no WhatsApp (v0.8.0).
- **Linha das abas (à direita):** botões **Mostrar meus contatos** e **Localização**.
  - *Mostrar meus contatos* (começa ligado): o cliente vê telefone e e-mail, e os botões **WhatsApp** e **Ligar** funcionam (o WhatsApp passa pelo aviso de cobrança e registra o contato). Desligado: o cliente usa **Pedir contato**; seu WhatsApp vai junto com o orçamento.
  - *Localização* (começa ligado): desligado, a empresa não aparece em mapas nem listas.
- **Ver como cliente:** mostra o perfil como o cliente vê.

## Aba Meus serviços (quadro)
- Etapas (v0.8.0): **Contatos → Orçado → A realizar → Prestados** + **Encerrados**. Dados reais (coleção `orcamentos`).
- **Contatos:** clientes que chamaram você, com "Responder até" (10 dias). *Fiz orçamento* (abre o formulário) ou *Não fiz*. Ao entrar no site aparece a janela **"Você fez orçamento?"**.
- **Orçado:** aguardando o cliente. *Editar orçamento* ou *Encerrar*.
- **A realizar:** o cliente marcou "Fechei com este". *Marcar como concluído* → o cliente confirma → **Prestados**.
- **Encerrados:** não orçados, sem resposta, outro prestador escolhido, cancelados ou encerrados. Apagados em **1 ano**; a lixeira tira do quadro antes.
- **No celular**, cada etapa abre e fecha (sanfona). As etapas mudam **pelos botões** (não há mais arrastar).
- Prazos: `firebase/pedidos.js` (REGRAS) e área 00 das regras do banco.
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
