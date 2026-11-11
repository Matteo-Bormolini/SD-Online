# Firebase (login e banco de dados)

A única pasta que conversa com o **Firebase** (plano grátis Spark): login (Authentication) e banco (Firestore).
As telas usam só `window.SDFirebase`. Site continua no **GitHub Pages**.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `firebase.js` | Conexão: entrar, sair, criar conta, nova senha, confirmar e-mail, ler/salvar/excluir perfil. **Bloco 1 = configuração do projeto.** |
| `firestore.rules` | Regras de segurança do banco. Copiar e colar no console (não funciona sozinho aqui no GitHub). |

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
3. **Política de senha** (igual ao site): Authentication → Configurações → Política de senha →
   modo **Exigir** · **nenhuma** exigência de caracteres marcada · mínimo **12** · máximo **128**.
4. **Links dos e-mails abrem o site:** Authentication → Modelos → lápis de qualquer modelo →
   **Personalizar URL de ação** → `https://matteo-bormolini.github.io/SD-Online/login-cadastro/index.html` → Salvar.
5. **Domínio autorizado:** Authentication → Configurações → Domínios autorizados → `matteo-bormolini.github.io` (e `127.0.0.1` para testar no PC).

## Criar o administrador
1. No site, crie uma conta normal (Cliente CPF) com o e-mail do adm.
2. Console → Firestore Database → `usuarios` → documento dessa conta → campo `tipo` → troque para `adm` → Atualizar.
3. Saia e entre de novo no site. Ninguém consegue virar adm pelo site (as regras bloqueiam).

## Limites do plano grátis (conferido em 10/11/2026)
- Login: cerca de 3.000 usuários ativos por dia · e-mails de confirmação 1.000/dia · nova senha 150/dia.
- Banco: 1 GiB · 50 mil leituras e 20 mil gravações por dia.
- **Fotos não são salvas** (Cloud Storage exige o plano pago Blaze).

## Situação
- ✅ Login por e-mail, cadastro (CPF/CNPJ único), sair, nova senha pelo pop-up, confirmação de e-mail.
- ✅ Perfis com dados reais: editar, telefones, botões liga/desliga, excluir conta.
- ⬜ Pedidos, orçamentos e avaliações reais (Ciclos 3 e 4) · fotos · login por CPF/CNPJ.
