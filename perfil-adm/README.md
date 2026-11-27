# Perfil do Administrador

Espaço da equipe S.D. O adm cuida do site e dá suporte. Vê os dados das contas, mas **nunca vê senhas**.

## Quem vê
- Só o administrador.

## O que tem
- **Aba Perfil:** nome, cargo, e-mail, telefones, endereço e senha (só "••••••••").
- Editar perfil, foto (sem foto = iniciais do nome) e excluir perfil.
- **Aba Administração (v0.8.5):** **Botões de comando** do site todo, separados em **Todos · Clientes · Prestadores** (deslizante em cima, nome embaixo). Ligado = faz a regra; desligado = pula a etapa. Hoje: **Conferir CPF e CNPJ** (Todos) e **Mostrar destaques** (Clientes). Salva na hora e confirma "Salvo"; se o banco recusar, o botão volta. Botões individuais (Localização, Mostrar contatos, Tema…) ficam só no perfil de cada pessoa.
- **Comando novo:** `configuracoes/interruptores.js` (bloco com `comando: true`, `campo`, `grupo`) + `firebase/firebase.js` (`INTERRUPTORES_DO_SITE`) + área 40 das regras.
- **Aba Divulgações (v0.8.3):** eventos, grupos e comunicados da Home do prestador; **v0.8.5:** comunicados (para "Todos os usuários" ou "Clientes"), Divulgações (comunicado só para prestadores) e anúncios da Home dos clientes; nota no formulário diz onde cada público aparece; 14 exemplos; um bloco embaixo do outro: exemplos ilustrativos (criar/apagar), formulário (novo/editar, imagem reduzida no navegador) e lista (editar, publicar/suspender, encerrar, excluir — tudo com confirmação).
- **Botões de excluir e editar pedem confirmação** ("Tem certeza?") antes de agir.
- A senha nunca aparece, só "••••••••".

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `perfil-adm.css` / `perfil-adm.js` | Página, visual e regras (dados reais da conta). |
| `divulgacoes-adm.js` | **v0.8.3** Aba Divulgações (usa `firebase/divulgacoes.js`). |

## Suporte que o adm faz pelo console do Firebase (no MVP)
- Selo **verificado** do prestador, apagar cadastro que nunca confirmou o e-mail, criar outro adm. Passo a passo: `firebase/README.md` → "Uso no dia a dia".

## Situação
✅ pronto · ⬜ a fazer

- ✅ Perfil pronto com dados reais (US10). **Para o MVP não falta nada nesta página.**
- ✅ Aba **Administração**: **Conferir CPF e CNPJ** (desligado = modo teste) e **Mostrar destaques**. Salvo no banco, vale para o site todo (US56, 11/11/2026; v0.8.5).
- ✅ Aba **Divulgações**: testada no site publicado — criar e apagar um anúncio (24/11/2026) e criar eventos por área (26/11).
- ⬜ Depois do MVP: painel com números (US35), página para ligar/desligar o destaque (US44) e Perfil Master (US47).
