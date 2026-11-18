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
- **Serviços** (v0.8.0): bloco **Em orçamento / Em andamento** (um cartão por prestador, "Ver detalhes", "Fechei com este", "Não fechei com nenhum", aviso sutil de 10 dias, "Confirmar que o serviço foi feito") e, embaixo, os **serviços realizados**.
- **Botões de excluir e editar pedem confirmação** ("Tem certeza?") antes de agir.
- A senha nunca aparece, só "••••••••".

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `perfil-cliente-cpf.js` | Página e regras (dados reais da conta; visual vem de `componentes/perfil-base`). |

## Situação
✅ pronto · 🟡 só na demonstração · ⬜ a fazer

- 🟡 Perfil pronto (US06, US25, US42).
- ⬜ Orçamentos recebidos (até 4 por pedido) — **Ciclo 4**.
- ⬜ Salvar no servidor — **Ciclo 2**.
