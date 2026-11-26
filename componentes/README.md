# Componentes

Peças prontas usadas por várias páginas. Mude aqui e todas as páginas mudam juntas.

## Peças
| Pasta | O que faz | Usada em |
|---|---|---|
| `utilidades/` | Funções comuns: formatar telefone, CEP, data e R$; conferir CPF/CNPJ; estrelas; fotos; pop-up. | Quase todas |
| `confirmacao/` | Pop-up **"Tem certeza?"** antes de excluir ou editar. **Padrão do site.** | Perfis e quadro |
| `formulario/` | Visual dos campos (caixas de texto, listas, erros). | Formulários |
| `endereco/` | Campos de endereço: o CEP preenche rua, bairro, cidade e UF. | Cadastro e perfis |
| `senha/` | Regra da senha (6+ caracteres) e medidor de força. | Cadastro, perfis, recuperação |
| `perfil-base/` | Partes comuns dos 4 perfis: abas, telefones, editar, excluir, botões liga/desliga. | Perfis |
| `carrossel/` | Fotos passando para os lados, com legenda. | Perfis e quadro |
| `kanban-servicos/` | Quadro do prestador: Contatos → Orçado → A realizar → Prestados + Encerrados (v0.8.0, ações por botão). | Seus Serviços (v0.8.7) |
| `pedidos/` | **v0.8.0** Aviso de cobrança, Pedir contato, "Você fez orçamento?", formulário do orçamento, bloco "Em orçamento". Carregado sozinho por `firebase/pedidos.js`. | Todas (logado) |
| `avisos/` | **v0.8.0** Sino de avisos na NavBar. Carregado sozinho por `firebase/pedidos.js`. | Todas (logado) |
| `servicos-realizados/` | Histórico de serviços do cliente, com fotos. | Perfis CPF e CNPJ |
| `datahora/` | Campo de data/hora: digitar, rodinhas (relógio) ou calendário; horários da semana. | Perfis CNPJ e Prestador |
| `lista-escolha/` | Escolher vários itens de uma lista (sem repetir), com "×" para remover. | Perfil do prestador |
| `mapa/` | Mapa grátis (MapLibre + OpenFreeMap). | Localizar prestador |
| `ver-como/` | **v0.8.5** Barra do adm: ver a página como Visitante, Cliente CPF, Cliente CNPJ ou Prestador. | Início |

## Como usar uma peça
1. Coloque o `.css` dela no `<head>`, depois do `base.css`.
2. Coloque o `.js` dela depois de `utilidades.js` e antes do script da página.
3. Leia o comentário no topo do `.js`: ele mostra como usar.

## Padrões que valem para todas
- Excluir ou editar → sempre `SDConfirmar(...)` antes.
- Botão liga/desliga → cadastrado em `configuracoes/interruptores.js`.
- Só cores do `base.css` (`var(--cor-...)`).
