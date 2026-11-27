# Perfil do Prestador

A "vitrine" do prestador: empresa, fotos e avaliações.

## Quem vê
- **O prestador:** edita tudo.
- **Clientes:** só a versão pública (sem endereço completo).

## Perfil
- Logo **obrigatória** (salva de verdade, reduzida), sobre a empresa, certificações.
- **Atividades secundárias:** escolhidas da lista (sem repetir, até 8). O cliente vê o aviso de possível taxa adicional.
- **Início das atividades:** lista de 1975 até o ano atual. **Horário de atendimento:** dias + horas (componente `datahora`).
- **Região:** distância + cidades da lista oficial do IBGE (até 20).
- **Avisos no topo:** "Finalize seu cadastro" (esquerda) e "Urgente: logo" (direita). Somem quando não há pendência.
- O cartão público (**vitrine**) é atualizado sozinho ao abrir/salvar o perfil.
- Fotos de trabalhos (opcional, até 12) **salvas de graça** no banco (v0.8.0) e avaliações (sempre anônimas, salvo autorização).
- **Visita técnica (aviso de preço)** em Editar perfil: não informar / não cobro / cobro + valor. O cliente vê antes de chamar no WhatsApp (v0.8.0).
- **Barra do perfil (à direita):** botões **Mostrar meus contatos** e **Localização**.
  - *Mostrar meus contatos* (começa ligado): o cliente vê telefone e e-mail, e os botões **WhatsApp** e **Ligar** funcionam (o WhatsApp passa pelo aviso de cobrança e registra o contato). Desligado: o cliente usa **Pedir contato**; seu WhatsApp vai junto com o orçamento.
  - *Localização* (começa ligado): desligado, a empresa não aparece em mapas nem listas.
- **Ver como cliente:** mostra o perfil como o cliente vê.

## Quadro de serviços
- Desde a **v0.8.7** fica na página **Seus Serviços** (`seus-servicos/`). Botão **Seus Serviços** na barra do perfil.
- Links antigos (`#servicos`) abrem a página nova sozinhos. No perfil fica só o número de **serviços concluídos**.

## Regras da tela
- **Botões de excluir e editar pedem confirmação** ("Tem certeza?") antes de agir.
- A senha nunca aparece, só "••••••••".

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `perfil-prestador.css` / `perfil-prestador.js` | Página, visual e regras (dados reais da conta). |

## Situação
✅ pronto · ⬜ a fazer

- ✅ Perfil e visão do cliente com dados reais (US08, US09, US24).
- ✅ Quadro movido para **Seus Serviços** (v0.8.7).
