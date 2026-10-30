# Página inicial (Home)

**Sprint 1 · Épico E1 Base do site · ✅ Pronto (demonstração)**

É a primeira página que a pessoa vê. Ela explica em segundos o que a S.D faz e convida a pessoa a entrar.

## Para quem
- **Visitante:** quer entender o serviço antes de criar conta.
- **Quem já entrou:** quer ir direto ao que interessa.

## O que entrega

**Para o visitante**
- Chamada principal: *"Quebrou, vazou ou parou? A gente conecta você a quem resolve."*
- **Como funciona** em 3 passos: pedir orçamentos, comparar e decidir, combinar direto.
- Os tipos de serviço: Elétrica, Hidráulica, Infiltração e impermeabilização, Pintura, Ar-condicionado, Portões e interfones, Câmeras e monitoramento, Reparos gerais e Comprar equipamentos.
- Convite para clientes e para prestadores.
- Prestadores, avaliações e fotos **só aparecem depois de entrar**.

**Para quem já entrou**
- Busca de serviço ou prestador.
- Prestadores em destaque, avaliações recentes, trabalhos e dicas de manutenção.

## Histórias atendidas
- **US01** e **US02** — base do site.
- Leva à busca de prestadores (**US11**, Sprint 3).

## Pronto quando
- [x] O visitante entende o serviço sem precisar entrar.
- [x] Quem entrou vê a vitrine; o visitante não vê dados de prestadores.
- [ ] Os dados vêm do servidor, não da demonstração (Sprint 5).

## Como testar
1. Abra `home/index.html` como visitante.
2. Entre pelo modo demonstração e volte à Home para ver a versão logada.

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. |
| `home.css` | Visual da página. |
| `home.js` | Monta as duas versões (visitante e logado) e os dados de demonstração. |
| `sobre.html` | Página "Sobre nós" (em construção, Sprint 2). |

**Onde mudar:** tipos de serviço → `home.js`, lista `CATEGORIAS`. Dados de demonstração → `home.js`, objeto `DEMO`.

> As categorias Serviços domésticos, Aulas, Eventos, Beleza e bem-estar, Automóveis e Pets estão **guardadas para o futuro**. Não apague.
