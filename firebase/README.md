# Firebase (login e banco de dados)

A única pasta que conversa com o **Firebase** (plano grátis Spark): login (Authentication) e banco (Firestore).
As telas usam só `window.SDFirebase`. O site continua no **GitHub Pages**.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `firebase.js` | Conexão: entrar, sair, criar conta, nova senha, confirmar e-mail, ler/salvar/excluir perfil. **Bloco 1 = configuração do projeto.** |
| `fotos.js` | Fotos compactadas no banco (coleção `fotos`), grátis. |
| `pedidos.js` | Contatos/orçamentos (coleção `orcamentos`) e avisos do sino (coleção `avisos`). |
| `divulgacoes.js` | Comunicados, anúncios, eventos e grupos da Home (coleção `divulgacoes`). |
| `firestore.indexes.json` | Índice da coleção `divulgacoes` (já criado no console). |
| `firestore.rules` | Regras de segurança do banco. Só valem depois de coladas e publicadas no console. |

## Uso no dia a dia
| Preciso… | Como fazer |
|---|---|
| Publicar regras novas | Console → Firestore Database → **Regras** → apagar tudo → colar o texto novo → **Publicar**. Conferir a linha 2 (versão). |
| Voltar às regras anteriores | Firestore Database → **Regras** → histórico (relógio, à esquerda) → versão anterior → Publicar. |
| Criar outro administrador | 1) No site, criar uma conta Cliente CPF com o e-mail da pessoa. 2) Console → Firestore → `usuarios` → documento da conta → campo `tipo` = `adm`. 3) A pessoa sai e entra de novo. |
| Dar o selo **verificado** a um prestador | Firestore → `usuarios` → perfil do prestador → olhar `cnpjConsulta` (se precisar, pedir o cartão CNPJ ou CCMEI) → criar o campo `verificado` (booleano) = `true`. |
| Publicar comunicado, anúncio, evento ou grupo | No site: Perfil do adm → aba **Divulgações**. |
| Ligar/desligar Conferir CPF e CNPJ ou Mostrar destaques | No site: Perfil do adm → aba **Administração**. |
| Apagar cadastro que nunca confirmou o e-mail | Firestore → `cadastrosPendentes` → apagar o documento. O login fica em Authentication → **Usuários** (pode apagar também). |
| Pessoa travada em "Muitas tentativas seguidas" | Esperar alguns minutos ou usar **Esqueceu a senha?** no site. |
| E-mail de confirmação ou de nova senha não chegou | Olhar o spam e usar **Reenviar** no site. Limite do plano grátis: 1.000 confirmações e 150 novas senhas por dia. |
| Ver quanto do plano grátis foi usado | Console → Firestore Database → aba **Uso**. |
| Mudar um limite de tamanho (ex.: nome, "sobre") | Na área certa de `firestore.rules` (marcada com `← MUDE AQUI`) **e** na tela. Lista completa: [`docs/guia-tecnico.md`](../docs/guia-tecnico.md), seção 13. |

Detalhes técnicos (como entra nas páginas, configuração inicial, mapa das áreas das regras, limites de cada campo e campos para cadastrar divulgação pelo console): [`docs/guia-tecnico.md`](../docs/guia-tecnico.md), seção 13.

## Segurança (o que faz)
- **Regras do banco:** tudo que não está liberado é proibido. Cada conta lê e grava só o que é dela. Ninguém muda o próprio tipo de conta nem o selo verificado; os comandos do site só o adm muda.
- **Senha:** só o Firebase guarda, com hash. Ninguém vê, nem o adm.
- **Cadastro em 2 passos:** perfil e CPF/CNPJ só são gravados depois de confirmar o e-mail. 1 CPF/CNPJ = 1 conta.
- **Login:** bloqueio do próprio Firebase depois de várias senhas erradas.
- A `apiKey` do `firebase.js` pode ficar pública (é assim no Firebase). Quem protege são as regras.

## Limites do plano grátis (conferido em 10/11/2026 e 18/11/2026)
- Login: cerca de 3.000 usuários ativos por dia · e-mails de confirmação 1.000/dia · nova senha 150/dia.
- Banco: 1 GiB · 50 mil leituras e 20 mil gravações por dia.
- Fotos ficam no próprio banco, compactadas (o Cloud Storage exige o plano pago desde 03/02/2026). 1 GiB ≈ 8 a 15 mil fotos. Cada abertura de foto conta no limite de 10 GiB/mês de download.

## Situação
✅ pronto · ⬜ a fazer · ⏸️ pago (depois do MVP)

- ✅ Login por e-mail, cadastro em 2 passos (CPF/CNPJ único), sair, nova senha, confirmação de e-mail.
- ✅ Bloqueio de tentativas do login testado no site publicado (27/11/2026).
- ✅ Perfis reais, cartão público do prestador (vitrine), contatos/orçamentos, sino, fotos grátis, divulgações da Home e comandos do adm.
- ✅ Regras v0.8.6 publicadas e testadas no site publicado (25 e 26/11/2026).
- ⬜ Avaliações — **Ciclo 4**. Revisão de segurança e LGPD — **Ciclo 5**. Login por CPF/CNPJ — depois do MVP.
- ⏸️ Fotos no Storage, aviso por e-mail/celular, prazos automáticos sem abrir o site, cookie HttpOnly, selo automático, limpeza automática de contas e cadastros pendentes, consulta do CNPJ no servidor.
