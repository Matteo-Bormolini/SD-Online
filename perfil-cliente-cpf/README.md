# Perfil do Cliente CPF

Espaço de quem mora em casa ou apartamento: dados pessoais e serviços já feitos.

## Quem vê
- O próprio cliente (e o adm, para suporte).

## O que tem
- **Linha das abas:** Perfil · Serviços · botão **Localização** (à direita).
  - Ligado: vê os prestadores do mais perto ao mais longe.
  - Desligado: vê a lista em ordem alfabética.
- Nome, CPF (não muda), e-mail, telefones, endereço com CEP automático, foto opcional.
- **Privacidade:** "Mostrar meus dados aos prestadores" (primeiro nome e bairro). Começa **desligado**.
- **Serviços** (v0.8.0): bloco **Em orçamento e em andamento** (um cartão por prestador, "Ver detalhes", "Fechei com este", "Não fechei com nenhum", aviso sutil de 10 dias, "Confirmar que o serviço foi feito") e, embaixo, os **serviços realizados**.
- **Botões de excluir e editar pedem confirmação** ("Tem certeza?") antes de agir.
- A senha nunca aparece, só "••••••••".

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `perfil-cliente-cpf.js` | Página e regras (dados reais da conta; visual vem de `componentes/perfil-base`). |

## Situação
✅ pronto · ⬜ a fazer

- ✅ Perfil com dados reais: editar, telefones, endereço, foto, Localização, "Mostrar meus dados" e excluir conta (US06, US42).
- ✅ Serviços: orçamentos recebidos e serviços realizados, testados no site publicado em 25/11/2026 (3 orçamentos, "Fechei com este", concluído → confirmado, "Não fechei com nenhum").
- ⬜ Fotos do serviço finalizado e avaliar o prestador — **Ciclo 4** (US25, US54, US26).
- ⬜ "Baixar meus dados" (LGPD) — **Ciclo 5** (US32).

**A página está pronta para a etapa atual (Ciclo 3).** O que falta já tem Ciclo marcado.
