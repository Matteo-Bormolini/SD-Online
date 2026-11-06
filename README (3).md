# Chaves de API

**Sprint 2 (modelo) e Sprint 5 (chaves reais) · Épico E9 Servidor, segurança e LGPD · ✅ Modelo pronto**

Chaves de API são como "senhas" que o servidor usa para falar com outros serviços (mapa, e-mail, IA).
Elas **nunca** podem ficar no GitHub.

## O que tem aqui
- `.env.example`: o **modelo**, com os nomes das chaves e **sem os valores**.

## Como usar
1. No servidor, copie `.env.example` e renomeie a cópia para `.env`.
2. Preencha os valores só no `.env`.
3. O `.env` é bloqueado pelo `.gitignore` e nunca vai para o GitHub.

## Regras
- **Nunca coloque uma chave real neste repositório.**
- Se uma chave for enviada por engano, cancele-a no serviço e gere outra. Apagar o arquivo não basta: o histórico do GitHub guarda tudo.

## Pronto quando
- [x] `.env.example` criado.
- [x] `.gitignore` bloqueando o `.env`.
- [ ] Chaves reais configuradas no servidor (Sprint 5).
