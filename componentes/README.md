# Componentes — peças reutilizáveis

**Sprint 1 · Épico E1 Base do site · ✅ Entrega pronta · melhorias no quadro nas Sprints 3 e 4**

São "peças de montar": escritas uma vez e usadas em várias páginas.
Quando uma peça melhora, todas as páginas que a usam melhoram juntas.

## Para quem
Para quem desenvolve. O usuário vê o resultado: perfis e formulários que funcionam do mesmo jeito.

## O que entrega

| Peça | O que faz | Onde é usada |
|---|---|---|
| `utilidades/` | Formata telefone, CEP, data e R$; desenha estrelas; mostra uma foto reserva se a imagem faltar. | Login e perfis |
| `formulario/` | Visual dos campos (texto, senha com olho, caixas de marcar). | Login e perfis |
| `perfil-base/` | Tudo o que é igual nos perfis: abas, telefones, editar perfil, foto e excluir conta. | 4 perfis |
| `carrossel/` | Galeria de fotos que passa para os lados. | Perfis CPF, CNPJ e Prestador |
| `servicos-realizados/` | Histórico dos serviços contratados, com fotos. | Perfis CPF e CNPJ |
| `kanban-servicos/` | Quadro "Meus serviços" com as etapas de cada serviço. | Perfil do Prestador |

## Histórias atendidas
- **US01** — mesmo comportamento em todas as páginas.
- **US24** — quadro "Meus serviços" do prestador.
- **US25** — serviços realizados do cliente.

## Pronto quando
- [x] Nenhuma página copia o código de uma peça. Ela só carrega o arquivo.
- [ ] Quadro com a coluna "A orçar", orçamentos recusados em vermelho e "Arquivados" (Sprints 3 e 4).

## Parte técnica
Para usar uma peça, carregue o `.css` e o `.js` dela **depois** dos arquivos do padrão e **antes** do arquivo da página.
Ordem completa: [guia técnico](../docs/guia-tecnico.md#3-como-toda-página-é-montada).

Nomes das etapas do quadro: `kanban-servicos/kanban-servicos.js`, lista `ETAPAS`.
