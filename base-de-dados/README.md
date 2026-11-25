# Banco de dados (Firestore · v0.8.5)

Banco **Firestore** (Firebase, plano grátis). Só a pasta `firebase/` fala com ele. Regras: `firebase/firestore.rules` (áreas 00–80).
Senha: só no **Firebase Authentication** (com hash). Ninguém vê, nem o adm.

## Mapa das coleções
| Coleção | id do documento | Guarda | Lê | Grava | Apaga |
|---|---|---|---|---|---|
| `usuarios` | uid do login | Dados da conta (por tipo, abaixo) | dono, adm | dono (só campos do seu tipo), adm | dono (junto com `documentos`), adm |
| `cadastrosPendentes` | uid | Cadastro esperando o e-mail ser confirmado (`dados`, `criadoEm`) | dono, adm | dono | dono, adm |
| `documentos` | `cpf-<11>` ou `cnpj-<14>` | `{ uid, tipo, criadoEm }` → 1 conta por CPF/CNPJ | adm | dono (junto com o perfil) | dono (ao excluir a conta), adm |
| `vitrine` | uid do prestador | Cartão **público** (cópia resumida do perfil, sem CPF/CNPJ, e-mail ou endereço) | clientes, adm, o próprio | o próprio prestador | o próprio, adm |
| `configuracoes` | `site` | Comandos do site: `conferirDocumentos`, `mostrarDestaques` | todos | adm | — |
| `orcamentos` | `<pedidoId>_<prestadorUid>` | 1 contato/orçamento por prestador em cada pedido | cliente e prestador dele, adm | cada lado só o que é seu (área 50) | cliente, prestador (se terminou), adm |
| `avisos` | `<orcamentoId>_<tipo>` | Sino: 1 aviso de cada tipo por orçamento | quem recebe | quem participa do orçamento (tipo = situação real) | quem recebe |
| `fotos` | aleatório | 1 foto compactada (texto) por documento | dono, adm, clientes (trabalho), prestador do contato (pedido) | dono | dono, adm |
| `divulgacoes` | aleatório | Comunicados, anúncios, eventos e grupos da Home | por público (área 80), adm | adm | adm |

## Relações (quem aponta para quem)
```
usuarios/{uid} ──1:1── vitrine/{uid}            (só prestador)
usuarios/{uid} ──1:1── documentos/{cpf|cnpj-…}  (chave = usuarios.documentoChave)
orcamentos.clienteUid / prestadorUid ──► usuarios/{uid}
orcamentos.pedidoId  = agrupa os prestadores chamados no MESMO pedido (mesmo cliente + mesmo serviço)
orcamentos.fotos[]   ──► fotos/{id}   (fotos.ref = id do orçamento)
avisos.orcamentoId   ──► orcamentos/{id}
usuarios.fotosTrabalho[] / fotosLocal[] ──► fotos/{id}
```

## Campos de `usuarios`
- **Todos:** `tipo` (cliente-cpf · cliente-cnpj · prestador · adm) · `email` · `documento` · `documentoChave` · `telefones` [{ numero, principal }] · `cep`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `uf` · `local` { lat, lng, precisao } · `interruptores` { localizacao, mostrar-contatos, compartilhar-dados-cpf, destaque } · `foto` · `criadoEm`, `atualizadoEm`.
- **CPF:** `nome`, `compartilharDados`, `compartilharDadosEm`.
- **CNPJ:** `razaoSocial`, `nomeFantasia`, `responsavelNome`, `responsavelCargo`, `tipoEstabelecimento`, `autorizacaoExibir`, `contatoNome`, `contatoFuncao`, `contatoTelefone`, `horarioVisitas`, `fotosLocal`.
- **Prestador:** os do CNPJ (menos local/visitas) + `areaAtuacao`, `especialidades`, `certificacoes`, `sobre`, `anoInicio`, `raioKm`, `emergencia`, `horarioAtendimento`, `cidadesAtendidas`, `cobraVisita`, `valorVisita`, `fotosTrabalho`, `cnpjConsulta`. Antigos (só podem ser apagados): `horario`, `bairrosAtendidos`.
- **Só o adm muda:** `tags`, `avaliacao` { media, total }, `servicosAnteriores`, `cargoBase`, `verificado`, `interruptores.destaque`.
- **Adm:** `nome` + comuns.

## Campos de `orcamentos`
`pedidoId`, `clienteUid`, `prestadorUid`, `situacao`, `origem` (whatsapp · pedido), `categoria`, `servico`, `clienteNome`, `clienteTipo`, `clienteRegiao`, `prestadorNome` · datas `contatoEm`, `ultimoContatoEm`, `respondidoEm`, `decididoEm`, `concluidoEm`, `prestadoEm`, `atualizadoEm`, `apagarEm` (+1 ano) · `orcamento` { descricao, valorTotal, validadeDias, … } · `mensagem`, `fotos`, `whatsapp` (só "Pedir contato") · `arquivadoPrestador`.
Situações: `contato` → `orcado` | `nao-orcou` | `expirado` → `escolhido` | `nao-escolhido` | `cancelado` | `encerrado` → `concluido` → `prestado`.

## Limpeza automática (sem servidor: feita quando a pessoa abre o site)
- Contato sem resposta há 10 dias → `expirado`.
- Orçamento com mais de 1 ano → apagado (o cliente apaga também as fotos do "Pedir contato").
- Aviso com mais de 30 dias → apagado.
- Cliente apaga um contato → as fotos dele saem junto.

## Índices (Firestore → Índices → Compostos)
Só 1 é usado: `divulgacoes` · `situacao` (Crescente) + `publico` (Crescente). O índice antigo `situacao` + `atividades` não é mais usado (pode apagar).

## Pontos em aberto
- **Destaque pago:** o adm liga `interruptores.destaque` no perfil, mas a `vitrine` não leva essa marca → hoje nenhum destaque aparece na busca (a legenda só aparece quando houver).
- **Avaliações:** chegam no Ciclo 4 (coleção nova).
- `cadastrosPendentes` abandonado (pessoa nunca confirmou o e-mail) fica no banco; o adm pode apagar pelo console.
