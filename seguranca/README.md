# Segurança e LGPD — quem pode ver o quê

Define o que cada tipo de pessoa pode ver. Regra: **cada um vê só o que precisa.**

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `acesso.js` | Regras usadas pela tela: esconde menus e páginas de quem não pode ver. |
| `permissoes.json` | As mesmas regras em lista (para um servidor próprio no futuro). **Manter igual ao `acesso.js`.** |
| `index.html` | Tabela de consulta das regras. |
| `recuperacao-acesso.md` | Regras de "esqueci a senha / o login". |
| `csp.md` | Lista do que o site pode carregar (proteção contra código malicioso). |
| `seguranca.css` / `seguranca.js` | Estilo e tabela da página `index.html`. |

## Regras principais
- CPF, telefone e endereço completo de clientes **nunca** são públicos.
- Prestador não vê outros prestadores. Cliente não vê outros clientes.
- Prestador vê só a região aproximada do cliente.
- Senha: só *hash* no servidor. Ninguém vê, nem o adm.

## Importante
- **Páginas:** o bloqueio continua na tela (o site é estático no GitHub Pages).
- **Dados:** protegidos pelas regras do banco ([`firebase/firestore.rules`](../firebase/firestore.rules)) desde 11/11/2026.
  Mexer no navegador pode mostrar uma página de adm vazia, mas **não** dá acesso aos dados de ninguém.
  Resultado completo dos testes: [`docs/testes-e-seguranca.md`](../docs/testes-e-seguranca.md).
- **CSP** em todas as páginas desde v0.7.6: [`csp.md`](csp.md).

## LGPD
| Cuidado | Situação |
|---|---|
| Sem cookies e sem rastreadores **hoje** | ✅ (anúncios vão exigir aviso e consentimento — depois do MVP) |
| Autorização clara no cadastro | ✅ |
| Botões de privacidade (localização, contatos, dados do CPF) | ✅ Salvos no banco; a busca e os pedidos respeitam |
| Fotos sem localização escondida (EXIF) | ✅ Redesenhadas antes de salvar · conferir no Ciclo 5 |
| Pedidos encerrados apagados em 1 ano | ✅ O site apaga quando cliente ou prestador entra · apagar sem ninguém entrar = pago |
| Avaliação anônima por padrão | ⬜ Ciclo 4 (junto com a página Avaliações) |
| Ver, corrigir, baixar e apagar meus dados | 🟠 Ver, corrigir e apagar a conta ✅ · baixar ⬜ Ciclo 5 |
| Política de privacidade e canal de contato | ⬜ Textos no Ciclo 4 ou 5 · revisão final no Ciclo 5 |
| Plano de aviso de vazamento (ANPD) | ⬜ Ciclo 5 |

## Situação
✅ pronto · 🟠 em parte · ⬜ a fazer

- ✅ Regras do banco publicadas (v0.8.6) e testadas no site publicado: 24 tentativas de ler ou mudar dados de outras pessoas negadas (25/11/2026) e avisos falsos negados (26/11).
- ✅ Bloqueio de tentativas no login testado no site publicado (27/11/2026).
- ⬜ **Ciclo 5:** revisão completa (US32–US34), os itens ⬜ da tabela LGPD e as correções de [`docs/testes-e-seguranca.md`](../docs/testes-e-seguranca.md).
- Esta página termina no **Ciclo 5**. O Ciclo 6 (lançamento) não tem itens dela.
