# Perfil do Administrador

**Sprint 1 · Épico E3 Perfis · 🟡 Perfil pronto (painel de administração no futuro)**

O espaço da equipe S.D. O administrador cuida da plataforma e dá suporte aos usuários.
Ele vê os dados das contas, mas **nunca vê senhas**.

## Para quem
Só para a equipe que mantém a S.D.

## O que entrega
- **Aba Perfil:** login, nome, cargo, CPF/CNPJ (não pode ser alterado), e-mail, telefone principal e até 4 secundários, endereço e avaliações.
- **Editar perfil**, foto de perfil, galeria (até 12 fotos) e excluir perfil com confirmação.
- **Aba Administração:** reservada para o painel de administração (hoje mostra "em desenvolvimento").

## Histórias atendidas
- **US10** — dar suporte sem ver senhas.
- **US35** — painel de administração (depois do MVP).

## Pronto quando
- [x] Perfil, edição, fotos e exclusão funcionam na tela.
- [x] Só o administrador abre esta página.
- [ ] Painel de administração com números e controles (depois do MVP).

## Como testar
Entre pelo modo demonstração como **Administrador** e clique em **Meu perfil**.

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. |
| `perfil-adm.css` | Visual do que é só deste perfil. |
| `perfil-adm.js` | Dados de demonstração e regras do perfil. |
