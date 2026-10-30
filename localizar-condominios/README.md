# Área do prestador ("Seja um prestador")

**Sprints 3 e 4 · Épico E6 Contato e localização · ⬜ Em definição**

É a página que abre pelo item **Seja um prestador** do menu.

## Para quem
Para prestadores (exige login). Clientes não acessam esta página.

## O que já está decidido
- O prestador vê **só os clientes que pediram orçamento a ele**. Não existe lista aberta de clientes ou condomínios.
- Ao abrir o pedido de um cliente, aparece um mapa da região do cliente.
- O mapa **não revela a posição real** do cliente: mostra só uma área aproximada.

## Decisão em aberto
O que esta página vai mostrar, já que o mapa do cliente fica dentro do pedido. Opções:
- apresentar a S.D para quem quer ser prestador;
- um mapa com os pedidos que o prestador já recebeu;
- remover a página.

## Histórias atendidas
- **US23** — ver a região do cliente sem revelar o endereço exato.

## Pronto quando
- [ ] Objetivo da página decidido.
- [ ] Nenhum endereço exato aparece para o prestador antes de o cliente decidir passar.

## Parte técnica
- Hoje: página "em construção" (`index.html`), já protegida (só prestadores e administrador abrem).
- A área aproximada tem de ser calculada no servidor. Se o ponto exato chegar ao navegador, ele pode ser descoberto, mesmo escondido no mapa.
