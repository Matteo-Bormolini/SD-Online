# Seus Serviços (área do prestador)

**Sprints 3 e 4 · Épico E6 Contato e localização · ⬜ Ideia em formação (só o nome mudou em 06/11/2026)**

É a página que abre pelo item **Seus Serviços** do menu (antes: "Seja um prestador").

## Para quem
Para prestadores (exige login). Clientes não acessam esta página.

## Ideia (06/11/2026 — ainda NÃO criar a página)
Um mapa com a localização de **todos os clientes que estão orçando com o prestador** e dos que **vão realizar o serviço com ele**.

## O que já está decidido
- O prestador vê **só os clientes que pediram orçamento a ele**. Não existe lista aberta de clientes ou condomínios.
- O mapa **não revela a posição real** do cliente: mostra só uma área aproximada, até o cliente decidir passar o endereço.

## Histórias atendidas
- **US23** — ver a região do cliente sem revelar o endereço exato.
- **US45** — "Seus Serviços": mapa dos clientes que orçam/vão realizar com o prestador.

## Pronto quando
- [x] Nome no menu: "Seus Serviços".
- [ ] Ideia fechada pelo Marco (o que aparece no mapa e em cada ponto).
- [ ] Nenhum endereço exato aparece para o prestador antes de o cliente decidir passar.

## Parte técnica
- Hoje: página "em construção" (`index.html`), já protegida (só prestadores e administrador abrem).
- O nome da pasta continua `localizar-condominios/` para não quebrar links; pode ser renomeada quando a página for criada (mudar também em `configuracoes/config.js`).
- A área aproximada tem de ser calculada no servidor. Se o ponto exato chegar ao navegador, ele pode ser descoberto, mesmo escondido no mapa.
