# Entrar e criar conta

**Sprints 1 e 2 · Épico E2 Conta · 🟡 Tela pronta, com recuperação de acesso (login real na Sprint 5)**

É a porta de entrada da S.D. Aqui a pessoa entra na conta ou cria uma nova, escolhendo o tipo certo para ela.

## Para quem
Para todo visitante que quer usar a plataforma.

## O que entrega
- **Fazer login** com e-mail, CPF ou CNPJ, mais a senha (com botão de olho). O site confere se o que foi digitado é válido.
- **Criar login** em 3 tipos:
  - **Cliente CPF** — casas e apartamentos;
  - **Cliente CNPJ** — empresas e condomínios;
  - **Prestador** — exige CNPJ (MEI também tem CNPJ).
- Campos com formatação automática (CPF, CNPJ — inclusive o novo com letras —, telefone) e conferência dos dígitos do CPF/CNPJ.
- **E-mail obrigatório** nos 3 cadastros (é por ele que chega o link de nova senha).
- **Endereço separado:** digite o CEP e rua, bairro, cidade e UF aparecem sozinhos. Só o complemento é opcional.
- Sem "Nome de login" no Cliente CPF (decisão de 06/11/2026): e-mail, CPF ou CNPJ já identificam a conta.
- Senha com no mínimo **12 caracteres** (letras, números, espaços e símbolos), sem senhas comuns, com medidor de força.
- Autorização clara no cadastro: o que será mostrado e para quem (LGPD).
- **Recuperação de acesso em pop-ups** (sem páginas novas):
  - **Esqueceu a senha?** → e-mail → link de 30 minutos, uso único → pop-up "Criar nova senha".
  - **Esqueceu o login?** → não lembro o e-mail (usa CPF/CNPJ) · não lembro o CPF/CNPJ (usa o e-mail) · esqueci os dois (Suporte).
  - Clicar fora fecha **sem perder nada**; abrir de novo continua de onde parou.
  - **Cancelar solicitação** pede confirmação antes de apagar e recomeçar.
- **Entrar como (Demonstração):** permite testar o site com qualquer um dos 4 tipos.

## Histórias atendidas
- **US03** — criar conta escolhendo o tipo.
- **US04** — entrar e sair.
- **US05** — recuperar senha ou login (tela pronta; envio real do e-mail na Sprint 5).

## Pronto quando
- [x] Os 3 cadastros funcionam na tela, com campos obrigatórios e avisos de erro.
- [x] Depois de entrar, a pessoa vai para a página que queria ou para a Home.
- [ ] O servidor confere login e senha de verdade (Sprint 5).
- [x] Pop-ups de recuperação de senha e de login funcionando na demonstração.
- [ ] E-mail real com o link de nova senha (Sprint 5 — ver `seguranca/recuperacao-acesso.md`).
- [ ] Link para a Política de privacidade ao lado da autorização (quando o texto estiver pronto).

## Como testar
1. Abra `login-cadastro/index.html`.
2. Digite qualquer e-mail e senha, escolha **Entrar como** e clique em **Fazer login**.
3. Para sair, use **Sair** no menu.
4. **Esqueceu a senha?** Digite qualquer e-mail → clique em "Abrir o link de recuperação" (só na demonstração) → crie a nova senha.
   Para ver o aviso "igual à anterior", digite **Porta verde da cozinha**.
5. **Esqueceu o login?** Teste as 3 opções. Feche clicando fora e abra de novo: tudo continua lá.

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. |
| `login-cadastro.css` | Visual da página. |
| `login-cadastro.js` | Os 3 cadastros, máscaras, validações e o login de demonstração. |
| `recuperacao.js` | Os pop-ups "Esqueceu a senha?", "Criar nova senha", "Esqueceu o login?" e "Cancelar solicitação?". |

**Onde mudar os campos de cada cadastro:** `login-cadastro.js`, objeto `TIPOS`.

**Endereços que o site usa:**
- `?acao=criar-conta` → abre direto em "Criar login".
- `?sair=1` → desconecta.
- `?destino=...` → mostra "Entre na sua conta para acessar essa área" e, depois de entrar, leva à página pedida.
- `#redefinir=<token>` → link do e-mail de nova senha (abre o pop-up "Criar nova senha" e some da barra de endereço).

**Usa também:** `componentes/endereco/`, `componentes/senha/`, `servicos/identificadores.js` e `servicos/recuperacao.js`.

> No modo demonstração, **nenhuma senha é guardada ou enviada.**
