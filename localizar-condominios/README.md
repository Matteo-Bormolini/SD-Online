# Seus Serviços (área do prestador)

O quadro de trabalho do prestador: contatos, orçamentos e serviços dos clientes.
O nome da pasta é antigo; no menu ela aparece como **Seus Serviços**.

## Quem vê
- Só o **prestador** (cada um vê só os seus). O adm vê um aviso (não tem quadro próprio).

## Blocos da página (v0.8.7)
1. **Resumo:** contatos para responder · orçado (aguardando) · a realizar · prestados.
2. **Quadro:** **Contatos → Orçado → A realizar → Prestados**. Clique no serviço para ver detalhes e botões.
   - **Contatos:** *Fiz orçamento* (abre o formulário) ou *Não fiz*. Prazo de resposta: 10 dias.
   - **Orçado:** *Editar orçamento* ou *Encerrar*. O cliente decide.
   - **A realizar:** *Marcar como concluído* → o cliente confirma → **Prestados**.
   - **Celular:** uma etapa aberta por vez (toque no nome da etapa).
3. **Encerrados** (fechado): terminaram sem serviço. Apagados em **1 ano**; a lixeira tira do quadro antes.

Os avisos do sino (prestador) e o botão **Seus Serviços** da Home e do perfil abrem esta página.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` | Página em blocos. |
| `seus-servicos.js` | Liga o quadro aos contatos reais (`componentes/pedidos` · `firebase/pedidos.js`). |
| `seus-servicos.css` | Visual dos blocos. |
| Quadro | `componentes/kanban-servicos/` |

## Situação
- Verificação se mantem ou descarta a página
- ✅ Quadro com dados reais (v0.8.7; antes ficava no perfil).
- ⬜ Mapa dos clientes (região aproximada) — **depois do MVP** (US45).
