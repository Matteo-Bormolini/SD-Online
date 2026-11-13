# Firebase (login e banco de dados)

A única pasta que conversa com o **Firebase** (plano grátis Spark): login (Authentication) e banco (Firestore).
As telas usam só `window.SDFirebase`. Site continua no **GitHub Pages**.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `firebase.js` | Conexão: entrar, sair, criar conta, nova senha, confirmar e-mail, ler/salvar/excluir perfil. **Bloco 1 = configuração do projeto.** |
| `firestore.rules` | Regras de segurança do banco. Copiar e colar no console (não funciona sozinho aqui no GitHub). **Bloco 1 = limites de tamanho.** |

## Como entra nas páginas
Último script do `<head>` de **toda** página (já colocado em todas):
```html
<script type="module" src="../firebase/firebase.js"></script>
```
`type="module"` não funciona abrindo o arquivo direto do PC (`file://`). Teste pelo GitHub Pages ou pelo Live Server do VS Code.

## Configurar no console (uma vez)
1. **Ligar o projeto:** Configurações do projeto → Seus apps → SDOnline Web → copie o `firebaseConfig` e cole no **bloco 1** de `firebase.js`.
   A `apiKey` pode ficar pública (é assim no Firebase). Quem protege são as regras.
2. **Regras do banco:** Firestore Database → **Regras** → apague tudo → cole `firestore.rules` → **Publicar**.
   Para voltar atrás: aba **Regras** → histórico (relógio, à esquerda) → versão anterior.
3. **Política de senha** (igual ao site): Authentication → Configurações → Política de senha →
   modo **Exigir** · **nenhuma** exigência de caracteres marcada · mínimo **6** · máximo **128**.
4. **Links dos e-mails abrem o site:** Authentication → Modelos → lápis de qualquer modelo →
   **Personalizar URL de ação** → `https://matteo-bormolini.github.io/SD-Online/login-cadastro/index.html` → Salvar.
5. **Domínio autorizado:** Authentication → Configurações → Domínios autorizados → `matteo-bormolini.github.io` (e `127.0.0.1` para testar no PC).

## Criar o administrador
1. No site, crie uma conta normal (Cliente CPF) com o e-mail do adm.
2. Console → Firestore Database → `usuarios` → documento dessa conta → campo `tipo` → troque para `adm` → Atualizar.
3. Saia e entre de novo no site. Ninguém consegue virar adm pelo site (as regras bloqueiam).

## Cadastro em 2 passos (desde v0.7.6)
1. A pessoa preenche o cadastro → o site cria o **login** e guarda os dados em `cadastrosPendentes/{uid}` (só ela vê). **Nenhum CPF/CNPJ é reservado.**
2. Ela clica no link do e-mail → o site cria o **perfil** + a **reserva** do CPF/CNPJ (com o tipo da conta) e apaga o pendente.
   Abriu o link em outro aparelho? Ao entrar com e-mail e senha (ou em "Já cliquei no link"), o cadastro é concluído.
- O CPF/CNPJ já tinha dono quando ela confirmou? O login é apagado e aparece "Este CPF/CNPJ já tem uma conta".
- Pendentes antigos (quem nunca confirmou): o adm pode apagar pelo console (`cadastrosPendentes`). Limpeza automática = pós-MVP (pago).

## Limites de tamanho dos campos
Ficam no **bloco 1** de `firestore.rules` (`LIMITES()` = caracteres · `MAXIMOS()` = itens de listas).
Ao mudar um limite, mude também na tela para a pessoa não digitar mais do que o banco aceita:

| Campo | Limite | Onde mudar na tela |
|---|---|---|
| nome (CPF/adm) | 120 | `maxlength` em `perfil-cliente-cpf/index.html`, `perfil-adm/index.html` · `max` em `login-cadastro/login-cadastro.js` |
| razaoSocial | 150 | `perfil-cliente-cnpj/index.html`, `perfil-prestador/index.html` · `login-cadastro.js` |
| nomeFantasia / responsavelNome / contatoNome | 120 | páginas de perfil CNPJ e prestador · `login-cadastro.js` (responsável) |
| responsavelCargo / contatoFuncao / tipoEstabelecimento | 60 | páginas de perfil CNPJ e prestador |
| sobre (prestador) | 600 | `perfil-prestador/index.html` |
| areaAtuacao | 80 | lista fixa da tela |
| horario / horarioObs | 80 | `perfil-prestador/index.html` · `perfil-cliente-cnpj/index.html` |
| bairrosAtendidos | 200 | `perfil-prestador/index.html` |
| especialidades | 8 itens · 40 cada | `perfil-prestador/perfil-prestador.js` (CONFIG) |
| certificacoes | 10 itens · 40 cada | `perfil-prestador/perfil-prestador.js` (CONFIG) |
| telefones | 5 (1 + 4) | `componentes/perfil-base/perfil-base.js` (CONFIG) |
| endereço: rua 150 · número 10 · complemento 60 · bairro 80 · cidade 80 | | `componentes/endereco/endereco.js` |
| e-mail | 254 | todas as telas (norma do e-mail) |

## Configurações do site (`configuracoes/site`)
- Criado sozinho na 1ª vez que o adm mexe no botão **Conferir CPF e CNPJ** (Perfil do adm → aba Administração).
- `conferirDocumentos`: `true` = confere CPF/CNPJ (na tela **e nas regras do banco**: dígitos verificadores) e consulta o CNPJ do prestador · `false` = **modo teste**.
- Todos leem; só o adm muda (regras).

## Selo de prestador verificado (pelo console, até existir a fila no site)
1. Firestore → `usuarios` → perfil do prestador → veja `cnpjConsulta` (`resultado`: ok, divergente, nao-encontrado, sem-resposta ou modo-teste).
2. Conferiu (se precisar, peça o CCMEI ou cartão CNPJ)? Adicione o campo `verificado` (booleano) = `true`.
3. A própria pessoa não consegue criar nem mudar `verificado` nem `cnpjConsulta` (regras).

## Padrão de e-mail confirmado
- Sem confirmar: **não** cria perfil nem reserva CPF/CNPJ (cadastro em 2 passos). Contas antigas sem confirmação continuam vendo o aviso.
- Ações com outras pessoas (busca, pedidos, orçamentos, avaliações — Ciclos 3 e 4): usar `emailConfirmado()` nas regras.

## Limites do plano grátis (conferido em 10/11/2026)
- Login: cerca de 3.000 usuários ativos por dia · e-mails de confirmação 1.000/dia · nova senha 150/dia.
- Banco: 1 GiB · 50 mil leituras e 20 mil gravações por dia.
- **Fotos não são salvas** (Cloud Storage exige o plano pago Blaze).

## Situação
- ✅ Login por e-mail, cadastro (CPF/CNPJ único), sair, nova senha pelo pop-up, confirmação de e-mail.
- ✅ Perfis com dados reais: editar, telefones, botões liga/desliga, excluir conta.
- ✅ Botão do adm "Conferir CPF e CNPJ", consulta do CNPJ do prestador, limpeza de cadastro parado no meio, aviso de e-mail em todas as páginas (v0.7.5).
- ✅ v0.7.6: cadastro em 2 passos, CPF/CNPJ conferido nas regras, tipo da conta travado na reserva, limite de tamanho por campo, lista fechada de campos, CSP.
- ⬜ Pedidos, orçamentos e avaliações reais (Ciclos 3 e 4) · login por CPF/CNPJ.
- ⏸️ Pago (pós-MVP): fotos no Storage, cookie HttpOnly, selo automático, limpeza automática de contas e de cadastros pendentes, consulta do CNPJ no servidor.
