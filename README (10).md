# Pedido de orçamento

**Sprint 3 · Épico E5 Pedir e negociar · ⬜ Planejada**

O coração da S.D: é aqui que o cliente pede um orçamento e o prestador responde.

## Para quem
- **Clientes** (CPF e CNPJ): fazem o pedido por esta página.
- **Prestadores:** recebem o pedido e respondem pelo quadro **Meus serviços**, no perfil deles.

## O que vai entregar
1. Na página do prestador, o cliente escolhe o serviço e preenche o **pedido de orçamento**.
2. O pedido aparece no quadro do prestador, na coluna **A orçar**. Ele é avisado no site e por e-mail.
3. O prestador decide se atende. Se sim, preenche o **orçamento padrão**: serviço, materiais, mão de obra, valores e datas de início e fim. As datas podem mudar depois do aceite.
4. O cliente é avisado de que chegou uma proposta.
5. O cliente pode pedir orçamento a quantos prestadores quiser. Ele recebe só dos que procurou.

## Histórias atendidas
- **US13** — pedir orçamento na página do prestador.
- **US14** — prestador recebe na coluna "A orçar" e é avisado.
- **US15** — orçamento padrão.

## Pronto quando
- [ ] O cliente faz um pedido completo na tela.
- [ ] O pedido aparece na coluna "A orçar" do prestador.
- [ ] O prestador envia um orçamento com todos os campos.
- [ ] Nenhum dado pessoal aparece para quem não deve (regras de `seguranca/`).

## Parte técnica
- Hoje: página "em construção" (`index.html`), já protegida (só clientes e administrador abrem).
- Cada pedido e cada orçamento será um registro no banco de dados (Sprint 5).
