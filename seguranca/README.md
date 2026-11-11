# Segurança e LGPD — quem pode ver o quê

Define o que cada tipo de pessoa pode ver. Regra: **cada um vê só o que precisa.**

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `acesso.js` | Regras usadas pela tela (demonstração). |
| `permissoes.json` | As mesmas regras, para o servidor. **Manter igual ao `acesso.js`.** |
| `index.html` | Tabela de consulta das regras. |
| `recuperacao-acesso.md` | Regras de "esqueci a senha / o login". |

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

## LGPD
| Cuidado | Situação |
|---|---|
| Sem cookies e sem rastreadores **hoje** | ✅ (anúncios vão exigir aviso e consentimento) |
| Autorização clara no cadastro | ✅ |
| Avaliação anônima por padrão | 🟡 |
| Botões de privacidade (localização, contatos, dados CPF) | 🟡 Na tela |
| Pedidos encerrados apagados em 1 ano | 🟡 Regra definida; o servidor apaga |
| Política de privacidade e canal de contato | ⬜ Ciclo 6 (com advogado) |
| Ver, corrigir, baixar e apagar meus dados | 🟡 Editar e excluir na tela |
| Fotos sem localização escondida (EXIF) | ⬜ Ciclo 5 |
| Plano de aviso de vazamento (ANPD) | ⬜ Ciclo 5 |
