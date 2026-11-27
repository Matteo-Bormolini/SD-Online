# Perfil do Cliente CNPJ (empresas e condomínios)

Espaço de empresas, condomínios e MEI: dados da empresa, quem atende o prestador no local e fotos das áreas.

## Quem vê
- A própria empresa (e o adm, para suporte).

## O que tem
- **Linha das abas:** Perfil · Serviços · botão **Localização** (à direita).
- Razão social, nome fantasia, CNPJ (não muda), responsável (cargo em lista ou "Outro").
- Contato no local (zelador, portaria) e **horário de visitas** (dias + rodinhas de hora, até 3 faixas).
- Endereço com CEP automático, telefones, fotos do local (opcional, até 12, salvas de graça no banco desde a v0.8.0).
- **Serviços:** bloco **Em orçamento e em andamento** (um cartão por prestador, "Ver detalhes", "Fechei com este", "Não fechei com nenhum", "Confirmar que o serviço foi feito") e, embaixo, os **serviços realizados**.
- **Botões de excluir e editar pedem confirmação** ("Tem certeza?") antes de agir.
- A senha nunca aparece, só "••••••••".

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `perfil-cliente-cnpj.css` / `perfil-cliente-cnpj.js` | Página, visual e regras (dados reais da conta). |

## Situação
✅ pronto · ⬜ a fazer

- ✅ Perfil com dados reais: editar, telefones, endereço, horário de visitas, fotos do local, Localização e excluir conta (US07, US42).
- ✅ Serviços: orçamentos recebidos e serviços realizados, testados no site publicado em 25/11/2026 (4 orçamentos, "Fechei com este", prestador muda o valor depois, chamar de novo).
- ⬜ Fotos do serviço finalizado e avaliar o prestador — **Ciclo 4** (US25, US54, US26).
- ⬜ "Baixar meus dados" (LGPD) — **Ciclo 5** (US32).
- ⬜ Depois do MVP: conta da empresa separada da pessoa (responsável que pode ser trocado).

**A página está pronta para a etapa atual (Ciclo 3).** O que falta já tem Ciclo marcado.
