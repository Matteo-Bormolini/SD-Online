# Menu do topo (NavBar)

**Sprint 1 · Épico E1 Base do site · ✅ Pronto**

A barra vinho que aparece no alto de todas as páginas. É por ela que a pessoa navega pelo site.

## Para quem
Para todos: visitantes e quem já entrou na conta.

## O que entrega
- 7 itens: Início · Serviços · Para clientes · Seja um prestador · Sobre nós · Políticas · Suporte.
- Itens com **cadeado** levam ao login quando a pessoa ainda não entrou.
- Depois de entrar, cada tipo de usuário vê só os itens que pode usar.
- Botão de tema (lua/sol), **Entrar** e **Criar conta** (visitante) ou **Meu perfil** e **Sair** (logado).
- Em telas menores que 1260 px, o menu vira um botão de 3 riscos. Fecha com Esc ou clicando fora.

## Histórias atendidas
- **US01** — mesmo menu em todas as páginas.
- **US02** — funciona no celular, no computador e na TV.

## Pronto quando
- [x] O menu aparece igual em todas as páginas, sem ser escrito à mão.
- [x] O item da página atual fica destacado.

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `navbar.js` | Monta a barra, o botão de tema e o menu compacto. |
| `navbar.css` | Aparência da barra. |

**Onde mudar os itens do menu:** `configuracoes/config.js` (não aqui).
**Quem vê cada item:** `seguranca/acesso.js`.
