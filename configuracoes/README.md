# Configurações — o padrão de todo o site

**Sprint 1 · Épico E1 Base do site · ✅ Pronto**

É aqui que mora a "identidade" da S.D: cores, botões e todos os links do site.
Mudou aqui, muda em todas as páginas de uma vez.

## Para quem
Para quem cuida do site. O usuário não vê esta pasta, mas sente o resultado: tudo com a mesma cara.

## O que entrega
- Cores oficiais nos temas claro e escuro.
- Botões, links e mensagens com o mesmo visual em todo lugar.
- Um lugar só para os links das páginas, do menu e do rodapé.
- O modo demonstração: permite testar o site "logado" sem servidor e protege as páginas de cada tipo de conta.

## Histórias atendidas
- **US01** — mesma aparência e mesmo menu em todas as páginas.
- **US02** — tema claro ou escuro, fácil de ler.
- **US04** — cada tipo de conta só vê as páginas que pode usar (na demonstração).

## Pronto quando
- [x] Nenhuma página cria cores ou botões próprios.
- [x] Trocar um link aqui muda o menu e o rodapé de todas as páginas.
- [x] Quem abre uma página que não pode ver é levado ao login (visitante) ou ao início (logado).

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `base.css` | Cores (claro/escuro), fontes, botões, links e mensagens. |
| `config.js` | Links das páginas, itens do menu e do rodapé, lojas, ícones, modo demonstração e proteção das páginas. |

**Onde mudar:** links e menu → topo do `config.js` (objeto `CONFIG`). Cores → variáveis `--cor-...` do `base.css`.

Mais detalhes: [guia técnico](../docs/guia-tecnico.md).
