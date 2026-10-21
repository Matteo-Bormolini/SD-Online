# Configurações das páginas

Padrão único usado por **todas** as páginas.

| Arquivo | O que faz |
|---|---|
| `config.js` | Endereços das páginas, itens do menu, links do rodapé, lojas, ícones e funções compartilhadas. **Para mudar um link do site, mude aqui.** |
| `base.css` | Cores oficiais, tema claro/escuro, fontes, botões, links e mensagens. |
| `modelo-pagina.html` | Ponto de partida de toda página nova. Copie para a pasta da página. |

Ordem de carregamento em cada página: `base.css` → `navbar.css` → `rodape.css` → `config.js` → `navbar.js` → `rodape.js` → arquivos da página.
