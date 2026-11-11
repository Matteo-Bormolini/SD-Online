# Chaves de API

Chaves de API são "senhas" que o servidor usa para falar com outros serviços (e-mail, mapa, IA).
Elas **nunca** podem ficar no GitHub.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `.env.example` | Modelo com os **nomes** das chaves, sem os valores. |

## Como usar (quando existir servidor)
1. No servidor, copie `.env.example` e renomeie para `.env`.
2. Preencha os valores só no `.env`.
3. O `.gitignore` da raiz impede o `.env` de ir para o GitHub.

## Cuidado
- Chave enviada por engano: cancele no serviço e gere outra. Apagar o arquivo não basta, o histórico do GitHub guarda tudo.

## Situação
✅ pronto · 🟡 só na demonstração · ⬜ a fazer

- ✅ Modelo `.env.example` e `.gitignore` (criados pelo GitHub em 11/11/2026: arquivos com ponto no começo não sobem arrastando).
- ✅ Ciclo 2 sem chaves secretas: a chave do Firebase é pública por natureza (quem protege são as regras) e as APIs de CNPJ não pedem chave.
