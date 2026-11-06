# Componentes — peças reutilizáveis

**Sprint 1 · Épico E1 Base do site · ✅ Entrega pronta · melhorias no quadro nas Sprints 3 e 4**

São "peças de montar": escritas uma vez e usadas em várias páginas.
Quando uma peça melhora, todas as páginas que a usam melhoram juntas.

## Para quem
Para quem desenvolve. O usuário vê o resultado: perfis e formulários que funcionam do mesmo jeito.

## O que entrega

| Peça | O que faz | Onde é usada |
|---|---|---|
| `utilidades/` | Formata telefone, CEP, CPF, CNPJ (inclusive o novo alfanumérico), data e R$; confere CPF/CNPJ; desenha estrelas; foto reserva; pop-up que fecha clicando fora. | Login e perfis |
| `endereco/` | Endereço de todos os usuários: digita o CEP e rua, bairro, cidade e UF aparecem sozinhos (ViaCEP; reserva: BrasilAPI — grátis, sem chave). | Cadastro e 4 perfis |
| `senha/` | Regra única de senha (mínimo 12, bloqueia senhas comuns, sequências e dados pessoais) + medidor de força. | Cadastro, perfis e "Esqueceu a senha?" |
| `hora-rolante/` | Escolher hora em "rodinhas" (horas : minutos de 5 em 5), com rolagem, clique e teclado. Só existe hora válida. | Perfil CNPJ (horário de visitas) |
| `formulario/` | Visual dos campos (texto, senha com olho, caixas de marcar). | Login e perfis |
| `perfil-base/` | Tudo o que é igual nos perfis: abas, telefones, editar perfil, foto, excluir conta e interruptor liga/desliga. | 4 perfis |
| `carrossel/` | Galeria de fotos que passa para os lados. | Perfis CPF, CNPJ e Prestador |
| `servicos-realizados/` | Histórico dos serviços contratados, com fotos. O nome do prestador abre o perfil público dele. | Perfis CPF e CNPJ |
| `kanban-servicos/` | Quadro "Meus serviços" com as etapas de cada serviço. | Perfil do Prestador |
| `mapa/` | Mapa grátis (MapLibre + OpenFreeMap) com ponto "Você", prestadores e destaque em vermelho. Só baixa a biblioteca quando é usado. | Localizar prestador (e, no futuro, Localizar clientes) |

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
