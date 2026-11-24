# Perfil do Administrador

Espaço da equipe S.D. O adm cuida do site e dá suporte. Vê os dados das contas, mas **nunca vê senhas**.

## Quem vê
- Só o administrador.

## O que tem
- **Aba Perfil:** nome, cargo, CPF/CNPJ (não muda), e-mail, telefones, endereço e avaliações.
- Editar perfil, foto, galeria (até 12 fotos) e excluir perfil.
- **Aba Administração (v0.8.5):** todos os botões liga/desliga juntos. Os do **site todo** funcionam (confirma "Salvo"; se o banco recusar, o botão volta). Os de **cada conta** aparecem só para consulta.
- **Aba Divulgações (v0.8.3):** eventos, grupos e comunicados da Home do prestador; **v0.8.5:** avisos (comunicado para "Clientes") e anúncios da Home dos clientes, um bloco embaixo do outro: exemplos ilustrativos (criar/apagar), formulário (novo/editar, imagem reduzida no navegador) e lista (editar, publicar/suspender, encerrar, excluir — tudo com confirmação).
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
