# Perfil do Administrador

Espaço da equipe S.D. O adm cuida do site e dá suporte. Vê os dados das contas, mas **nunca vê senhas**.

## Quem vê
- Só o administrador.

## O que tem
- **Aba Perfil:** nome, cargo, CPF/CNPJ (não muda), e-mail, telefones, endereço e avaliações.
- Editar perfil, foto, galeria (até 12 fotos) e excluir perfil.
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

## Situação
✅ pronto · 🟡 só na demonstração · ⬜ a fazer

- 🟡 Perfil pronto (US10).
- ⬜ Painel com números e controles — depois do MVP (US35). Perfil Master — depois do MVP (US47).
- ✅ Aba **Administração**: botão **Conferir CPF e CNPJ** (desligado = modo teste para cadastrar qualquer CPF/CNPJ). Salvo no banco, vale para o site todo (US56, 11/11/2026).
