# Encontrar prestadores ("Para clientes")

**Sprint 3 · Épico E4 Encontrar · ⬜ Planejada**

O cliente escolhe o tipo de serviço e vê os prestadores daquela área, do mais perto ao mais longe.

## Para quem
Para clientes CPF e CNPJ (exige login). Prestadores **não** acessam esta página.

## O que vai entregar
1. O cliente escolhe a área (ex.: encanador).
2. Aparece a lista dos prestadores cadastrados nessa área, **do mais perto ao mais longe**.
3. Um mapa mostra um ponto para cada prestador, com **o cliente no centro**.
4. Cada cartão leva à página do prestador, onde o cliente pede o orçamento.
5. Ao voltar de um pedido, a lista continua com os mesmos filtros.

Depois do MVP: filtros por nome e por avaliação, e destaques pagos identificados como "Destaque".

## Histórias atendidas
- **US11** — encontrar por área e proximidade, com mapa.
- **US20** — voltar à lista sem perder os filtros.
- **US12** — filtros por nome e avaliação (futuro).

## Pronto quando
- [ ] Lista por área, ordenada por distância, funcionando na tela.
- [ ] Mapa centrado no cliente.
- [ ] Cartões abrem a página do prestador.
- [ ] Funciona no celular e no computador.

## Parte técnica
- Hoje: página "em construção" (`index.html`), já protegida (só clientes e administrador abrem).
- Acesso pelo item **Para clientes** do menu.
- A distância deve ser calculada no servidor, sem enviar o endereço exato de ninguém ao navegador.
