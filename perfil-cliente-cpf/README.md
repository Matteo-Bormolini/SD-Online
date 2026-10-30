# Perfil do Cliente CPF

**Sprint 1 · Épico E3 Perfis · ✅ Pronto (demonstração)**

O espaço de quem mora em casa ou apartamento. Aqui a pessoa cuida dos seus dados e acompanha os serviços.

## Para quem
Para o cliente pessoa física. Só ele (e o administrador, para suporte) abre esta página.

## O que entrega
- **Aba Perfil:** login, nome, CPF (não pode ser alterado), e-mail, endereço, telefone principal e até 4 secundários.
- **Editar perfil:** só preenche o que quer mudar; o resto continua igual.
- **Foto de perfil opcional** (JPG, PNG ou WEBP até 5 MB).
- **Aba Serviços realizados:** histórico com fotos de cada serviço.
- **Excluir perfil** com confirmação e aviso de que não tem volta.
- A senha nunca aparece, só "••••••••".

## Histórias atendidas
- **US06** — ver e editar meus dados.
- **US25** — ver os serviços já contratados, com fotos.
- **US16, US17 e US19** — comparar até 4 orçamentos, decidir e pedir de novo (Sprint 4).
- **US32** — corrigir e apagar meus dados (LGPD).

## Pronto quando
- [x] Dados, edição, foto, histórico e exclusão funcionam na tela.
- [ ] Aba **Serviços** com duas partes: **Orçamentos** (até 4 por pedido) e **Serviços realizados** (Sprint 4).
- [ ] As alterações são salvas no servidor (Sprint 5).

## Como testar
Entre pelo modo demonstração como **Cliente CPF** e clique em **Meu perfil**.

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. |
| `perfil-cliente-cpf.js` | Dados de demonstração e o que é só deste perfil. |

O visual e o comportamento comum vêm de [`componentes/`](../componentes/) (`perfil-base`, `carrossel`, `servicos-realizados`, `formulario`, `utilidades`).
