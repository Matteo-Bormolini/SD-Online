# Entrar e criar conta

**Sprint 1 · Épico E2 Conta · 🟡 Tela pronta (login real na Sprint 5)**

É a porta de entrada da S.D. Aqui a pessoa entra na conta ou cria uma nova, escolhendo o tipo certo para ela.

## Para quem
Para todo visitante que quer usar a plataforma.

## O que entrega
- **Fazer login** com e-mail, CPF/CNPJ ou telefone, mais a senha (com botão de olho).
- **Criar login** em 3 tipos:
  - **Cliente CPF** — casas e apartamentos;
  - **Cliente CNPJ** — empresas e condomínios;
  - **Prestador** — exige CNPJ (MEI também tem CNPJ).
- Campos com formatação automática (CPF, CNPJ, telefone).
- Senha com no mínimo 8 caracteres, com letras e números.
- Autorização clara no cadastro: o que será mostrado e para quem (LGPD).
- "Esqueceu a senha?" e "Esqueceu o login?" mostram um aviso (dependem do servidor).
- **Entrar como (Demonstração):** permite testar o site com qualquer um dos 4 tipos.

## Histórias atendidas
- **US03** — criar conta escolhendo o tipo.
- **US04** — entrar e sair.
- **US05** — recuperar senha (Sprint 5).

## Pronto quando
- [x] Os 3 cadastros funcionam na tela, com campos obrigatórios e avisos de erro.
- [x] Depois de entrar, a pessoa vai para a página que queria ou para a Home.
- [ ] O servidor confere login e senha de verdade (Sprint 5).
- [ ] Recuperar senha e login funcionando (Sprint 5).
- [ ] Link para a Política de privacidade ao lado da autorização (quando o texto estiver pronto).

## Como testar
1. Abra `login-cadastro/index.html`.
2. Digite qualquer e-mail e senha, escolha **Entrar como** e clique em **Fazer login**.
3. Para sair, use **Sair** no menu.

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. |
| `login-cadastro.css` | Visual da página. |
| `login-cadastro.js` | Os 3 cadastros, máscaras, validações e o login de demonstração. |

**Onde mudar os campos de cada cadastro:** `login-cadastro.js`, objeto `TIPOS`.

**Endereços que o site usa:**
- `?acao=criar-conta` → abre direto em "Criar login".
- `?sair=1` → desconecta.
- `?destino=...` → mostra "Entre na sua conta para acessar essa área" e, depois de entrar, leva à página pedida.

> No modo demonstração, **nenhuma senha é guardada ou enviada.**
