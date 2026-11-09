# Mapa

Mapa grátis, sem chave e sem cadastro: **MapLibre GL** (biblioteca) + **OpenFreeMap** (desenho do mapa).

## O que mostra
- Ponto **Você** (vinho), prestadores (preto) e destaque (vermelho).
- Clicar num ponto seleciona o prestador na lista.
- Sem internet: aparece um aviso e a lista continua funcionando.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `mapa.js` | `SDMapa.criar(elemento, { centro })` e funções para marcar e selecionar pontos. |
| `mapa.css` | Caixa do mapa, pontos e legenda. |

## Como mudar
- Versão e endereço do mapa: `configuracoes/config.js` → `mapa`.
- Os créditos do mapa no canto **não podem ser removidos** (exigência da licença).

## Situação
- 🟡 Funciona na demonstração. O desenho real do mapa ainda não foi testado fora do computador de testes.
