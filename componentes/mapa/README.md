# Mapa

**Peça reutilizável · ✅ Pronta (demonstração)**

Mapa grátis, sem chave e sem cadastro: **MapLibre GL** (biblioteca) + **OpenFreeMap** (desenho do mapa).

## Para quem
Páginas que mostram pontos no mapa: Localizar prestador e, no futuro, Localizar clientes.

## O que entrega
- Ponto **Você** (vinho), prestadores (preto) e **destaque pago** (vermelho).
- Clicar num ponto avisa a página (ex.: seleciona o prestador na lista).
- Textos do mapa em português.
- Só baixa a biblioteca quando o mapa é usado (a página abre mais rápido).
- Sem internet ou sem suporte no navegador: mostra um aviso e a lista continua funcionando.

## Parte técnica
| Arquivo | Para que serve |
|---|---|
| `mapa.js` | `SDMapa.criar(elemento, { centro })` → `marcarUsuario`, `definirPontos`, `selecionar`, `ajustarVisao`. |
| `mapa.css` | Caixa do mapa, pontos e legenda. |

- Versão e endereços: `configuracoes/config.js` → `mapa` (MapLibre 5.24.0 pelo jsDelivr).
- Para trocar o servidor de mapas, mude só `mapa.estilo`.
- Créditos do mapa (OpenFreeMap / OpenStreetMap) aparecem sozinhos no canto. Não remover: é exigência da licença.
- Peso: cerca de 280 KB (compactado) no primeiro acesso; depois fica guardado no navegador.
